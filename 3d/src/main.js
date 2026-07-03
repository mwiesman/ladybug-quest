// The Ladybug Quest 3D — bootstrap and main loop.
// A 3D reimagining of the 8-bit game that shares its data layer:
// dialog, trades, items, area graph, and cutscene text are all imported
// from the original src/data files.

import * as THREE from 'three';
import { state, MODE, toX, toZ } from './state.js';
import { buildAllAreas } from './areas3d.js';
import { buildGirl, buildBoy, NPC_BUILDERS } from './characters.js';
import { player, initInput, updatePlayer, updateCamera, checkAreaTransition, updateTransition } from './player.js';
import { checkInteraction, checkNearInteractable, getNPCPosition } from './quest.js';
import { advanceDialog, acceptTrade, declineTrade, isDialogOpen, showDialog, closeDialog, showProposalPrompt, hideProposalPrompt } from './dialog.js';
import { initTouch, isTouchDevice, clearTouchTarget } from './touch.js';
import { initHUD, setInteractPrompt, toggleInventory, showAreaLabel, showCutsceneOverlay, setCutsceneText, updateInventoryDisplay, showItemNotification } from './hud.js';
import { initAudio, playMusic, resumeAudioOnInteraction, toggleMute } from '../../src/systems/audio.js';
import { saveGame, loadSaveData, applySaveData, hasSave, deleteSave } from './save.js';
import { INTRO_CUTSCENE, ENDING_CUTSCENE } from '../../src/data/cutscenes.js';
import { inventory } from './state.js';

// --- Renderer / scene --------------------------------------------------

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('app').prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fd4f0);
scene.fog = new THREE.Fog(0x9fd4f0, 22, 48);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 8, 12);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Lighting: warm sun + soft sky fill
const sun = new THREE.DirectionalLight(0xfff2dd, 2.2);
sun.position.set(10, 16, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -20;
sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20;
sun.shadow.camera.bottom = -20;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xbde4ff, 0x4a7a3a, 1.1));

// --- World -------------------------------------------------------------

const areas = buildAllAreas(state);
for (const area of Object.values(areas)) scene.add(area.group);

// Player
const girl = buildGirl();
scene.add(girl);

// Boy (meadow) — position tracked from state.boy so he can walk over
// during the proposal sequence
const boy = buildBoy();
areas.meadow.group.add(boy);
boy.position.set(toX(state.boy.x), 0, toZ(state.boy.y));

// NPC meshes, parented into their area groups at shared logical positions
const npcMeshes = {};
for (const [id, npc] of Object.entries(state.npcs)) {
  const build = NPC_BUILDERS[id];
  if (!build) continue;
  const mesh = build();
  mesh.position.set(toX(npc.x), npc.flies ? 1.6 : 0, toZ(npc.y));
  areas[npc.area].group.add(mesh);
  npcMeshes[id] = mesh;
}

function setActiveArea(areaId) {
  for (const [id, area] of Object.entries(areas)) {
    area.group.visible = id === areaId;
  }
}
setActiveArea(state.currentArea);

// --- Proposal sequence (boy stops girl before she first leaves the meadow;
// port of the sequence in the 8-bit main.js) ------------------------------

function updateProposal(dt) {
  if (state.proposalPhase < 0 || state.proposalDone) return false;

  if (isDialogOpen()) {
    // Frozen while a dialog line is showing
  } else if (state.proposalDialogStep === 0) {
    showDialog({ dialog: ['Wait!'], isStatic: true, speaker: 'boy' });
    state.proposalDialogStep = 1;
  } else if (state.proposalDialogStep === 1) {
    // Boy walks from the oak to the girl (~1s)
    state.proposalPhase += dt * 60;
    const walkDuration = 60;
    const boyStartX = 290, boyStartY = 270;
    const boyEndX = player.x - 30, boyEndY = player.y;
    const p = Math.min(state.proposalPhase / walkDuration, 1);
    state.boy.x = boyStartX + (boyEndX - boyStartX) * p;
    state.boy.y = boyStartY + (boyEndY - boyStartY) * p;
    if (state.proposalPhase >= walkDuration) {
      state.proposalDialogStep = 2;
    }
  } else if (state.proposalDialogStep === 2) {
    showDialog({
      dialog: ['Adielle. I love you more than anything\ncomprehendable in the universe\nProbably even more than Snoopy'],
      isStatic: true, speaker: 'boy'
    });
    state.proposalDialogStep = 3;
  } else if (state.proposalDialogStep === 3) {
    showProposalPrompt(false);
    state.proposalDialogStep = 4;
  }
  return true; // block normal gameplay while active
}

function acceptProposal() {
  hideProposalPrompt();
  state.proposalDialogStep = 5;
  showDialog({
    dialog: ['*gives ring* *hugs* *cries* *the usual*'],
    isStatic: true, speaker: 'boy'
  });
}

function declineProposal() {
  showProposalPrompt(true); // she can only say yes
}

function finishProposal() {
  state.proposalDone = true;
  state.proposalPhase = -1;
  state.proposalDialogStep = 0;
  spawnHearts();
  saveGame();
}

// Floating hearts above the newly engaged couple
const hearts = [];

function makeHeartTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  ctx.font = '52px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('❤️', 32, 36);
  return new THREE.CanvasTexture(c);
}

function spawnHearts() {
  const tex = makeHeartTexture();
  const cx = (toX(player.x) + toX(state.boy.x)) / 2;
  const cz = (toZ(player.y) + toZ(state.boy.y)) / 2;
  for (let i = 0; i < 9; i++) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.scale.setScalar(0.35 + Math.random() * 0.25);
    sprite.position.set(cx + (Math.random() - 0.5) * 1.6, 1.2 + Math.random() * 0.4, cz + (Math.random() - 0.5) * 1.2);
    scene.add(sprite);
    hearts.push({ sprite, vy: 0.5 + Math.random() * 0.4, life: 2.5 + Math.random() });
  }
}

function updateHearts(dt) {
  for (let i = hearts.length - 1; i >= 0; i--) {
    const h = hearts[i];
    h.life -= dt;
    h.sprite.position.y += h.vy * dt;
    h.sprite.material.opacity = Math.min(1, h.life);
    if (h.life <= 0) {
      scene.remove(h.sprite);
      h.sprite.material.dispose();
      hearts.splice(i, 1);
    }
  }
}

// --- Per-frame world updates -------------------------------------------

let gateOpenT = 0;

function updateWorldVisuals(dt) {
  const t = state.elapsed;

  // Bird: flies a sine path until talked to, wings flap
  const birdMesh = npcMeshes.bird;
  if (birdMesh) {
    const pos = getNPCPosition(state.npcs.bird);
    const height = state.birdStopped ? 0.25 : 1.6 + Math.sin(t * 2.5) * 0.2;
    birdMesh.position.set(toX(pos.x), height, toZ(pos.y));
    // Robin faces its direction of flight (sine path along x); faces +z when landed
    birdMesh.rotation.y = state.birdStopped ? 0 : (Math.cos(t * 1.2) > 0 ? Math.PI / 2 : -Math.PI / 2);
    const flap = state.birdStopped ? 0.05 : Math.sin(t * 14) * 0.6;
    const wingL = birdMesh.getObjectByName('wingL');
    const wingR = birdMesh.getObjectByName('wingR');
    if (wingL) wingL.rotation.z = 0.15 + flap;
    if (wingR) wingR.rotation.z = -0.15 - flap;
  }

  // Squirrel darts to the acorn pile once the gate opens
  const squirrelMesh = npcMeshes.squirrel;
  if (squirrelMesh) {
    const pos = getNPCPosition(state.npcs.squirrel);
    const tx = toX(pos.x), tz = toZ(pos.y);
    squirrelMesh.position.x += (tx - squirrelMesh.position.x) * Math.min(1, dt * 3);
    squirrelMesh.position.z += (tz - squirrelMesh.position.z) * Math.min(1, dt * 3);
    squirrelMesh.position.y = Math.abs(Math.sin(t * 8)) * 0.06;
  }

  // Dog tail wag, side to side (faster once it has its ball)
  const dogMesh = npcMeshes.dog;
  if (dogMesh) {
    const tail = dogMesh.getObjectByName('tail');
    const rate = state.npcs.dog.completed ? 18 : 6;
    if (tail) tail.rotation.z = Math.sin(t * rate) * 0.45;
  }

  // Squirrel tail sways gently
  if (squirrelMesh) {
    const sqTail = squirrelMesh.getObjectByName('tail');
    if (sqTail) sqTail.rotation.x = Math.sin(t * 2.2) * 0.12;
  }

  // Gate swings open
  const gate = areas.gate_area.refs.gate;
  if (state.gateUnlocked && gateOpenT < 1) {
    gateOpenT = Math.min(1, gateOpenT + dt * 1.2);
    gate.rotation.y = -gateOpenT * Math.PI * 0.55;
  }

  // Logs vanish when cleared
  areas.gate_area.refs.logs.visible = !state.logsCleared;

  // Birdseed disappears from the feeder when collected
  areas.park.refs.birdseedMesh.visible = !state.worldItems.birdseed.collected;

  // Doubloon leaf pile settles once looted
  areas.woods.refs.doubloonsMesh.visible = !state.worldItems.doubloons.collected;

  // Ladybug appears near the oak once you carry the Net
  const ladybug = areas.meadow.refs.ladybug;
  ladybug.visible = inventory.hasItem('Net') && !state.ladybug.found;
  if (ladybug.visible) {
    ladybug.position.y = 0.05 + Math.sin(t * 3) * 0.03;
  }

  // Water shimmer
  const water = areas.boathouse.refs.water;
  water.material.opacity = 0.85 + Math.sin(t * 1.7) * 0.05;

  // Player mesh
  girl.position.set(toX(player.x), 0, toZ(player.y));
  girl.rotation.y = player.facing;
  girl.position.y = player.moving ? Math.abs(Math.sin(t * 10)) * 0.06 : 0;

  // Boy mesh follows his logical position (walks over during the proposal)
  boy.position.x = toX(state.boy.x);
  boy.position.z = toZ(state.boy.y);
  if (state.proposalPhase >= 0 || state.proposalDone) {
    boy.rotation.y = Math.atan2(girl.position.x - boy.position.x, girl.position.z - boy.position.z);
    if (state.proposalDialogStep === 1) {
      boy.position.y = Math.abs(Math.sin(t * 10)) * 0.06; // walking bob
    }
  }
  // During the proposal, the girl turns to face him
  if (state.proposalPhase >= 0 && !state.proposalDone && state.proposalDialogStep >= 2) {
    girl.rotation.y = Math.atan2(boy.position.x - girl.position.x, boy.position.z - girl.position.z);
  }

  // NPCs turn to face the player when close (little life without animation
  // rigs) — except the bird (flight heading) and the coffee shack (a building)
  for (const [id, npc] of Object.entries(state.npcs)) {
    if (npc.area !== state.currentArea || id === 'bird' || id === 'coffeeCart') continue;
    const mesh = npcMeshes[id];
    if (!mesh) continue;
    const pos = getNPCPosition(npc);
    const dist = Math.hypot(player.x - pos.x, player.y - pos.y);
    if (dist < 90) {
      mesh.rotation.y = Math.atan2(toX(player.x) - mesh.position.x, toZ(player.y) - mesh.position.z);
    }
  }
}

// --- Cutscenes (intro / ending / credits) --------------------------------

let cutscene = { script: INTRO_CUTSCENE, index: -1 };

function startCutscene(script, onDone) {
  cutscene = { script, index: -1, onDone };
  showCutsceneOverlay(true);
  advanceCutscene();
}

function advanceCutscene() {
  cutscene.index++;
  if (cutscene.index >= cutscene.script.length) {
    showCutsceneOverlay(false);
    setCutsceneText('', false);
    cutscene.onDone?.();
    return;
  }
  setCutsceneText('', false);
  const beat = cutscene.script[cutscene.index];
  setTimeout(() => setCutsceneText(beat.text, true), 60);
}

function showCredits() {
  state.mode = MODE.CREDITS;
  state.ladybug.found = true;
  saveGame();
  showCutsceneOverlay(true);
  setCutsceneText(
    'The Ladybug Quest 3D\n\nA story of infinite beginnings,\nnow with one more dimension.\n\n— Press SPACE to play again —',
    true
  );
}

function restart() {
  window.location.reload();
}

// --- Input wiring ---------------------------------------------------------

initInput();
initHUD();

function handleAction() {
  resumeAudioOnInteraction();
  if (showingSavePrompt) return; // must pick Continue / New Game

  // Proposal: the Yes/No prompt only answers via its buttons; the ring
  // dialog closes into finishProposal
  if (state.proposalDialogStep === 4) return;
  if (state.proposalDialogStep === 5 && isDialogOpen()) {
    closeDialog();
    finishProposal();
    return;
  }

  switch (state.mode) {
    case MODE.INTRO:
    case MODE.ENDING:
      advanceCutscene();
      break;
    case MODE.CREDITS:
      restart();
      break;
    case MODE.DIALOG:
      advanceDialog();
      break;
    case MODE.PLAYING:
      if (isDialogOpen()) {
        advanceDialog(); // static dialogs keep mode = PLAYING
        break;
      }
      if (state.proposalPhase >= 0 && !state.proposalDone) break;
      triggerInteraction();
      break;
  }
}

function triggerInteraction() {
  if (checkInteraction() === 'ending') {
    state.mode = MODE.ENDING;
    startCutscene(ENDING_CUTSCENE, showCredits);
  }
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'Enter') {
    e.preventDefault();
    handleAction();
  } else if (e.code === 'KeyI' && state.mode === MODE.PLAYING) {
    toggleInventory();
  } else if (e.code === 'KeyM') {
    showItemNotification(toggleMute() ? 'Muted' : 'Sound On', 'action');
  } else if (e.code === 'KeyP' && state.mode === MODE.PLAYING) {
    saveGame();
    showItemNotification('Game Saved', 'action');
  }
});

document.getElementById('cutscene').addEventListener('click', () => {
  if (showingSavePrompt) return; // buttons handle this screen
  if (state.mode === MODE.INTRO || state.mode === MODE.ENDING) advanceCutscene();
  else if (state.mode === MODE.CREDITS) restart();
});
document.getElementById('tradeYes').addEventListener('click', () => {
  if (state.proposalDialogStep === 4) acceptProposal();
  else acceptTrade();
});
document.getElementById('tradeNo').addEventListener('click', () => {
  if (state.proposalDialogStep === 4) declineProposal();
  else declineTrade();
});

// Touch: tap-to-move / tap-to-interact
initTouch(camera, renderer.domElement, handleAction);
if (isTouchDevice()) {
  document.getElementById('controlsHint').textContent = 'Tap ground — walk · Tap characters — talk';
  document.getElementById('interactPrompt').innerHTML = 'Tap to interact';
  document.getElementById('dialogPromptHint').textContent = '▼ Tap to continue';
  document.getElementById('cutsceneHint').textContent = 'Tap to continue';
}

// --- Boot: audio + Continue/New Game prompt --------------------------------

initAudio('../'); // shared public/audio/ folder is one level up from /3d/

const savePromptEl = document.getElementById('savePrompt');
const cutsceneHintEl = document.getElementById('cutsceneHint');
let showingSavePrompt = false;

function startNewGame() {
  playMusic('cutscene');
  startCutscene(INTRO_CUTSCENE, () => {
    state.mode = MODE.PLAYING;
    showAreaLabel(state.currentArea);
    playMusic(state.currentArea);
  });
}

document.getElementById('saveContinueBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  if (!showingSavePrompt) return;
  resumeAudioOnInteraction();
  applySaveData(loadSaveData());
  updateInventoryDisplay();
  setActiveArea(state.currentArea);
  showingSavePrompt = false;
  savePromptEl.classList.remove('active');
  cutsceneHintEl.style.display = '';
  showCutsceneOverlay(false);
  state.mode = MODE.PLAYING;
  showAreaLabel(state.currentArea);
  playMusic(state.currentArea);
});

document.getElementById('saveNewBtn').addEventListener('click', (e) => {
  e.stopPropagation();
  if (!showingSavePrompt) return;
  resumeAudioOnInteraction();
  deleteSave();
  showingSavePrompt = false;
  savePromptEl.classList.remove('active');
  cutsceneHintEl.style.display = '';
  startNewGame();
});

// --- Main loop -------------------------------------------------------------

if (hasSave()) {
  showingSavePrompt = true;
  showCutsceneOverlay(true);
  setCutsceneText('Welcome back.', true);
  savePromptEl.classList.add('active');
  cutsceneHintEl.style.display = 'none';
} else {
  startNewGame();
}

// Dev/debug hook (also handy in the browser console)
window.__LBQ3D = { state, player, setActiveArea };

const clock = new THREE.Clock();

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  state.elapsed += dt;

  const inTransition = updateTransition(dt, (newArea, oldArea) => {
    setActiveArea(newArea);
    if (oldArea === 'meadow') {
      // Boy returns to his resting spot by the oak
      state.boy.x = 290;
      state.boy.y = 270;
    }
  });

  let showPrompt = false;
  if (state.mode === MODE.PLAYING && !inTransition) {
    const proposalActive = updateProposal(dt);
    if (!proposalActive && !isDialogOpen()) {
      const moved = updatePlayer(dt, areas[state.currentArea].obstacles);
      if (moved === 'arrived-interact') triggerInteraction();

      // The boy stops her before she can first leave the meadow
      if (state.currentArea === 'meadow' && !state.proposalDone &&
          state.proposalPhase === -1 && player.x >= 578) {
        state.proposalPhase = 0;
        state.proposalDialogStep = 0;
        clearTouchTarget();
      } else {
        checkAreaTransition();
      }
      showPrompt = checkNearInteractable();
    }
  }
  setInteractPrompt(showPrompt);

  updateHearts(dt);
  updateWorldVisuals(dt);
  updateCamera(camera, dt);
  renderer.render(scene, camera);
}

loop();
