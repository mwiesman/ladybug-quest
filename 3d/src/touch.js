// Touch input — tap-to-move and tap-to-interact, mirroring the 8-bit
// game's mobile UX. Taps are raycast onto the ground plane and converted
// back to logical 640x480 coordinates, so the same hit ranges apply.

import * as THREE from 'three';
import { state, MODE, WORLD_SCALE } from './state.js';
import { getNPCPosition } from './quest.js';
import { inventory } from './state.js';

export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Walk target in logical coords; `interact` marks taps on interactables
// so the player auto-interacts on arrival.
export let touchTarget = null; // { x, y, interact }

export function clearTouchTarget() {
  touchTarget = null;
}

const raycaster = new THREE.Raycaster();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hitPoint = new THREE.Vector3();
const ndc = new THREE.Vector2();

// Tap position -> logical (640x480) coords via the ground plane
function logicalFromPointer(e, camera, canvas) {
  const rect = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  if (!raycaster.ray.intersectPlane(groundPlane, hitPoint)) return null;
  return {
    x: hitPoint.x / WORLD_SCALE + 320,
    y: hitPoint.z / WORLD_SCALE + 240
  };
}

// Hit-test interactables in logical space (port of the 2D touch.js version)
function hitTestInteractables(cx, cy) {
  const { currentArea, npcs, worldItems, gateUnlocked, logsCleared, ladybug } = state;
  const HIT = 45;

  for (const npcKey in npcs) {
    const npc = npcs[npcKey];
    if (npc.area !== currentArea) continue;
    const pos = getNPCPosition(npc);
    if (Math.abs(cx - pos.x) < HIT && Math.abs(cy - pos.y) < HIT) {
      return { x: pos.x, y: pos.y };
    }
  }

  if (currentArea === 'meadow') {
    if (Math.abs(cx - state.boy.x) < HIT && Math.abs(cy - state.boy.y) < HIT) {
      return { x: state.boy.x, y: state.boy.y };
    }
    if (Math.abs(cx - 69) < HIT && Math.abs(cy - 451) < HIT) {
      return { x: 69, y: 451 };
    }
    if (inventory.hasItem('Net') &&
        Math.abs(cx - ladybug.x) < HIT && Math.abs(cy - ladybug.y) < HIT) {
      return { x: ladybug.x, y: ladybug.y };
    }
  }

  if (!worldItems.birdseed.collected && currentArea === 'park' &&
      Math.abs(cx - worldItems.birdseed.x) < HIT &&
      Math.abs(cy - worldItems.birdseed.y) < HIT) {
    return { x: worldItems.birdseed.x, y: worldItems.birdseed.y };
  }

  if (!worldItems.doubloons.collected && currentArea === 'woods' &&
      Math.abs(cx - worldItems.doubloons.x) < HIT &&
      Math.abs(cy - worldItems.doubloons.y) < HIT) {
    return { x: worldItems.doubloons.x, y: worldItems.doubloons.y };
  }

  if (!gateUnlocked && currentArea === 'gate_area' && inventory.hasItem('Key') &&
      Math.abs(cx - 400) < HIT && Math.abs(cy - 215) < HIT) {
    return { x: 400, y: 230 }; // stand just south of the gate
  }

  if (!logsCleared && currentArea === 'gate_area' &&
      Math.abs(cx - 300) < HIT && Math.abs(cy - 65) < HIT) {
    return { x: 300, y: 95 }; // stand south of the log pile
  }

  if (currentArea === 'boathouse' &&
      Math.abs(cx - 418) < HIT && Math.abs(cy - 90) < HIT) {
    return { x: 418, y: 112 }; // stand in front of the plaque
  }

  return null;
}

// onAction is main.js's handleAction — used for advancing dialogs/cutscenes
export function initTouch(camera, canvas, onAction) {
  if (isTouchDevice()) {
    document.body.classList.add('touch');
  }
  canvas.style.touchAction = 'none';

  canvas.addEventListener('pointerdown', (e) => {
    // In-world taps are touch/pen only (desktop keeps keyboard movement);
    // taps outside PLAYING (cutscenes, dialogs) act like SPACE for any pointer.
    if (state.mode === MODE.PLAYING && !state.currentDialog) {
      if (e.pointerType === 'mouse') return;
      const pos = logicalFromPointer(e, camera, canvas);
      if (!pos) return;
      const hit = hitTestInteractables(pos.x, pos.y);
      if (hit) {
        touchTarget = { x: hit.x, y: hit.y, interact: true };
      } else {
        // Taps beyond the play area aim well past the edge so the walk
        // crosses the area-transition threshold (x>630 etc.) instead of
        // stopping at the arrival radius just short of it. The transition
        // clears the target; on edges with no exit the player just stops
        // against the bounds clamp.
        const x = pos.x < 8 ? -60 : pos.x > 632 ? 700 : pos.x;
        const y = pos.y < 8 ? -60 : pos.y > 472 ? 540 : pos.y;
        touchTarget = { x, y, interact: false };
      }
    } else if (state.mode !== MODE.PLAYING || state.currentDialog) {
      // Yes/No prompts must be answered with their buttons
      if (state.tradePrompted || state.proposalDialogStep === 4) return;
      onAction();
    }
  });

  // Tapping the dialog box advances it (buttons stop propagation)
  document.getElementById('dialogBox').addEventListener('pointerdown', (e) => {
    if (state.tradePrompted || state.proposalDialogStep === 4) return;
    e.stopPropagation();
    if (state.currentDialog) onAction();
  });
  for (const id of ['tradeYes', 'tradeNo']) {
    document.getElementById(id).addEventListener('pointerdown', (e) => e.stopPropagation());
  }
}
