// The Ladybug Quest - main entry point
// Initializes all systems and runs the game loop

import './styles.css';

import { state, GAME_STATE, resetState } from './game/state.js';
import { player, resetPlayer } from './game/player.js';
import { checkAreaTransition } from './game/world.js';
import { initInput, keys } from './systems/input.js';
import { inventory } from './systems/inventory.js';
import { showDialog, advanceDialog } from './systems/dialog.js';
import { checkInteraction, checkNearInteractable } from './systems/interaction.js';
import { checkCollision } from './systems/collision.js';
import { setContext as setSpritesCtx, drawPlayer, drawBoy, drawTree, drawLargeTree, drawLadybug } from './rendering/sprites.js';
import { setContext as setAreasCtx, drawCompleteArea } from './rendering/areas.js';
import { setContext as setUICtx, drawInteractionPrompt } from './rendering/ui.js';
import { INTRO_CUTSCENE, ENDING_CUTSCENE } from './data/cutscenes.js';

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Pass canvas context to all rendering modules
setSpritesCtx(ctx);
setAreasCtx(ctx, canvas.width, canvas.height);
setUICtx(ctx, canvas.width);

// DOM references
const cutsceneOverlay = document.getElementById('cutsceneOverlay');
const cutsceneText = document.getElementById('cutsceneText');
const skipButton = document.getElementById('skipButton');
const credits = document.getElementById('credits');

// Input
initInput(handleSpacePress, handleRestart);

skipButton.addEventListener('click', skipCutscene);

function handleSpacePress() {
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
}

function showCredits() {
  state.currentState = GAME_STATE.CREDITS;
  cutsceneOverlay.classList.remove('active');
  credits.classList.add('active');
}

function restartGame() {
  resetState();
  resetPlayer();
  inventory.reset();
  credits.classList.remove('active');
  cutsceneOverlay.classList.add('active');
  updateCutsceneText();
}

function updateCutsceneText() {
  if (state.currentCutsceneIndex < state.currentCutscene.length) {
    cutsceneText.textContent = state.currentCutscene[state.currentCutsceneIndex].text;
  }
}

// Game update
function update() {
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

    // Phase 0-40: Ladybug flies off
    // Phase 40-80: Girl walks down away from tree
    // Phase 80: Boy's dialog appears
    // Phase 120+: Start game

    if (state.animationPhase >= 40 && state.animationPhase < 80) {
      // Girl walks down (200 → 270)
      const walkProgress = (state.animationPhase - 40) / 40;
      player.y = 200 + walkProgress * 70;
    } else if (state.animationPhase === 80) {
      showDialog({
        dialog: ["Wait, where are you—", "Good luck out there!"],
        isStatic: true
      });
    } else if (state.animationPhase > 120) {
      startGame();
    }
    return;
  }

  if (state.currentState !== GAME_STATE.PLAYING) return;

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
    drawCompleteArea('meadow');
    drawPlayer(player.x, player.y);

    // Ladybug flies off during first 40 frames
    if (state.animationPhase < 40) {
      const progress = state.animationPhase / 40;
      const flyX = 295 + progress * 150;
      const flyY = 198 - progress * 200;
      if (flyY > 0) drawLadybug(flyX, flyY);
    }
    return;
  }

  if (state.currentState !== GAME_STATE.PLAYING &&
      state.currentState !== GAME_STATE.DIALOG) return;

  drawCompleteArea(state.currentArea);
  drawPlayer(player.x, player.y);

  if (checkNearInteractable() && state.currentState === GAME_STATE.PLAYING) {
    drawInteractionPrompt();
  }
}

// Main loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Initialize
cutsceneOverlay.classList.add('active');
updateCutsceneText();
inventory.updateDisplay();
gameLoop();
