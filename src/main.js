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
import { setContext as setUICtx, drawInteractionPrompt, showSaveNotification, drawSaveNotification, drawMap } from './rendering/ui.js';
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
}

function startGame() {
  state.currentState = GAME_STATE.PLAYING;
  inventory.updateDisplay();
  playMusic(state.currentArea);
}

function showCredits() {
  state.currentState = GAME_STATE.CREDITS;
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

    // After boy's dialog, go to credits
    if (state.endingPhase > 160) {
      showCredits();
      return;
    }

    state.endingPhase++;

    // Phase 0-40:  Ladybug on leaf, girl nearby
    // Phase 40-70: Girl swings net, misses! Ladybug flies up
    // Phase 70-110: Girl stands still, ladybug hovers
    // Phase 110-150: Ladybug gently descends onto girl's hand
    // Phase 150-160: Ladybug on girl's hand, both still
    // Phase 160: Boy says "Ain't that just the way."

    if (state.endingPhase === 160) {
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
    // Both start together under the tree
    drawBoy(280, 200);
    drawPlayer(310, 200);

    // Ladybug appears on beat 3 ("A tiny ladybug landed...") through beat 5
    if (state.currentCutsceneIndex >= 3 && state.currentCutsceneIndex <= 5) {
      drawLadybug(295, 198);
    }
    return;
  }

  if (state.currentState === GAME_STATE.INTRO_ANIMATION) {
    drawCompleteArea('meadow', true); // skipBoy flag
    // Draw boy under the tree (not at state.boy position)
    drawBoy(280, 200);
    drawPlayer(player.x, player.y);

    // Ladybug flies off during first 60 frames
    if (state.animationPhase < 60) {
      const progress = state.animationPhase / 60;
      const flyX = 295 + progress * 150;
      const flyY = 198 - progress * 200;
      if (flyY > 0) drawLadybug(flyX, flyY);
    }
    return;
  }

  if (state.currentState === GAME_STATE.ENDING_ANIMATION) {
    drawCompleteArea('meadow', true); // skipBoy — we draw him manually at the tree
    drawBoy(280, 200); // Boy under the tree
    drawPlayer(player.x, player.y);

    const ladybugBaseX = 295, ladybugBaseY = 195;

    if (state.endingPhase < 40) {
      // Ladybug resting on leaf
      drawLadybug(ladybugBaseX, ladybugBaseY);
    } else if (state.endingPhase < 70) {
      // Girl swings net, misses! Ladybug flies away quickly
      const p = (state.endingPhase - 40) / 30;
      const lbX = ladybugBaseX + p * 120;
      const lbY = ladybugBaseY - p * 200;
      if (lbY > -20) drawLadybug(lbX, lbY);
    } else if (state.endingPhase < 110) {
      // Ladybug is off-screen / far away, drifting high
      const hover = Math.sin((state.endingPhase - 70) * 0.08) * 15;
      const driftBack = (state.endingPhase - 70) / 40; // slowly drift back toward center
      const lbX = ladybugBaseX + 120 - driftBack * 80 + hover;
      const lbY = Math.max(-10, ladybugBaseY - 200 + driftBack * 60);
      if (lbY > -20) drawLadybug(lbX, lbY);
    } else if (state.endingPhase < 150) {
      // Ladybug gently descends and lands on girl's hand
      const p = (state.endingPhase - 110) / 40;
      const startX = ladybugBaseX + 40;
      const startY = ladybugBaseY - 140;
      const endX = player.x + 5;
      const endY = player.y - 5;
      const lbX = startX + (endX - startX) * p;
      const lbY = startY + (endY - startY) * p;
      drawLadybug(lbX, lbY);
    } else {
      // Ladybug resting on girl's hand
      drawLadybug(player.x + 5, player.y - 5);
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
