// All sprite drawing functions - procedural pixel art (Pokemon GBA style)
// All sprites use black outlines (#000000) - see DESIGN.md Visual Style section
// Each function checks for a loaded sprite image first; falls back to procedural drawing.

import { state } from '../game/state.js';
import { player } from '../game/player.js';
import { getSprite, getPlayerFrame, getFlowerSpriteKey } from './spriteLoader.js';

let ctx; // Set by renderer.js via setContext()

export function setContext(canvasCtx) {
  ctx = canvasCtx;
}

export function drawOutlinedRect(x, y, w, h, fillColor, outlineColor = '#000') {
  ctx.fillStyle = outlineColor;
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, w, h);
}

export function drawPlayer(x, y) {
  const sprite = getSprite('player');
  if (sprite) {
    const frame = getPlayerFrame(player.direction, player.animFrame);
    if (frame) {
      ctx.drawImage(sprite, frame.sx, frame.sy, frame.sw, frame.sh, x, y, frame.sw, frame.sh);
      return;
    }
  }

  const dir = player.direction;
  const frame = player.animFrame;
  const legOffset = player.isMoving && frame === 1 ? 2 : 0;

  ctx.save();
  ctx.fillStyle = '#000';

  if (dir === 'down') {
    ctx.fillRect(x + 4, y + 1, 16, 31);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 5, y + 2, 14, 6);
    ctx.fillStyle = '#ffd1a3';
    ctx.fillRect(x + 6, y + 4, 12, 11);
    ctx.fillRect(x + 9, y + 13, 6, 2);
    ctx.fillStyle = '#ff69b4';
    ctx.fillRect(x + 5, y + 14, 14, 11);
    ctx.fillStyle = '#ff8dc7';
    ctx.fillRect(x + 3, y + 15, 3, 8);
    ctx.fillRect(x + 18, y + 15, 3, 8);
    ctx.fillStyle = '#ffd1a3';
    ctx.fillRect(x + 3, y + 22, 3, 3);
    ctx.fillRect(x + 18, y + 22, 3, 3);
    ctx.fillStyle = '#4169e1';
    ctx.fillRect(x + 7, y + 25, 3, 6 - legOffset);
    ctx.fillRect(x + 14, y + 25 + legOffset, 3, 6);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 6, y + 30 - legOffset, 4, 2);
    ctx.fillRect(x + 14, y + 30, 4, 2);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 6, y + 5, 1, 3);
    ctx.fillRect(x + 9, y + 5, 1, 3);
    ctx.fillRect(x + 12, y + 5, 1, 3);
    ctx.fillRect(x + 15, y + 5, 1, 3);
    ctx.fillRect(x + 17, y + 5, 1, 3);
    ctx.fillStyle = '#dc143c';
    ctx.fillRect(x + 6, y + 10, 12, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 7, y + 11, 1, 1);
    ctx.fillRect(x + 9, y + 11, 1, 1);
    ctx.fillRect(x + 11, y + 11, 1, 1);
    ctx.fillRect(x + 13, y + 11, 1, 1);
    ctx.fillRect(x + 15, y + 11, 1, 1);
    ctx.fillRect(x + 17, y + 11, 1, 1);
    ctx.fillRect(x + 8, y + 12, 1, 1);
    ctx.fillRect(x + 12, y + 12, 1, 1);
    ctx.fillRect(x + 16, y + 12, 1, 1);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 8, y + 7, 3, 3);
    ctx.fillRect(x + 14, y + 7, 3, 3);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 8, y + 7, 2, 2);
    ctx.fillRect(x + 14, y + 7, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 9, y + 7, 1, 1);
    ctx.fillRect(x + 15, y + 7, 1, 1);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 7, y + 6, 3, 1);
    ctx.fillRect(x + 14, y + 6, 3, 1);

  } else if (dir === 'up') {
    ctx.fillRect(x + 4, y + 1, 16, 31);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 5, y + 2, 14, 10);
    ctx.fillRect(x + 4, y + 6, 16, 8);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 6, y + 10, 1, 3);
    ctx.fillRect(x + 10, y + 11, 1, 3);
    ctx.fillRect(x + 14, y + 10, 1, 3);
    ctx.fillRect(x + 17, y + 11, 1, 3);
    ctx.fillStyle = '#ff69b4';
    ctx.fillRect(x + 5, y + 14, 14, 11);
    ctx.fillStyle = '#ff8dc7';
    ctx.fillRect(x + 3, y + 15, 3, 8);
    ctx.fillRect(x + 18, y + 15, 3, 8);
    ctx.fillStyle = '#ffd1a3';
    ctx.fillRect(x + 3, y + 22, 3, 3);
    ctx.fillRect(x + 18, y + 22, 3, 3);
    ctx.fillStyle = '#4169e1';
    ctx.fillRect(x + 7, y + 25, 3, 6 - legOffset);
    ctx.fillRect(x + 14, y + 25 + legOffset, 3, 6);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 6, y + 30 - legOffset, 4, 2);
    ctx.fillRect(x + 14, y + 30, 4, 2);
    ctx.fillStyle = '#ffd1a3';
    ctx.fillRect(x + 6, y + 4, 12, 6);

  } else if (dir === 'left') {
    ctx.fillRect(x + 4, y + 1, 15, 31);
    ctx.fillStyle = '#ff69b4';
    ctx.fillRect(x + 5, y + 14, 13, 11);
    ctx.fillStyle = '#ff8dc7';
    ctx.fillRect(x + 3, y + 15, 4, 8);
    ctx.fillStyle = '#ffd1a3';
    ctx.fillRect(x + 3, y + 22, 4, 3);
    ctx.fillStyle = '#4169e1';
    ctx.fillRect(x + 7, y + 25, 3, 6 - legOffset);
    ctx.fillRect(x + 13, y + 25 + legOffset, 3, 6);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 6, y + 30 - legOffset, 4, 2);
    ctx.fillRect(x + 13, y + 30, 4, 2);
    ctx.fillStyle = '#ffd1a3';
    ctx.fillRect(x + 6, y + 4, 11, 11);
    ctx.fillRect(x + 10, y + 13, 5, 2);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 5, y + 2, 12, 4);
    ctx.fillRect(x + 5, y + 5, 4, 10);
    ctx.fillRect(x + 6, y + 12, 3, 3);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 6, y + 6, 1, 3);
    ctx.fillRect(x + 7, y + 10, 1, 2);
    ctx.fillStyle = '#dc143c';
    ctx.fillRect(x + 9, y + 9, 7, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 10, y + 10, 1, 1);
    ctx.fillRect(x + 12, y + 10, 1, 1);
    ctx.fillRect(x + 14, y + 10, 1, 1);
    ctx.fillRect(x + 11, y + 11, 1, 1);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 9, y + 7, 3, 2);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 9, y + 7, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 10, y + 7, 1, 1);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 8, y + 6, 3, 1);

  } else if (dir === 'right') {
    ctx.fillRect(x + 5, y + 1, 15, 31);
    ctx.fillStyle = '#ff69b4';
    ctx.fillRect(x + 6, y + 14, 13, 11);
    ctx.fillStyle = '#ff8dc7';
    ctx.fillRect(x + 17, y + 15, 4, 8);
    ctx.fillStyle = '#ffd1a3';
    ctx.fillRect(x + 17, y + 22, 4, 3);
    ctx.fillStyle = '#4169e1';
    ctx.fillRect(x + 7, y + 25, 3, 6 - legOffset);
    ctx.fillRect(x + 13, y + 25 + legOffset, 3, 6);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 6, y + 30 - legOffset, 4, 2);
    ctx.fillRect(x + 12, y + 30, 4, 2);
    ctx.fillStyle = '#ffd1a3';
    ctx.fillRect(x + 7, y + 4, 11, 11);
    ctx.fillRect(x + 9, y + 13, 5, 2);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 7, y + 2, 12, 4);
    ctx.fillRect(x + 15, y + 5, 4, 10);
    ctx.fillRect(x + 15, y + 12, 3, 3);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 17, y + 6, 1, 3);
    ctx.fillRect(x + 16, y + 10, 1, 2);
    ctx.fillStyle = '#dc143c';
    ctx.fillRect(x + 8, y + 9, 7, 4);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 9, y + 10, 1, 1);
    ctx.fillRect(x + 11, y + 10, 1, 1);
    ctx.fillRect(x + 13, y + 10, 1, 1);
    ctx.fillRect(x + 10, y + 11, 1, 1);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 12, y + 7, 3, 2);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 13, y + 7, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 13, y + 7, 1, 1);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 13, y + 6, 3, 1);
  }

  ctx.restore();
}

export function drawBoy(x, y) {
  const sprite = getSprite('boy');
  if (sprite) { ctx.drawImage(sprite, x, y); return; }

  ctx.save();
  ctx.fillStyle = '#000';
  ctx.fillRect(x + 4, y + 1, 16, 31);
  ctx.fillStyle = '#4682b4';
  ctx.fillRect(x + 5, y + 14, 14, 11);
  ctx.fillStyle = '#5a9bd4';
  ctx.fillRect(x + 3, y + 15, 3, 8);
  ctx.fillRect(x + 18, y + 15, 3, 8);
  ctx.fillStyle = '#ffd1a3';
  ctx.fillRect(x + 3, y + 22, 3, 3);
  ctx.fillRect(x + 18, y + 22, 3, 3);
  ctx.fillStyle = '#2c5aa0';
  ctx.fillRect(x + 7, y + 25, 3, 6);
  ctx.fillRect(x + 14, y + 25, 3, 6);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(x + 6, y + 30, 4, 2);
  ctx.fillRect(x + 14, y + 30, 4, 2);
  ctx.fillStyle = '#ffd1a3';
  ctx.fillRect(x + 6, y + 4, 12, 11);
  ctx.fillStyle = '#2c2c2c';
  ctx.fillRect(x + 5, y + 1, 14, 5);
  ctx.fillRect(x + 4, y + 3, 2, 3);
  ctx.fillRect(x + 18, y + 3, 2, 3);
  ctx.fillRect(x + 8, y, 3, 2);
  ctx.fillRect(x + 13, y, 3, 2);
  ctx.fillStyle = '#9370db';
  ctx.fillRect(x + 6, y + 10, 4, 4);
  ctx.fillStyle = '#4169e1';
  ctx.fillRect(x + 10, y + 10, 4, 4);
  ctx.fillStyle = '#ff1493';
  ctx.fillRect(x + 14, y + 10, 4, 4);
  ctx.fillStyle = '#7b68ee';
  ctx.fillRect(x + 9, y + 11, 2, 2);
  ctx.fillRect(x + 13, y + 11, 2, 2);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 8, y + 7, 3, 2);
  ctx.fillRect(x + 14, y + 7, 3, 2);
  ctx.fillStyle = '#654321';
  ctx.fillRect(x + 8, y + 7, 2, 2);
  ctx.fillRect(x + 14, y + 7, 2, 2);
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + 9, y + 7, 1, 1);
  ctx.fillRect(x + 15, y + 7, 1, 1);
  ctx.restore();
}

export function drawNPC(npc, x, y) {
  const npcs = state.npcs;

  // Subtle idle bob animation (each NPC gets a unique phase from their x position)
  const bobOffset = Math.round(Math.sin(Date.now() * 0.002 + (npc.x || 0)) * 1.5);
  y += bobOffset;

  // Try sprite lookup by NPC identity
  let spriteKey = null;
  if (npc === npcs.dog) spriteKey = 'dog';
  else if (npc === npcs.bird) spriteKey = 'bird';
  else if (npc === npcs.squirrel) spriteKey = 'squirrel';
  else if (npc === npcs.hippie) spriteKey = 'hippie';
  else if (npc === npcs.fisherman) spriteKey = 'fisherman';
  else if (npc === npcs.kid) spriteKey = 'kid';
  else if (npc === npcs.parent) spriteKey = 'parent';
  else if (npc === npcs.coffeeCart) spriteKey = 'coffeeCart';

  if (spriteKey) {
    const sprite = getSprite(spriteKey);
    if (sprite) { ctx.drawImage(sprite, x, y); return; }
  }

  ctx.save();

  if (npc === npcs.dog) {
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 1, y + 7, 34, 28);
    ctx.fillStyle = '#daa520';
    ctx.fillRect(x + 2, y + 14, 24, 12);
    ctx.fillStyle = '#f0e68c';
    ctx.fillRect(x + 14, y + 16, 10, 8);
    ctx.fillStyle = '#daa520';
    ctx.fillRect(x + 4, y + 26, 4, 8);
    ctx.fillRect(x + 10, y + 26, 4, 8);
    ctx.fillRect(x + 16, y + 26, 4, 8);
    ctx.fillRect(x + 22, y + 26, 4, 8);
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(x + 4, y + 32, 4, 2);
    ctx.fillRect(x + 10, y + 32, 4, 2);
    ctx.fillRect(x + 16, y + 32, 4, 2);
    ctx.fillRect(x + 22, y + 32, 4, 2);
    ctx.fillStyle = '#daa520';
    ctx.fillRect(x + 18, y + 4, 12, 12);
    ctx.fillStyle = '#f0e68c';
    ctx.fillRect(x + 26, y + 10, 6, 6);
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(x + 16, y + 4, 4, 8);
    ctx.fillRect(x + 28, y + 4, 4, 8);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 30, y + 12, 3, 3);
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(x + 22, y + 8, 2, 2);
    ctx.fillRect(x + 27, y + 8, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 23, y + 8, 1, 1);
    ctx.fillRect(x + 28, y + 8, 1, 1);
    ctx.fillStyle = '#daa520';
    ctx.fillRect(x, y + 12, 4, 8);
    ctx.fillRect(x - 2, y + 8, 4, 6);
    ctx.fillStyle = '#dc143c';
    ctx.fillRect(x + 18, y + 14, 12, 3);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x + 23, y + 14, 2, 3);

  } else if (npc === npcs.bird) {
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 4, y + 3, 20, 22);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 6, y + 10, 12, 10);
    ctx.fillStyle = '#ff6347';
    ctx.fillRect(x + 8, y + 12, 8, 6);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 6, y + 12, 6, 6);
    ctx.fillRect(x + 5, y + 14, 3, 4);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 8, y + 4, 10, 8);
    ctx.fillStyle = '#ffa500';
    ctx.fillRect(x + 18, y + 8, 4, 3);
    ctx.fillRect(x + 20, y + 10, 2, 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 12, y + 7, 2, 2);
    ctx.fillRect(x + 15, y + 7, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 13, y + 7, 1, 1);
    ctx.fillRect(x + 16, y + 7, 1, 1);
    ctx.fillStyle = '#ff8c00';
    ctx.fillRect(x + 10, y + 20, 2, 4);
    ctx.fillRect(x + 14, y + 20, 2, 4);
    ctx.fillRect(x + 8, y + 24, 4, 1);
    ctx.fillRect(x + 14, y + 24, 4, 1);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 4, y + 14, 4, 6);
    ctx.fillRect(x + 2, y + 16, 4, 4);

  } else if (npc === npcs.squirrel) {
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 6, y + 3, 34, 28);
    ctx.fillStyle = '#8b6914';
    ctx.fillRect(x - 4, y + 4, 10, 18);
    ctx.fillRect(x - 6, y + 8, 4, 12);
    ctx.fillRect(x + 4, y + 6, 4, 14);
    ctx.fillStyle = '#a0832d';
    ctx.fillRect(x - 2, y + 8, 3, 10);
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(x + 6, y + 14, 14, 10);
    ctx.fillStyle = '#d2a679';
    ctx.fillRect(x + 8, y + 16, 10, 6);
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(x + 6, y + 24, 4, 6);
    ctx.fillRect(x + 16, y + 24, 4, 6);
    ctx.fillRect(x + 10, y + 22, 3, 4);
    ctx.fillRect(x + 15, y + 22, 3, 4);
    ctx.fillRect(x + 10, y + 6, 10, 10);
    ctx.fillRect(x + 10, y + 4, 3, 4);
    ctx.fillRect(x + 17, y + 4, 3, 4);
    ctx.fillStyle = '#d2a679';
    ctx.fillRect(x + 11, y + 5, 1, 2);
    ctx.fillRect(x + 18, y + 5, 1, 2);
    ctx.fillRect(x + 14, y + 12, 6, 4);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 16, y + 13, 2, 2);
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(x + 13, y + 9, 2, 2);
    ctx.fillRect(x + 18, y + 9, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 14, y + 9, 1, 1);
    ctx.fillRect(x + 19, y + 9, 1, 1);
    ctx.fillStyle = '#d2a679';
    ctx.fillRect(x + 10, y + 12, 3, 3);
    ctx.fillRect(x + 19, y + 12, 3, 3);

  } else if (npc === npcs.hippie) {
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 3, y + 1, 18, 28);
    ctx.fillStyle = '#9370db';
    ctx.fillRect(x + 6, y + 14, 12, 10);
    ctx.fillStyle = '#ffd1a3';
    ctx.fillRect(x + 6, y + 4, 12, 10);
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(x + 4, y + 2, 16, 4);
    ctx.fillRect(x + 4, y + 6, 2, 14);
    ctx.fillRect(x + 18, y + 6, 2, 14);
    ctx.fillStyle = '#ff6347';
    ctx.fillRect(x + 5, y + 6, 14, 2);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 9, y + 9, 2, 2);
    ctx.fillRect(x + 13, y + 9, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 10, y + 9, 1, 1);
    ctx.fillRect(x + 14, y + 9, 1, 1);
    ctx.fillStyle = '#c97a5f';
    ctx.fillRect(x + 9, y + 12, 6, 1);
    ctx.fillStyle = '#4169e1';
    ctx.fillRect(x + 4, y + 24, 6, 4);
    ctx.fillRect(x + 14, y + 24, 6, 4);

  } else if (npc === npcs.fisherman) {
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 4, y, 16, 32);
    ctx.fillStyle = '#2f4f4f';
    ctx.fillRect(x + 6, y + 14, 12, 10);
    ctx.fillStyle = '#ffd1a3';
    ctx.fillRect(x + 6, y + 4, 12, 10);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 4, y + 2, 16, 3);
    ctx.fillRect(x + 6, y, 12, 4);
    ctx.fillStyle = '#696969';
    ctx.fillRect(x + 6, y + 10, 12, 4);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 9, y + 8, 2, 2);
    ctx.fillRect(x + 13, y + 8, 2, 2);
    ctx.fillStyle = '#2f4f4f';
    ctx.fillRect(x + 4, y + 15, 3, 8);
    ctx.fillRect(x + 17, y + 15, 3, 8);
    ctx.fillRect(x + 8, y + 24, 3, 6);
    ctx.fillRect(x + 13, y + 24, 3, 6);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 7, y + 29, 4, 2);
    ctx.fillRect(x + 13, y + 29, 4, 2);
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 16);
    ctx.lineTo(x + 24, y + 4);
    ctx.stroke();

  } else if (npc === npcs.kid) {
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 5, y + 2, 14, 26);
    ctx.fillStyle = '#ffa500';
    ctx.fillRect(x + 6, y + 12, 12, 8);
    ctx.fillStyle = '#ffd1a3';
    ctx.fillRect(x + 6, y + 3, 12, 9);
    ctx.fillStyle = '#ff8c00';
    ctx.fillRect(x + 5, y + 2, 14, 4);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 8, y + 6, 2, 2);
    ctx.fillRect(x + 14, y + 6, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 9, y + 6, 1, 1);
    ctx.fillRect(x + 15, y + 6, 1, 1);
    ctx.fillStyle = '#c97a5f';
    ctx.fillRect(x + 8, y + 10, 8, 1);
    ctx.fillRect(x + 7, y + 9, 1, 1);
    ctx.fillRect(x + 16, y + 9, 1, 1);
    ctx.fillStyle = '#ffa500';
    ctx.fillRect(x + 4, y + 13, 3, 6);
    ctx.fillRect(x + 17, y + 13, 3, 6);
    ctx.fillStyle = '#4169e1';
    ctx.fillRect(x + 8, y + 20, 3, 6);
    ctx.fillRect(x + 13, y + 20, 3, 6);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 7, y + 25, 4, 2);
    ctx.fillRect(x + 13, y + 25, 4, 2);

  } else if (npc === npcs.parent) {
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 4, y + 1, 16, 31);
    ctx.fillStyle = '#6b8e23';
    ctx.fillRect(x + 5, y + 14, 14, 11);
    ctx.fillStyle = '#ffd1a3';
    ctx.fillRect(x + 6, y + 4, 12, 10);
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x + 5, y + 2, 14, 4);
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 9, y + 8, 2, 2);
    ctx.fillRect(x + 13, y + 8, 2, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 10, y + 8, 1, 1);
    ctx.fillRect(x + 14, y + 8, 1, 1);
    ctx.fillStyle = '#c97a5f';
    ctx.fillRect(x + 9, y + 11, 6, 1);
    ctx.fillStyle = '#6b8e23';
    ctx.fillRect(x + 3, y + 15, 3, 8);
    ctx.fillRect(x + 18, y + 15, 3, 8);
    ctx.fillStyle = '#2c5aa0';
    ctx.fillRect(x + 7, y + 25, 3, 6);
    ctx.fillRect(x + 14, y + 25, 3, 6);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 6, y + 30, 4, 2);
    ctx.fillRect(x + 14, y + 30, 4, 2);

  } else if (npc === npcs.coffeeCart) {
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 5, y + 5, 42, 32);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x, y + 10, 32, 20);
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(x - 4, y + 6, 40, 5);
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(x + 8, y + 14, 16, 10);
    ctx.fillStyle = '#fff';
    ctx.font = '6px "Press Start 2P"';
    ctx.fillText('COFFEE', x + 2, y + 4);
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(x + 8, y + 30, 4, 0, Math.PI * 2);
    ctx.arc(x + 24, y + 30, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawLadybug(x, y) {
  if (state.ladybug.found) return;

  state.ladybug.pulse = (state.ladybug.pulse + 0.1) % (Math.PI * 2);
  const scale = 1 + Math.sin(state.ladybug.pulse) * 0.2;
  const size = state.ladybug.size * scale;

  const sprite = getSprite('ladybug');
  if (sprite) {
    ctx.save();
    ctx.translate(x, y);
    const drawSize = size;
    ctx.drawImage(sprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(x, y);

  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
  gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(-size * 1.5, -size * 1.5, size * 3, size * 3);

  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000';
  ctx.fillRect(-1, -size / 2, 2, size);

  ctx.beginPath();
  ctx.arc(-3, -3, size / 6, 0, Math.PI * 2);
  ctx.arc(3, 3, size / 6, 0, Math.PI * 2);
  ctx.arc(-2, 3, size / 8, 0, Math.PI * 2);
  ctx.arc(3, -2, size / 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, -size / 2.5, size / 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawGate(x, y) {
  if (!state.gateUnlocked) {
    const sprite = getSprite('gate');
    if (sprite) { ctx.drawImage(sprite, x - 2, y - 2); return; }

    ctx.fillStyle = '#000';
    ctx.fillRect(x - 2, y - 2, 28, 36);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x, y, 4, 32);
    ctx.fillRect(x + 20, y, 4, 32);
    ctx.fillRect(x, y + 10, 24, 3);
    ctx.fillRect(x, y + 20, 24, 3);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x + 10, y + 14, 6, 8);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 12, y + 17, 2, 3);
  }
}

export function drawLogs(x, y) {
  if (!state.logsCleared) {
    const sprite = getSprite('logs');
    if (sprite) { ctx.drawImage(sprite, x - 22, y - 2); return; }

    ctx.fillStyle = '#000';
    ctx.fillRect(x - 22, y - 2, 54, 34);
    ctx.fillStyle = '#8b4513';
    for (let i = 0; i < 3; i++) {
      const offsetY = i * 10;
      ctx.fillRect(x - 20, y + offsetY, 50, 8);
      ctx.fillStyle = '#654321';
      ctx.fillRect(x - 18, y + offsetY + 2, 46, 4);
      ctx.fillStyle = '#8b4513';
    }
  }
}

export function drawLeafPile(x, y) {
  const sprite = getSprite('leaf_pile');
  if (sprite) { ctx.drawImage(sprite, x - 8, y - 6); return; }

  const colors = ['#d2691e', '#ff6347', '#ffa500', '#8b4513'];
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = colors[i % colors.length];
    const offsetX = Math.sin(i * 2) * 8;
    const offsetY = Math.cos(i * 2) * 6;
    ctx.fillRect(x + offsetX, y + offsetY, 6, 4);
  }
}

export function drawTree(x, y) {
  const sprite = getSprite('tree');
  if (sprite) { ctx.drawImage(sprite, x, y); return; }

  ctx.fillStyle = '#000';
  ctx.fillRect(x + 9, y + 15, 14, 18);
  ctx.fillRect(x + 5, y + 5, 22, 16);
  ctx.fillStyle = '#654321';
  ctx.fillRect(x + 10, y + 16, 12, 16);
  ctx.fillStyle = '#4a2f1a';
  ctx.fillRect(x + 10, y + 16, 4, 16);
  ctx.fillStyle = '#2d5016';
  ctx.fillRect(x + 6, y + 6, 20, 14);
  ctx.fillStyle = '#3a6b1f';
  ctx.fillRect(x + 8, y + 8, 16, 10);
  ctx.fillStyle = '#4a7c2f';
  ctx.fillRect(x + 10, y + 10, 12, 8);
}

export function drawLargeTree(x, y) {
  const sprite = getSprite('tree_large');
  if (sprite) { ctx.drawImage(sprite, x, y); return; }

  // Large oak tree - 3x scale
  const scale = 3;
  ctx.fillStyle = '#000';
  ctx.fillRect(x + 9 * scale, y + 15 * scale, 14 * scale, 18 * scale);
  ctx.fillRect(x + 5 * scale, y + 5 * scale, 22 * scale, 16 * scale);
  ctx.fillStyle = '#654321';
  ctx.fillRect(x + 10 * scale, y + 16 * scale, 12 * scale, 16 * scale);
  ctx.fillStyle = '#4a2f1a';
  ctx.fillRect(x + 10 * scale, y + 16 * scale, 4 * scale, 16 * scale);
  ctx.fillStyle = '#2d5016';
  ctx.fillRect(x + 6 * scale, y + 6 * scale, 20 * scale, 14 * scale);
  ctx.fillStyle = '#3a6b1f';
  ctx.fillRect(x + 8 * scale, y + 8 * scale, 16 * scale, 10 * scale);
  ctx.fillStyle = '#4a7c2f';
  ctx.fillRect(x + 10 * scale, y + 10 * scale, 12 * scale, 8 * scale);
}

export function drawCamperdownElm(x, y) {
  const sprite = getSprite('camperdown_elm');
  if (sprite) { ctx.drawImage(sprite, x - 2, y + 8); return; }

  // Camperdown Elm - weeping/drooping canopy
  // Trunk
  ctx.fillStyle = '#000';
  ctx.fillRect(x + 14, y + 20, 8, 16);
  ctx.fillStyle = '#654321';
  ctx.fillRect(x + 15, y + 21, 6, 14);

  // Wide, low, drooping canopy
  ctx.fillStyle = '#000';
  ctx.fillRect(x - 2, y + 8, 40, 20);
  ctx.fillStyle = '#2d5016';
  ctx.fillRect(x, y + 10, 36, 16);
  ctx.fillStyle = '#3a6b1f';
  ctx.fillRect(x + 2, y + 12, 32, 12);

  // Plaque
  ctx.fillStyle = '#8b7355';
  ctx.fillRect(x + 8, y + 38, 20, 8);
  ctx.fillStyle = '#000';
  ctx.font = '6px "Press Start 2P"';
  ctx.fillText('Camperdown', x + 9, y + 43);
  ctx.fillText('Elm', x + 13, y + 48);
}

export function drawFlowers(x, y, color) {
  const spriteKey = getFlowerSpriteKey(color);
  if (spriteKey) {
    const sprite = getSprite(spriteKey);
    if (sprite) { ctx.drawImage(sprite, x - 1, y - 1); return; }
  }

  ctx.fillStyle = '#000';
  ctx.fillRect(x - 1, y - 1, 8, 8);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 2, 2);
  ctx.fillRect(x + 4, y, 2, 2);
  ctx.fillRect(x, y + 4, 2, 2);
  ctx.fillRect(x + 4, y + 4, 2, 2);
  ctx.fillStyle = '#ffeb3b';
  ctx.fillRect(x + 2, y + 2, 2, 2);
  ctx.fillStyle = '#228b22';
  ctx.fillRect(x + 2, y + 6, 2, 6);
}

export function drawRock(x, y) {
  const sprite = getSprite('rock');
  if (sprite) { ctx.drawImage(sprite, x - 2, y - 2); return; }

  ctx.fillStyle = '#000';
  ctx.fillRect(x - 2, y - 2, 28, 24);
  ctx.fillStyle = '#696969';
  ctx.beginPath();
  ctx.ellipse(x + 12, y + 10, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#808080';
  ctx.beginPath();
  ctx.ellipse(x + 10, y + 8, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
}

export function drawGroundTexture(canvasWidth, canvasHeight) {
  ctx.fillStyle = '#7cb342';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.fillStyle = '#689f38';
  // Static pattern using modulo for deterministic placement
  for (let x = 0; x < canvasWidth; x += 16) {
    for (let y = 0; y < canvasHeight; y += 16) {
      if ((x + y) % 48 < 20) {
        ctx.fillRect(x + ((x * 7 + y * 11) % 8), y + ((x * 13 + y * 5) % 8), 4, 4);
      }
    }
  }
  ctx.fillStyle = '#558b2f';
  // Static darker grass blades using deterministic positions
  for (let i = 0; i < 50; i++) {
    const tx = (i * 137) % canvasWidth;
    const ty = (i * 219) % canvasHeight;
    ctx.fillRect(tx, ty, 2, 3);
    ctx.fillRect(tx + 2, ty + 1, 2, 3);
  }
}

export function drawNavigationIndicator(x, y, direction, text) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;

  if (direction === 'up') {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 8, y + 12);
    ctx.lineTo(x + 8, y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (direction === 'down') {
    ctx.beginPath();
    ctx.moveTo(x, y + 12);
    ctx.lineTo(x - 8, y);
    ctx.lineTo(x + 8, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (direction === 'left') {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 12, y - 8);
    ctx.lineTo(x + 12, y + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (direction === 'right') {
    ctx.beginPath();
    ctx.moveTo(x + 12, y);
    ctx.lineTo(x, y - 8);
    ctx.lineTo(x, y + 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  if (text) {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.font = '8px "Press Start 2P"';
    ctx.strokeText(text, x - 20, y + 25);
    ctx.fillText(text, x - 20, y + 25);
  }

  ctx.restore();
}

// Environmental animation helpers

export function drawButterfly(x, y, frameCount) {
  const t = frameCount * 0.03 + x * 0.1;
  const bx = x + Math.sin(t) * 20;
  const by = y + Math.cos(t * 0.7) * 12;
  const wingSpread = Math.abs(Math.sin(frameCount * 0.15 + x)) * 3;

  ctx.fillStyle = '#fff';
  ctx.fillRect(bx - wingSpread, by, wingSpread, 2);
  ctx.fillRect(bx + 1, by, wingSpread, 2);
  ctx.fillStyle = '#ffeb3b';
  ctx.fillRect(bx - wingSpread + 1, by - 1, Math.max(wingSpread - 1, 1), 1);
  ctx.fillRect(bx + 2, by - 1, Math.max(wingSpread - 1, 1), 1);
  ctx.fillStyle = '#000';
  ctx.fillRect(bx, by, 1, 2);
}

export function drawFirefly(x, y, frameCount) {
  const t = frameCount * 0.02 + x * 0.3 + y * 0.2;
  const fx = x + Math.sin(t) * 15;
  const fy = y + Math.cos(t * 0.6) * 10;
  const glow = Math.max(0, Math.sin(frameCount * 0.05 + x * 0.5));

  if (glow > 0.3) {
    ctx.save();
    ctx.globalAlpha = glow * 0.4;
    ctx.fillStyle = '#ffff88';
    ctx.beginPath();
    ctx.arc(fx, fy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = glow;
    ctx.fillStyle = '#ffffcc';
    ctx.fillRect(fx - 1, fy - 1, 2, 2);
    ctx.restore();
  }
}
