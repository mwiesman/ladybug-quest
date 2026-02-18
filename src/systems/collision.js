// Per-area collision detection — AABB checks against world geometry
// Each area defines: (1) canvas boundary walls (blocked except at transition edges)
//                     (2) obstacle hitboxes for trees, rocks, walls, water, buildings
// All coordinates are hardcoded to the 640x480 canvas and match rendering in areas.js

import { state } from '../game/state.js';
import { player } from '../game/player.js';
import { getBirdPosition, getSquirrelPosition, getKidPosition } from './interaction.js';

const CANVAS_W = 640;
const CANVAS_H = 480;

// Fixed world obstacle positions (shared with interaction.js and areas.js)
const GATE_X = 350, GATE_Y = 215;
const LOGS_X = 270, LOGS_Y = 20;

// Block entry into NPC hitbox, but don't trap if player already overlaps
function npcBlock(px, py, pw, ph, nx, ny, nw, nh) {
  if (player.x < nx + nw && player.x + pw > nx &&
      player.y < ny + nh && player.y + ph > ny) return false;
  return px < nx + nw && px + pw > nx && py < ny + nh && py + ph > ny;
}

/**
 * Check if the given bounding box collides with any world geometry.
 * Called every frame for player movement — returns true to block movement.
 */
export function checkCollision(x, y, w, h) {
  // Canvas boundaries — only block edges that have no area transition
  const area = state.currentArea;
  const { gateUnlocked, logsCleared } = state;

  // Check canvas boundaries only where there are NO transitions
  if (area === 'meadow') {
    // Only right edge has transition (to park)
    if (x < 0 || y < 0 || y + h > CANVAS_H) return true;
  } else if (area === 'park') {
    // Left (meadow), top (boathouse), bottom (playground) have transitions
    // Coffee cart (tight box so player can still interact)
    if (x < 126 && x + w > 94 && y < 132 && y + h > 96) return true;
    // NPCs
    if (npcBlock(x, y, w, h, state.npcs.hippie.x + 2, state.npcs.hippie.y + 4, 20, 24)) return true;
    if (npcBlock(x, y, w, h, state.npcs.dog.x, state.npcs.dog.y + 8, 28, 24)) return true;
  } else if (area === 'playground') {
    // Only top has transition (to park)
    if (x < 0 || x + w > CANVAS_W || y + h > CANVAS_H) return true;
    // NPCs
    const kidPos = getKidPosition();
    if (npcBlock(x, y, w, h, kidPos.x + 2, kidPos.y + 4, 20, 24)) return true;
    if (npcBlock(x, y, w, h, state.npcs.parent.x + 2, state.npcs.parent.y + 4, 20, 24)) return true;
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
    // Boy NPC
    if (npcBlock(x, y, w, h, state.boy.x + 2, state.boy.y + 4, 20, 24)) return true;
  } else if (area === 'gate_area') {
    // Dense tree line across top (blocks north except log corridor ~270-330)
    if (y < 50 && (x + w < 265 || x > 335)) return true;
    // Wooden fence at x=350 (vertical, from tree line to bottom)
    if (x + w > 348 && x < 370) {
      if (!state.gateUnlocked) {
        if (y + h > 50) return true; // Full fence when locked
      } else {
        if (y + h > 50 && y < 200) return true;  // Fence above gate opening
        if (y + h > 260) return true;              // Fence below gate opening
      }
    }
    // Gate collision (redundant when locked, but explicit)
    if (!state.gateUnlocked) {
      if (x < 374 && x + w > 348 && y < 262 && y + h > 198) return true;
    }
    // Trees (outside fence)
    if (x < 148 && x + w > 100 && y < 198 && y + h > 150) return true; // Tree (100, 150)
    if (x < 248 && x + w > 200 && y < 368 && y + h > 320) return true; // Tree (200, 320)
    // Fall trees (inside gated area)
    if (x < 468 && x + w > 420 && y < 148 && y + h > 100) return true; // FallTree (420, 100)
    if (x < 598 && x + w > 550 && y < 248 && y + h > 200) return true; // FallTree (550, 200)
    if (x < 528 && x + w > 480 && y < 398 && y + h > 350) return true; // FallTree (480, 350)
    // Logs blocking north exit (corridor gap)
    if (!logsCleared) {
      if (x < LOGS_X + 60 && x + w > LOGS_X &&
          y < LOGS_Y + 30 && y + h > LOGS_Y) {
        return true;
      }
    }
    // NPCs
    const birdPos = getBirdPosition();
    if (npcBlock(x, y, w, h, birdPos.x + 4, birdPos.y + 4, 16, 18)) return true;
    const sqPos = getSquirrelPosition();
    if (npcBlock(x, y, w, h, sqPos.x, sqPos.y + 4, 22, 24)) return true;
  } else if (area === 'woods') {
    // Rocks only (logs removed — now in gate_area)
    if (x < 126 && x + w > 98 && y < 372 && y + h > 348) return true; // Rock at (100, 350)
    if (x < 426 && x + w > 398 && y < 402 && y + h > 378) return true; // Rock at (400, 380)
    if (x < 276 && x + w > 248 && y < 182 && y + h > 158) return true; // Rock at (250, 160)
  } else if (area === 'boathouse') {
    // Boathouse building (includes roof)
    if (x < 600 && x + w > 480 && y < 300 && y + h > 168) return true;
    // Water — block everything below y=290 EXCEPT the bridge (x: 297-353, tighter to match visual railings)
    if (y + h > 290 && (x < 297 || x + w > 353)) return true;
    // Trees
    if (x < 148 && x + w > 100 && y < 128 && y + h > 80) return true;  // Tree (100, 80)
    if (x < 348 && x + w > 300 && y < 148 && y + h > 100) return true; // Tree (300, 100)
    if (x < 98 && x + w > 50 && y < 248 && y + h > 200) return true;  // Tree (50, 200)
    // Camperdown Elm fence
    if (x < 445 && x + w > 390 && y < 115 && y + h > 55) return true;
    // Boathouse dock
    if (x < 600 && x + w > 420 && y < 300 && y + h > 280) return true;
    // Fisherman NPC
    if (npcBlock(x, y, w, h, state.npcs.fisherman.x + 2, state.npcs.fisherman.y + 4, 20, 24)) return true;
  }

  return false;
}
