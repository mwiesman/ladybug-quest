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
import { advanceDialog, acceptTrade, declineTrade, isDialogOpen } from './dialog.js';
import { initHUD, setInteractPrompt, toggleInventory, showAreaLabel, showCutsceneOverlay, setCutsceneText } from './hud.js';
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

// Boy (meadow)
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
    birdMesh.rotation.y = state.birdStopped ? 0 : Math.cos(t * 1.2) > 0 ? 0 : Math.PI;
    const flap = state.birdStopped ? 0.1 : Math.sin(t * 14) * 0.7;
    const wingL = birdMesh.getObjectByName('wingL');
    const wingR = birdMesh.getObjectByName('wingR');
    if (wingL) wingL.rotation.x = flap;
    if (wingR) wingR.rotation.x = -flap;
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

  // Dog tail wag (faster once it has its ball)
  const dogMesh = npcMeshes.dog;
  if (dogMesh) {
    const tail = dogMesh.getObjectByName('tail');
    const rate = state.npcs.dog.completed ? 18 : 6;
    if (tail) tail.rotation.x = Math.sin(t * rate) * 0.5;
    dogMesh.rotation.y = -0.4;
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

  // NPCs turn to face the player when close (little life without animation rigs)
  for (const [id, npc] of Object.entries(state.npcs)) {
    if (npc.area !== state.currentArea || id === 'bird') continue;
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
      if (checkInteraction() === 'ending') {
        state.mode = MODE.ENDING;
        startCutscene(ENDING_CUTSCENE, showCredits);
      }
      break;
  }
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'Enter') {
    e.preventDefault();
    handleAction();
  } else if (e.code === 'KeyI' && state.mode === MODE.PLAYING) {
    toggleInventory();
  }
});

document.getElementById('cutscene').addEventListener('click', () => {
  if (state.mode === MODE.INTRO || state.mode === MODE.ENDING) advanceCutscene();
  else if (state.mode === MODE.CREDITS) restart();
});
document.getElementById('tradeYes').addEventListener('click', acceptTrade);
document.getElementById('tradeNo').addEventListener('click', declineTrade);

// --- Main loop -------------------------------------------------------------

startCutscene(INTRO_CUTSCENE, () => {
  state.mode = MODE.PLAYING;
  showAreaLabel(state.currentArea);
});

// Dev/debug hook (also handy in the browser console)
window.__LBQ3D = { state, player, setActiveArea };

const clock = new THREE.Clock();

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05);
  state.elapsed += dt;

  const inTransition = updateTransition(dt, (newArea) => setActiveArea(newArea));

  if (state.mode === MODE.PLAYING && !inTransition && !isDialogOpen()) {
    updatePlayer(dt, areas[state.currentArea].obstacles);
    checkAreaTransition();
    setInteractPrompt(checkNearInteractable());
  } else {
    setInteractPrompt(false);
  }

  updateWorldVisuals(dt);
  updateCamera(camera, dt);
  renderer.render(scene, camera);
}

loop();
