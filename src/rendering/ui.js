// UI rendering - interaction prompts, notifications, and map overlay

import { state } from '../game/state.js';

let ctx;
let canvasWidth;
let canvasHeight;

let saveNotificationTimer = 0;
const SAVE_NOTIFICATION_DURATION = 90;

let itemNotificationTimer = 0;
let itemNotificationText = '';
const ITEM_NOTIFICATION_DURATION = 120;

export function setContext(canvasCtx, w, h) {
  ctx = canvasCtx;
  canvasWidth = w;
  canvasHeight = h || 480;
}

export function drawInteractionPrompt() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(canvasWidth / 2 - 80, 30, 160, 30);
  ctx.fillStyle = '#fff';
  ctx.font = '8px "Press Start 2P"';
  ctx.fillText('Press SPACE', canvasWidth / 2 - 60, 50);
}

export function showSaveNotification() {
  saveNotificationTimer = SAVE_NOTIFICATION_DURATION;
}

export function drawSaveNotification() {
  if (saveNotificationTimer <= 0) return;
  saveNotificationTimer--;

  const alpha = saveNotificationTimer < 30
    ? saveNotificationTimer / 30
    : 1;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(canvasWidth - 140, 10, 130, 28);
  ctx.fillStyle = '#fff';
  ctx.font = '8px "Press Start 2P"';
  ctx.fillText('Game Saved', canvasWidth - 130, 29);
  ctx.restore();
}

export function showItemNotification(itemName) {
  itemNotificationText = itemName;
  itemNotificationTimer = ITEM_NOTIFICATION_DURATION;
}

export function drawItemNotification() {
  if (itemNotificationTimer <= 0) return;
  itemNotificationTimer--;

  const alpha = itemNotificationTimer < 30
    ? itemNotificationTimer / 30
    : Math.min(itemNotificationTimer / 10, 1); // fade in quickly

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';

  const text = `Received: ${itemNotificationText}`;
  const textWidth = Math.max(text.length * 7, 140);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(canvasWidth / 2 - textWidth / 2 - 10, canvasHeight / 2 - 20, textWidth + 20, 32);
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 1;
  ctx.strokeRect(canvasWidth / 2 - textWidth / 2 - 10, canvasHeight / 2 - 20, textWidth + 20, 32);

  ctx.fillStyle = '#ffd700';
  ctx.font = '8px "Press Start 2P"';
  ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);
  ctx.textAlign = 'start';
  ctx.restore();
}

// Map overlay — shows all 6 areas with connections
// Layout:
//              Woods
//                |
//  Boathouse -- Gate Area
//      |
//  Meadow -- Park
//              |
//          Playground

const MAP_AREAS = [
  { id: 'meadow',     label: 'Meadow',     x: 180, y: 260 },
  { id: 'park',        label: 'Park',       x: 380, y: 260 },
  { id: 'playground',  label: 'Playground', x: 380, y: 370 },
  { id: 'boathouse',   label: 'Boathouse',  x: 180, y: 150 },
  { id: 'gate_area',   label: 'Gate Area',  x: 380, y: 150 },
  { id: 'woods',       label: 'Woods',      x: 380, y: 50  },
];

const MAP_CONNECTIONS = [
  { from: 'meadow', to: 'park' },
  { from: 'park', to: 'playground' },
  { from: 'park', to: 'boathouse', label: '' },
  { from: 'boathouse', to: 'gate_area' },
  { from: 'gate_area', to: 'woods', conditional: true },
];

const BOX_W = 120;
const BOX_H = 36;

export function drawMap() {
  // Dark overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Title
  ctx.fillStyle = '#fff';
  ctx.font = '10px "Press Start 2P"';
  ctx.textAlign = 'center';
  ctx.fillText('MAP', canvasWidth / 2, 28);

  ctx.font = '7px "Press Start 2P"';
  ctx.fillStyle = '#aaa';
  ctx.fillText('Press TAB to close', canvasWidth / 2, canvasHeight - 16);

  // Draw connections first (behind boxes)
  MAP_CONNECTIONS.forEach(conn => {
    const from = MAP_AREAS.find(a => a.id === conn.from);
    const to = MAP_AREAS.find(a => a.id === conn.to);

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);

    if (conn.conditional && !state.logsCleared) {
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#555';
    } else {
      ctx.setLineDash([]);
      ctx.strokeStyle = '#888';
    }
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Draw area boxes
  MAP_AREAS.forEach(area => {
    const isCurrentArea = state.currentArea === area.id;
    const bx = area.x - BOX_W / 2;
    const by = area.y - BOX_H / 2;

    // Box background
    ctx.fillStyle = isCurrentArea ? '#c8547a' : '#334';
    ctx.fillRect(bx, by, BOX_W, BOX_H);

    // Box border
    ctx.strokeStyle = isCurrentArea ? '#ff87ab' : '#667';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, BOX_W, BOX_H);

    // Blocked indicator for woods
    if (area.id === 'woods' && !state.logsCleared) {
      ctx.fillStyle = '#664';
      ctx.fillRect(bx, by, BOX_W, BOX_H);
      ctx.strokeStyle = '#553';
      ctx.strokeRect(bx, by, BOX_W, BOX_H);
    }

    // Label
    ctx.fillStyle = isCurrentArea ? '#fff' : '#ccc';
    if (area.id === 'woods' && !state.logsCleared) {
      ctx.fillStyle = '#887';
    }
    ctx.font = '8px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(area.label, area.x, area.y + 4);
  });

  ctx.textAlign = 'start';
}
