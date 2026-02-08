// Per-area collision detection

import { state } from '../game/state.js';

const CANVAS_W = 640;
const CANVAS_H = 480;

// Fixed world obstacle positions
const GATE_X = 360, GATE_Y = 120;
const LOGS_X = 430, LOGS_Y = 200; // 450 - 20 offset from original

export function checkCollision(x, y, w, h) {
  // Canvas boundary
  if (x < 0 || x + w > CANVAS_W || y < 0 || y + h > CANVAS_H) {
    return true;
  }

  const area = state.currentArea;

  if (area === 'meadow') {
    // Main oak tree
    if (x < 318 && x + w > 270 && y < 218 && y + h > 170) {
      return true;
    }
  } else if (area === 'gate_area') {
    if (!state.gateUnlocked) {
      if (x < GATE_X + 24 && x + w > GATE_X &&
          y < GATE_Y + 32 && y + h > GATE_Y) {
        return true;
      }
    }
  } else if (area === 'woods') {
    if (!state.logsCleared) {
      if (x < LOGS_X + 50 && x + w > LOGS_X &&
          y < LOGS_Y + 30 && y + h > LOGS_Y) {
        return true;
      }
    }
  } else if (area === 'boathouse') {
    if (x < 600 && x + w > 480 &&
        y < 300 && y + h > 200) {
      return true;
    }
  }

  return false;
}
