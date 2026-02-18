// Touch input system — tap-to-move, tap-to-interact, mobile scaling
// Works alongside keyboard input without interfering

import { state, GAME_STATE } from '../game/state.js';
import { player } from '../game/player.js';
import { getBirdPosition, getSquirrelPosition, getKidPosition } from './interaction.js';
import { inventory } from './inventory.js';
import { AREA_EXITS, getExitBounds } from '../rendering/ui.js';

// --- Touch detection ---
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// --- Touch movement target ---
export let touchTarget = null;      // { x, y } canvas coords to walk toward
export let touchInteractTarget = null; // truthy when tap was on an interactable

export function clearTouchTarget() {
  touchTarget = null;
  touchInteractTarget = null;
}

// --- Canvas scaling ---
let gameScale = 1;
let canvas = null;
let container = null;

function updateScale() {
  if (!container) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // 640 + 16 for 8px border each side (desktop), less on mobile
  const borderSize = (vw <= 680 || vh <= 520) ? 8 : 16;
  const maxW = vw - 16; // small margin
  const maxH = vh - 16;
  const scaleX = maxW / (640 + borderSize);
  const scaleY = maxH / (480 + borderSize);
  gameScale = Math.min(scaleX, scaleY, 1); // never scale up past 1
  if (vw <= 680 || vh <= 520) {
    container.style.setProperty('--game-scale', gameScale);
  } else {
    container.style.removeProperty('--game-scale');
  }
}

/** Convert a touch event to canvas coordinates (0-640, 0-480) */
function canvasFromTouch(touch) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (touch.clientX - rect.left) / rect.width * 640,
    y: (touch.clientY - rect.top) / rect.height * 480
  };
}

// --- Hit-testing: check if a tap is near an interactable ---

function hitTestInteractables(cx, cy) {
  const { currentArea, npcs, worldItems, gateUnlocked, logsCleared, ladybug } = state;
  const HIT = 40; // tap hit radius (matches game interaction range)

  // NPCs in current area
  for (const npcKey in npcs) {
    const npc = npcs[npcKey];
    if (npc.area !== currentArea) continue;

    let nx = npc.x, ny = npc.y;

    if (npc === npcs.squirrel) {
      const sq = getSquirrelPosition();
      nx = sq.x; ny = sq.y;
    } else if (npc === npcs.bird && npc.flies) {
      const bird = getBirdPosition();
      nx = bird.x; ny = bird.y;
    } else if (npc === npcs.kid && state.kidRunPhase >= 40) {
      nx = state.kidRunTargetX;
      ny = state.kidRunTargetY;
    }

    if (Math.abs(cx - nx) < HIT && Math.abs(cy - ny) < HIT) {
      return { x: nx, y: ny };
    }
  }

  // Boy in meadow
  if (currentArea === 'meadow') {
    if (Math.abs(cx - state.boy.x) < HIT && Math.abs(cy - state.boy.y) < HIT) {
      return { x: state.boy.x, y: state.boy.y };
    }
  }

  // Birdseed
  if (!worldItems.birdseed.collected && currentArea === 'park') {
    if (Math.abs(cx - worldItems.birdseed.x) < HIT && Math.abs(cy - worldItems.birdseed.y) < HIT) {
      return { x: worldItems.birdseed.x, y: worldItems.birdseed.y };
    }
  }

  // Doubloons
  if (!worldItems.doubloons.collected && currentArea === 'woods') {
    if (Math.abs(cx - worldItems.doubloons.x) < HIT && Math.abs(cy - worldItems.doubloons.y) < HIT) {
      return { x: worldItems.doubloons.x, y: worldItems.doubloons.y };
    }
  }

  // Gate
  if (!gateUnlocked && currentArea === 'gate_area' && inventory.hasItem('Key')) {
    if (Math.abs(cx - 350) < HIT && Math.abs(cy - 215) < HIT) {
      return { x: 350, y: 215 };
    }
  }

  // Logs
  if (!logsCleared && currentArea === 'gate_area') {
    if (Math.abs(cx - 300) < HIT && Math.abs(cy - 35) < HIT) {
      return { x: 300, y: 35 };
    }
  }

  // Camperdown Elm plaque
  if (currentArea === 'boathouse') {
    if (Math.abs(cx - 418) < HIT && Math.abs(cy - 90) < HIT) {
      return { x: 418, y: 90 };
    }
  }

  // Ladybug
  if (inventory.hasItem('Net') && currentArea === 'meadow') {
    if (Math.abs(cx - ladybug.x) < 40 && Math.abs(cy - ladybug.y) < 40) {
      return { x: ladybug.x, y: ladybug.y };
    }
  }

  return null;
}

// --- Main touch handler ---

let handlers = {};

export function initTouch(canvasEl, handlerFns) {
  canvas = canvasEl;
  container = canvasEl.parentElement;
  handlers = handlerFns;

  // Compute initial scale
  updateScale();
  window.addEventListener('resize', updateScale);
  window.addEventListener('orientationchange', () => {
    setTimeout(updateScale, 100);
  });

  // Add .touch class to body for CSS conditionals
  if (isTouchDevice()) {
    document.body.classList.add('touch');
  }

  // Touch events on canvas
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd, { passive: false });

  // Dialog box touch (sits on top of canvas, needs its own handler)
  const dialogBox = document.getElementById('dialogBox');
  if (dialogBox) {
    dialogBox.addEventListener('touchstart', (e) => {
      if (state.tradePrompted) return; // let Yes/No buttons handle it
      e.preventDefault();
      if ((state.currentState === GAME_STATE.DIALOG || state.currentDialog) && handlers.onSpace) {
        handlers.onSpace();
      }
    }, { passive: false });
  }

  // Touch events on cutscene overlay (for advancing cutscenes)
  const cutsceneOverlay = document.getElementById('cutsceneOverlay');
  if (cutsceneOverlay) {
    cutsceneOverlay.addEventListener('touchstart', onOverlayTouch, { passive: false });
  }

  // Credits touch
  const credits = document.getElementById('credits');
  if (credits) {
    credits.addEventListener('touchstart', onCreditsTouch, { passive: false });
  }
}

function onTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const pos = canvasFromTouch(touch);

  switch (state.currentState) {
    case GAME_STATE.PLAYING:
      onPlayingTouch(pos);
      break;
    case GAME_STATE.DIALOG:
      onDialogTouch();
      break;
    case GAME_STATE.MAP:
      if (handlers.onMapToggle) handlers.onMapToggle();
      break;
    case GAME_STATE.CUTSCENE_INTRO:
    case GAME_STATE.CUTSCENE_ENDING:
      if (handlers.onSpace) handlers.onSpace();
      break;
    case GAME_STATE.INTRO_ANIMATION:
    case GAME_STATE.ENDING_ANIMATION:
      // Dialog during animation — advance it
      if (state.currentDialog) {
        if (handlers.onSpace) handlers.onSpace();
      }
      break;
  }
}

function onTouchMove(e) {
  e.preventDefault(); // prevent scroll
}

function onTouchEnd(e) {
  e.preventDefault(); // prevent ghost click / double-tap zoom
}

function hitTestExitZone(cx, cy) {
  const exits = AREA_EXITS[state.currentArea];
  if (!exits) return null;
  const PAD = 15; // extra tap padding around visual indicator

  for (const exit of exits) {
    if (exit.condition && !state[exit.condition]) continue;
    const b = getExitBounds(exit);
    if (cx >= b.x - PAD && cx <= b.x + b.w + PAD &&
        cy >= b.y - PAD && cy <= b.y + b.h + PAD) {
      return { x: b.walkX, y: b.walkY };
    }
  }
  return null;
}

function onPlayingTouch(pos) {
  // Check if tapped an exit indicator
  const exitTarget = hitTestExitZone(pos.x, pos.y);
  if (exitTarget) {
    touchTarget = { x: exitTarget.x, y: exitTarget.y };
    touchInteractTarget = null;
    return;
  }

  // Check if tapped an interactable
  const hit = hitTestInteractables(pos.x, pos.y);
  if (hit) {
    touchTarget = { x: hit.x, y: hit.y };
    touchInteractTarget = true;
  } else {
    touchTarget = { x: pos.x, y: pos.y };
    touchInteractTarget = null;
  }
}

function onDialogTouch() {
  // If trade prompt is up, don't advance on generic tap — use the buttons
  if (state.tradePrompted) return;
  if (handlers.onSpace) handlers.onSpace();
}

function onOverlayTouch(e) {
  // Don't handle if save prompt is showing (buttons handle that)
  const savePrompt = document.getElementById('savePrompt');
  if (savePrompt && savePrompt.classList.contains('active')) return;

  e.preventDefault();
  if (state.currentState === GAME_STATE.CUTSCENE_INTRO ||
      state.currentState === GAME_STATE.CUTSCENE_ENDING) {
    if (handlers.onSpace) handlers.onSpace();
  }
}

function onCreditsTouch(e) {
  e.preventDefault();
  if (state.currentState === GAME_STATE.CREDITS) {
    if (handlers.onRestart) handlers.onRestart();
  }
}
