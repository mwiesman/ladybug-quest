// The Ladybug Quest - main entry point
// Initializes all systems and runs the game loop

import './styles.css';

import { state, GAME_STATE, resetState } from './game/state.js';
import { player, resetPlayer } from './game/player.js';
import { checkAreaTransition, updateTransition } from './game/world.js';
import { initInput, keys } from './systems/input.js';
import { inventory } from './systems/inventory.js';
import { showDialog, advanceDialog, closeDialog, declineDialog } from './systems/dialog.js';
import { checkInteraction, checkNearInteractable } from './systems/interaction.js';
import { checkCollision } from './systems/collision.js';
import { setContext as setSpritesCtx, drawPlayer, drawBoy, drawTree, drawLargeTree, drawLadybug } from './rendering/sprites.js';
import { setContext as setAreasCtx, drawCompleteArea } from './rendering/areas.js';
import { setContext as setUICtx, drawInteractionPrompt, showSaveNotification, drawSaveNotification, drawItemNotification, drawMap } from './rendering/ui.js';
import { INTRO_CUTSCENE, ENDING_CUTSCENE } from './data/cutscenes.js';
import { initSprites } from './rendering/spriteLoader.js';
import { initAudio, playMusic, stopMusic, toggleMute, resumeAudioOnInteraction } from './systems/audio.js';
import { saveGame, loadSaveData, applySaveData, hasSave, deleteSave } from './systems/save.js';

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Pass canvas context to all rendering modules
setSpritesCtx(ctx);
setAreasCtx(ctx, canvas.width, canvas.height);
setUICtx(ctx, canvas.width, canvas.height);

// DOM references
const cutsceneOverlay = document.getElementById('cutsceneOverlay');
const cutsceneText = document.getElementById('cutsceneText');
const skipButton = document.getElementById('skipButton');
const credits = document.getElementById('credits');
const savePrompt = document.getElementById('savePrompt');

let showingSavePrompt = false;

// Input
initInput(handleSpacePress, handleRestart, handleMuteToggle, handleEscape, handleManualSave, handleContinue, handleNewGame, handleMapToggle);

skipButton.addEventListener('click', skipCutscene);

function handleSpacePress() {
  resumeAudioOnInteraction();

  if (state.currentState === GAME_STATE.CUTSCENE_INTRO ||
      state.currentState === GAME_STATE.CUTSCENE_ENDING) {
    // Advance to next cutscene beat
    advanceCutscene();
  } else if (state.currentState === GAME_STATE.DIALOG || state.currentDialog) {
    // Handle dialog in DIALOG state or during INTRO_ANIMATION (static dialog)
    advanceDialog();
  } else if (state.currentState === GAME_STATE.PLAYING) {
    checkInteraction();
  }
}

function handleRestart() {
  if (state.currentState === GAME_STATE.CREDITS) {
    restartGame();
  }
}

function handleMuteToggle() {
  toggleMute();
}

function handleEscape() {
  if (state.tradePrompted) {
    declineDialog();
  }
}

function handleManualSave() {
  if (state.currentState === GAME_STATE.PLAYING) {
    saveGame();
    showSaveNotification();
  }
}

function handleContinue() {
  if (!showingSavePrompt) return;
  resumeAudioOnInteraction();
  const data = loadSaveData();
  if (data) {
    applySaveData(data);
    cutsceneOverlay.classList.remove('active');
    inventory.updateDisplay();
    playMusic(state.currentArea);
    showingSavePrompt = false;
  }
}

function handleNewGame() {
  if (!showingSavePrompt) return;
  resumeAudioOnInteraction();
  deleteSave();
  savePrompt.classList.remove('active');
  cutsceneText.style.display = '';
  skipButton.style.display = '';
  showingSavePrompt = false;
  updateCutsceneText();
  playMusic('cutscene');
}

function handleMapToggle() {
  if (state.currentState === GAME_STATE.PLAYING) {
    state.previousState = GAME_STATE.PLAYING;
    state.currentState = GAME_STATE.MAP;
  } else if (state.currentState === GAME_STATE.MAP) {
    state.currentState = state.previousState || GAME_STATE.PLAYING;
    state.previousState = null;
  }
}

function advanceCutscene() {
  state.cutsceneTimer = 0;
  state.currentCutsceneIndex++;

  if (state.currentCutsceneIndex >= state.currentCutscene.length) {
    if (state.currentState === GAME_STATE.CUTSCENE_INTRO) {
      startIntroAnimation();
    } else {
      showCredits();
    }
  } else {
    updateCutsceneText();
  }
}

function skipCutscene() {
  if (state.currentState === GAME_STATE.CUTSCENE_INTRO) {
    startIntroAnimation();
  } else if (state.currentState === GAME_STATE.CUTSCENE_ENDING) {
    showCredits();
  }
}

function startIntroAnimation() {
  state.currentState = GAME_STATE.INTRO_ANIMATION;
  cutsceneOverlay.classList.remove('active');
  state.animationPhase = 0;
  player.direction = 'down'; // Girl turns to walk away
}

function startGame() {
  state.currentState = GAME_STATE.PLAYING;
  inventory.updateDisplay();
  playMusic(state.currentArea);
}

function showCredits() {
  state.currentState = GAME_STATE.CREDITS;
  state.ladybug.found = true;
  cutsceneOverlay.classList.remove('active');
  credits.classList.add('active');
  stopMusic();
  deleteSave();
}

function restartGame() {
  deleteSave();
  resetState();
  resetPlayer();
  inventory.reset();
  credits.classList.remove('active');
  cutsceneOverlay.classList.add('active');
  updateCutsceneText();
  playMusic('cutscene');
}

function updateCutsceneText() {
  if (state.currentCutsceneIndex < state.currentCutscene.length) {
    cutsceneText.textContent = state.currentCutscene[state.currentCutsceneIndex].text;
  }
}

// Game update
function update() {
  state.frameCount++;

  if (state.currentState === GAME_STATE.CUTSCENE_INTRO ||
      state.currentState === GAME_STATE.CUTSCENE_ENDING) {
    state.cutsceneTimer++;
    if (state.cutsceneTimer >= state.currentCutscene[state.currentCutsceneIndex].duration) {
      state.cutsceneTimer = 0;
      state.currentCutsceneIndex++;

      if (state.currentCutsceneIndex >= state.currentCutscene.length) {
        if (state.currentState === GAME_STATE.CUTSCENE_INTRO) {
          startIntroAnimation();
        } else {
          showCredits();
        }
      } else {
        updateCutsceneText();
      }
    }
    return;
  }

  if (state.currentState === GAME_STATE.INTRO_ANIMATION) {
    state.animationPhase++;

    // Phase 0-60: Ladybug flies off
    // Phase 60-140: Girl walks away from tree (down)
    // Phase 140: Boy's dialog appears
    // Phase 200+: Start game

    if (state.animationPhase >= 60 && state.animationPhase < 140) {
      // Girl walks away from tree (y: 200 → 370)
      const walkProgress = (state.animationPhase - 60) / 80;
      player.y = 200 + walkProgress * 170;
    } else if (state.animationPhase === 140) {
      showDialog({
        dialog: ["Wait, where are you—", "Good luck out there!"],
        isStatic: true
      });
    } else if (state.animationPhase > 200) {
      startGame();
    }
    return;
  }

  if (state.currentState === GAME_STATE.ENDING_ANIMATION) {
    // Freeze animation while dialog is showing
    if (state.currentDialog) return;

    // Fade to black after boy's dialog, then credits
    if (state.endingPhase > 210) {
      state.endingFadeAlpha = Math.min(1, (state.endingFadeAlpha || 0) + 0.02);
      if (state.endingFadeAlpha >= 1) {
        showCredits();
      }
      return;
    }

    state.endingPhase++;

    // Phase 0-30:    Ladybug on leaf
    // Phase 30-70:   Ladybug flies up + boy walks toward girl (simultaneous)
    // Phase 70:      "*Misses!*" dialog
    // Phase 70-160:  Ladybug arcs back via indirect path, lands on boy's hand
    // Phase 160:     "*The ladybug lands gently on his hand...*" dialog
    // Phase 180:     Boy says "Ain't that just the way."
    // Phase 210+:    Fade to black

    if (state.endingPhase === 70) {
      showDialog({
        dialog: ["*Misses!*"],
        isStatic: true
      });
    } else if (state.endingPhase === 160) {
      showDialog({
        dialog: ["*The ladybug lands gently on his hand...*"],
        isStatic: true
      });
    } else if (state.endingPhase === 180) {
      showDialog({
        dialog: ["Ain't that just the way."],
        isStatic: true
      });
    }
    return;
  }

  if (state.currentState === GAME_STATE.MAP) return;

  if (state.currentState !== GAME_STATE.PLAYING) return;

  // Screen transition fade
  if (state.transitioning) {
    updateTransition();
    return;
  }

  // Kid run animation (runs to parent when parent talked to)
  if (state.kidRunPhase >= 0 && state.kidRunPhase <= 40) {
    state.kidRunPhase++;
  }

  // Squirrel run animation (after gate unlock)
  if (state.squirrelRunPhase >= 0) {
    state.squirrelRunPhase++;
    if (state.squirrelRunPhase > 60) {
      state.squirrelRunPhase = -1; // Animation done
    }
  }

  // Woods ladybug sighting animation (sits 40 frames, flies 110 frames)
  if (state.woodsSightingPhase >= 0) {
    state.woodsSightingPhase++;
    if (state.woodsSightingPhase > 150) {
      state.woodsSightingPhase = -1;
    }
  }

  // Player movement
  let newX = player.x;
  let newY = player.y;
  player.isMoving = false;

  if (keys['ArrowUp'] || keys['w'] || keys['W']) {
    newY -= player.speed;
    player.direction = 'up';
    player.isMoving = true;
  }
  if (keys['ArrowDown'] || keys['s'] || keys['S']) {
    newY += player.speed;
    player.direction = 'down';
    player.isMoving = true;
  }
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
    newX -= player.speed;
    player.direction = 'left';
    player.isMoving = true;
  }
  if (keys['ArrowRight'] || keys['d'] || keys['D']) {
    newX += player.speed;
    player.direction = 'right';
    player.isMoving = true;
  }

  // Animation
  if (player.isMoving) {
    player.animTimer++;
    if (player.animTimer > 8) {
      player.animTimer = 0;
      player.animFrame = (player.animFrame + 1) % 2;
    }
  }

  // Collision
  if (!checkCollision(newX, newY, player.width, player.height)) {
    player.x = newX;
    player.y = newY;
  }

  // Area transitions
  checkAreaTransition();
}

// Game draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state.currentState === GAME_STATE.CUTSCENE_INTRO) {
    ctx.fillStyle = '#6b8e23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawLargeTree(220, 100);
    // Both start together under the tree, facing each other
    drawBoy(280, 200);
    const savedDir = player.direction;
    player.direction = 'left';
    drawPlayer(310, 200);
    player.direction = savedDir;

    // Ladybug appears on beat 3 ("A tiny ladybug landed...") through beat 5
    if (state.currentCutsceneIndex >= 3 && state.currentCutsceneIndex <= 5) {
      drawLadybug(295, 198);
    }
    return;
  }

  if (state.currentState === GAME_STATE.INTRO_ANIMATION) {
    drawCompleteArea('meadow', true); // skipBoy flag
    // Boy walks from tree (280,200) toward meadow position (290,270) during phases 100-180
    let boyX = 280, boyY = 200;
    if (state.animationPhase >= 100) {
      const p = Math.min((state.animationPhase - 100) / 80, 1);
      boyX = 280 + p * (state.boy.x - 280);
      boyY = 200 + p * (state.boy.y - 200);
    }
    drawBoy(boyX, boyY);
    drawPlayer(player.x, player.y);

    // Ladybug flies off during first 60 frames (with flutter)
    if (state.animationPhase < 60) {
      const progress = state.animationPhase / 60;
      const flyX = 295 + progress * 150 + Math.sin(state.animationPhase * 0.15) * 12;
      const flyY = 198 - progress * 200;
      if (flyY > 0) drawLadybug(flyX, flyY);
    }
    return;
  }

  if (state.currentState === GAME_STATE.ENDING_ANIMATION) {
    drawCompleteArea('meadow', true); // skipBoy — we draw him manually

    // Boy starts at his normal meadow position and walks toward girl
    // during phases 30-70 (same time ladybug escapes)
    const boyStartX = state.boy.x, boyStartY = state.boy.y; // (290, 270)
    const boyEndX = 300, boyEndY = 240; // partway toward girl, not all the way
    let boyX = boyStartX, boyY = boyStartY;
    if (state.endingPhase >= 30) {
      const p = Math.min((state.endingPhase - 30) / 40, 1);
      boyX = boyStartX + (boyEndX - boyStartX) * p;
      boyY = boyStartY + (boyEndY - boyStartY) * p;
    }
    drawBoy(boyX, boyY);

    // Girl runs to the right chasing the ladybug during phases 30-70
    let girlX = player.x, girlY = player.y;
    if (state.endingPhase >= 30) {
      player.direction = 'right';
      const girlEndX = player.x + 80; // runs toward the park
      const p = Math.min((state.endingPhase - 30) / 40, 1);
      girlX = player.x + (girlEndX - player.x) * p;
    }
    drawPlayer(girlX, girlY);

    const ladybugBaseX = 295, ladybugBaseY = 195;
    const hoverX = 400, hoverY = 90;
    // Ladybug lands on boy's hand at his walked-to position
    const landX = boyEndX + 5, landY = boyEndY - 5;

    if (state.endingPhase < 30) {
      // Ladybug resting on leaf
      drawLadybug(ladybugBaseX, ladybugBaseY);
    } else if (state.endingPhase < 70) {
      // Ladybug flies up while boy walks toward girl (simultaneous)
      const p = (state.endingPhase - 30) / 40;
      const flutter = Math.sin(state.endingPhase * 0.15) * 10;
      const lbX = ladybugBaseX + (hoverX - ladybugBaseX) * p + flutter;
      const lbY = ladybugBaseY + (hoverY - ladybugBaseY) * p;
      drawLadybug(lbX, lbY);
    } else if (state.endingPhase < 160) {
      // Ladybug arcs back to boy via indirect curved path (quadratic bezier)
      // P0 = hover position, P1 = control point (swings wide left), P2 = boy's hand
      const p = (state.endingPhase - 70) / 90;
      const ctrlX = 150, ctrlY = 180; // arc wide to the left
      const t = p;
      const mt = 1 - t;
      const lbX = mt * mt * hoverX + 2 * mt * t * ctrlX + t * t * landX;
      const lbY = mt * mt * hoverY + 2 * mt * t * ctrlY + t * t * landY;
      drawLadybug(lbX, lbY);
    } else {
      // Ladybug resting on boy's hand
      drawLadybug(landX, landY);
    }

    // Fade to black overlay
    if (state.endingFadeAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = state.endingFadeAlpha;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    return;
  }

  if (state.currentState === GAME_STATE.MAP) {
    drawMap();
    return;
  }

  if (state.currentState !== GAME_STATE.PLAYING &&
      state.currentState !== GAME_STATE.DIALOG) return;

  drawCompleteArea(state.currentArea);
  drawPlayer(player.x, player.y);

  if (checkNearInteractable() && state.currentState === GAME_STATE.PLAYING) {
    drawInteractionPrompt();
  }

  drawSaveNotification();
  drawItemNotification();

  // Transition fade overlay
  if (state.transitioning && state.transitionAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = state.transitionAlpha;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
}

// Main loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Initialize
async function init() {
  await Promise.all([initSprites(), initAudio()]);

  if (hasSave()) {
    // Show Continue / New Game prompt
    cutsceneOverlay.classList.add('active');
    cutsceneText.style.display = 'none';
    skipButton.style.display = 'none';
    savePrompt.classList.add('active');
    showingSavePrompt = true;
  } else {
    // Normal intro cutscene
    cutsceneOverlay.classList.add('active');
    updateCutsceneText();
    playMusic('cutscene');
  }

  inventory.updateDisplay();
  gameLoop();
}

init();
