// Player movement, collision, camera follow, and area transitions.
// The player's logical position lives in the original 640x480 space so the
// shared area-exit rules (src/game/world.js) and NPC interaction ranges
// carry over unchanged; it's projected to 3D through toX/toZ each frame.

import { state, MODE, toX, toZ } from './state.js';
import { setFade, showAreaLabel } from './hud.js';
import { touchTarget, clearTouchTarget } from './touch.js';
import { playSFX, playMusic } from '../../src/systems/audio.js';
import { saveGame } from './save.js';

export const player = {
  x: 320,
  y: 300,
  speed: 170, // logical px/sec (original moves ~2.5px/frame)
  facing: 0, // radians, world-space heading for the mesh
  moving: false
};

const keys = {};
export function initInput() {
  window.addEventListener('keydown', (e) => { keys[e.code] = true; });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
}
export function isKeyDown(code) { return !!keys[code]; }

// --- Collision -------------------------------------------------------

// Static circle obstacles come from the area builders; dynamic blockers
// (gate fence, logs, water) are checked here against world flags.
function isBlocked(area, x, y, obstacles) {
  for (const o of obstacles) {
    const dx = x - o.x, dy = y - o.y;
    if (dx * dx + dy * dy < o.r * o.r) return true;
  }

  if (area === 'gate_area') {
    // Fenced corner: x > 380, y < 215. Gate opening at x 390..440 when unlocked.
    const inCorner = x > 380 && y < 215;
    const inGateway = x > 388 && x < 442 && y > 195 && y < 235;
    if (inCorner && !state.gateUnlocked) return true;
    if (!state.gateUnlocked && inGateway) return true;
    // Fence itself blocks even when unlocked, except the gateway
    if (state.gateUnlocked && inCorner && y > 200 && y < 215 && !(x > 388 && x < 442)) return true;
    // Logs block the north band until cleared
    if (!state.logsCleared && y < 65 && x > 240 && x < 360) return true;
  }

  if (area === 'boathouse') {
    // The lake fills the bottom (y > 285), except the footbridge in from
    // the park (x 300..350)
    if (y > 285 && !(x > 300 && x < 350)) return true;
  }

  return false;
}

// --- Movement --------------------------------------------------------

// Returns 'arrived-interact' when a tapped interactable has been reached
export function updatePlayer(dt, obstacles) {
  let dx = 0, dy = 0;
  if (keys.KeyW || keys.ArrowUp) dy -= 1;
  if (keys.KeyS || keys.ArrowDown) dy += 1;
  if (keys.KeyA || keys.ArrowLeft) dx -= 1;
  if (keys.KeyD || keys.ArrowRight) dx += 1;

  // Keyboard takes priority and cancels any tap target
  if (dx !== 0 || dy !== 0) {
    clearTouchTarget();
  } else if (touchTarget) {
    const tdx = touchTarget.x - player.x;
    const tdy = touchTarget.y - player.y;
    const dist = Math.hypot(tdx, tdy);
    const arriveRadius = touchTarget.interact ? 32 : 6;
    if (dist < arriveRadius) {
      const wasInteract = touchTarget.interact;
      clearTouchTarget();
      if (wasInteract) return 'arrived-interact';
    } else {
      dx = tdx / dist;
      dy = tdy / dist;
    }
  }

  player.moving = dx !== 0 || dy !== 0;
  if (!player.moving) return;

  const len = Math.hypot(dx, dy);
  dx /= len; dy /= len;

  const nx = player.x + dx * player.speed * dt;
  const ny = player.y + dy * player.speed * dt;

  // Axis-separated so you slide along obstacles
  const prevX = player.x, prevY = player.y;
  if (!isBlocked(state.currentArea, nx, player.y, obstacles)) player.x = nx;
  if (!isBlocked(state.currentArea, player.x, ny, obstacles)) player.y = ny;

  // Clamp inside the area (transitions trigger near the edge first)
  player.x = Math.max(8, Math.min(632, player.x));
  player.y = Math.max(8, Math.min(472, player.y));

  // Stuck against an obstacle or the bounds while walking to a tap —
  // give up on the target
  if (touchTarget && player.x === prevX && player.y === prevY) {
    clearTouchTarget();
    player.moving = false;
    return;
  }

  // Face movement direction (+x logical = +x world, +y logical = +z world)
  player.facing = Math.atan2(dx, dy);
}

// --- Area transitions (mirrors src/game/world.js) ---------------------

const FADE_SPEED = 2.2; // alpha/sec

let fade = { active: false, alpha: 0, phase: 'out', target: null };

export function startTransition(newArea) {
  if (fade.active) return;
  clearTouchTarget();
  playSFX('area_transition');
  fade = { active: true, alpha: 0, phase: 'out', target: newArea };
  state.transitioning = true;
}

export function updateTransition(dt, onSwap) {
  if (!fade.active) return false;
  if (fade.phase === 'out') {
    fade.alpha += FADE_SPEED * dt;
    if (fade.alpha >= 1) {
      fade.alpha = 1;
      executeAreaSwap(fade.target, onSwap);
      fade.phase = 'in';
    }
  } else {
    fade.alpha -= FADE_SPEED * dt;
    if (fade.alpha <= 0) {
      fade.alpha = 0;
      fade.active = false;
      state.transitioning = false;
    }
  }
  setFade(fade.alpha);
  return true;
}

// Entry positions per (from -> to), same as the 8-bit world.js
const ENTRY_POS = {
  'meadow>park': [30, 240], 'park>meadow': [610, 240],
  'park>playground': [320, 30], 'playground>park': [320, 450],
  'park>boathouse': [320, 450], 'boathouse>park': [320, 30],
  'boathouse>gate_area': [30, 240], 'gate_area>boathouse': [610, 240],
  'gate_area>woods': [320, 450], 'woods>gate_area': [320, 30]
};

function executeAreaSwap(newArea, onSwap) {
  const old = state.currentArea;
  state.currentArea = newArea;
  const pos = ENTRY_POS[`${old}>${newArea}`] || [320, 240];
  player.x = pos[0];
  player.y = pos[1];
  playMusic(newArea);
  showAreaLabel(newArea);
  if (onSwap) onSwap(newArea, old);
  saveGame();
}

export function checkAreaTransition() {
  if (fade.active || state.mode !== MODE.PLAYING) return;
  const { currentArea, logsCleared } = state;
  const margin = 10;

  if (currentArea === 'meadow' && player.x > 640 - margin) startTransition('park');
  else if (currentArea === 'park' && player.x < margin) startTransition('meadow');
  else if (currentArea === 'park' && player.y > 480 - margin) startTransition('playground');
  else if (currentArea === 'playground' && player.y < margin) startTransition('park');
  else if (currentArea === 'park' && player.y < margin) startTransition('boathouse');
  else if (currentArea === 'boathouse' && player.y > 480 - margin) startTransition('park');
  else if (currentArea === 'boathouse' && player.x > 640 - margin) startTransition('gate_area');
  else if (currentArea === 'gate_area' && player.x < margin) startTransition('boathouse');
  else if (currentArea === 'gate_area' && logsCleared && player.y < margin) startTransition('woods');
  else if (currentArea === 'woods' && player.y > 480 - margin) startTransition('gate_area');
}

// --- Camera ------------------------------------------------------------

export function updateCamera(camera, dt) {
  const px = toX(player.x);
  const pz = toZ(player.y);
  const targetPos = { x: px, y: 7.5, z: pz + 8.5 };
  const k = Math.min(1, dt * 4);
  camera.position.x += (targetPos.x - camera.position.x) * k;
  camera.position.y += (targetPos.y - camera.position.y) * k;
  camera.position.z += (targetPos.z - camera.position.z) * k;
  camera.lookAt(px, 0.8, pz);
}
