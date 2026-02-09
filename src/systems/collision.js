// Per-area collision detection

import { state } from '../game/state.js';

const CANVAS_W = 640;
const CANVAS_H = 480;

// Fixed world obstacle positions
const GATE_X = 360, GATE_Y = 120;
const LOGS_X = 270, LOGS_Y = 20; // Near top of gate_area, blocking north exit

export function checkCollision(x, y, w, h) {
  // Canvas boundary - only block at edges without transitions
  // Allow player to reach edges for area transitions
  const area = state.currentArea;
  const { gateUnlocked, logsCleared } = state;

  // Check canvas boundaries only where there are NO transitions
  if (area === 'meadow') {
    // Only right edge has transition (to park)
    if (x < 0 || y < 0 || y + h > CANVAS_H) return true;
  } else if (area === 'park') {
    // Left (meadow), top (boathouse), bottom (playground) have transitions
    // No hard boundaries at these edges
  } else if (area === 'playground') {
    // Only top has transition (to park)
    if (x < 0 || x + w > CANVAS_W || y + h > CANVAS_H) return true;
  } else if (area === 'boathouse') {
    // Bottom (park) and right (gate_area) have transitions
    if (x < 0 || y < 0) return true;
  } else if (area === 'gate_area') {
    // Left (boathouse) is open, top open if logsCleared (woods)
    // Right and bottom are hard walls
    if (x + w > CANVAS_W || y + h > CANVAS_H) return true;
    if (!logsCleared && y < 0) return true;
  } else if (area === 'woods') {
    // Only bottom has transition (to gate_area)
    if (x < 0 || x + w > CANVAS_W || y < 0) return true;
  }

  // Area-specific obstacle collision
  if (area === 'meadow') {
    // Trees
    if (x < 286 && x + w > 235 && y < 196 && y + h > 148) return true; // Large oak (220, 100)
    if (x < 128 && x + w > 80 && y < 148 && y + h > 100) return true; // Tree at (80, 100)
    if (x < 528 && x + w > 480 && y < 168 && y + h > 120) return true; // Tree at (480, 120)
    if (x < 98 && x + w > 50 && y < 428 && y + h > 380) return true; // Tree at (50, 380)
    // Rocks
    if (x < 146 && x + w > 118 && y < 302 && y + h > 278) return true; // Rock at (120, 280)
    if (x < 506 && x + w > 478 && y < 342 && y + h > 318) return true; // Rock at (480, 320)
  } else if (area === 'gate_area') {
    // Gate collision (blocks half the area for squirrel's acorns)
    if (!state.gateUnlocked) {
      if (x < GATE_X + 24 && x + w > GATE_X &&
          y < GATE_Y + 32 && y + h > GATE_Y) {
        return true;
      }
    }
    // Stone walls forming gated corner
    if (x + w > 580 && y < 200) return true; // Right wall
    if (y < 54 && x > 400) return true; // Top wall
    if (x < 414 && x + w > 400 && y < 140 && y + h > 40) return true; // Left connecting wall
    // Logs blocking north exit (near top center)
    if (!logsCleared) {
      if (x < LOGS_X + 60 && x + w > LOGS_X &&
          y < LOGS_Y + 30 && y + h > LOGS_Y) {
        return true;
      }
    }
  } else if (area === 'woods') {
    // Rocks only (logs removed — now in gate_area)
    if (x < 126 && x + w > 98 && y < 372 && y + h > 348) return true; // Rock at (100, 350)
    if (x < 426 && x + w > 398 && y < 402 && y + h > 378) return true; // Rock at (400, 380)
    if (x < 276 && x + w > 248 && y < 182 && y + h > 158) return true; // Rock at (250, 160)
  } else if (area === 'boathouse') {
    // Boathouse building
    if (x < 600 && x + w > 480 &&
        y < 300 && y + h > 200) {
      return true;
    }
  }

  return false;
}
