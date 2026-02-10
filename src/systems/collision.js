// Per-area collision detection

import { state } from '../game/state.js';

const CANVAS_W = 640;
const CANVAS_H = 480;

// Fixed world obstacle positions
const GATE_X = 380, GATE_Y = 140;
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
    // Dense tree line across top (blocks north except log corridor ~270-330)
    if (y < 50 && (x + w < 265 || x > 335)) return true;
    // Gate collision (blocks gated corner)
    if (!state.gateUnlocked) {
      if (x < 404 && x + w > 380 && y < 172 && y + h > 140) return true;
    }
    // Stone walls forming gated corner
    if (x + w > 580 && y < 245) return true; // Right wall
    if (y < 74 && x > 380) return true; // Top-right wall
    if (y < 245 && y + h > 230 && x > 380) return true; // Bottom wall of enclosure
    // Left connecting wall — extends from top wall (y:60) down to bottom wall (y:230)
    // Gap at gate (y:130-175) only when unlocked
    if (x < 394 && x + w > 380) {
      if (!state.gateUnlocked) {
        if (y < 230 && y + h > 60) return true; // Full wall when locked
      } else {
        if (y < 130 && y + h > 60) return true;  // Wall above gate opening
        if (y < 230 && y + h > 175) return true;  // Wall below gate opening to bottom
      }
    }
    // Trees
    if (x < 148 && x + w > 100 && y < 198 && y + h > 150) return true; // Tree (100, 150)
    if (x < 248 && x + w > 200 && y < 368 && y + h > 320) return true; // Tree (200, 320)
    if (x < 548 && x + w > 500 && y < 398 && y + h > 350) return true; // Tree (500, 350)
    // Logs blocking north exit (corridor gap)
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
    if (x < 600 && x + w > 480 && y < 300 && y + h > 200) return true;
    // Water — block everything below y=290 EXCEPT the bridge (x: 305-345)
    if (y + h > 290 && (x + w < 305 || x > 345)) return true;
    // Trees
    if (x < 148 && x + w > 100 && y < 128 && y + h > 80) return true;  // Tree (100, 80)
    if (x < 348 && x + w > 300 && y < 148 && y + h > 100) return true; // Tree (300, 100)
    if (x < 98 && x + w > 50 && y < 248 && y + h > 200) return true;  // Tree (50, 200)
    // Camperdown Elm fence
    if (x < 445 && x + w > 390 && y < 115 && y + h > 55) return true;
    // Boathouse dock
    if (x < 600 && x + w > 420 && y < 300 && y + h > 280) return true;
  }

  return false;
}
