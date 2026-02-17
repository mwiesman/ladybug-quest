// UI rendering - interaction prompts, notifications, and map overlay

import { state, GAME_STATE } from '../game/state.js';

function isTouch() {
  return document.body.classList.contains('touch');
}

let ctx;
let canvasWidth;
let canvasHeight;

let saveNotificationTimer = 0;
const SAVE_NOTIFICATION_DURATION = 90;

let itemNotificationTimer = 0;
let itemNotificationText = '';
let itemNotificationType = 'item'; // 'item' (gold) or 'action' (green)
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

export function showItemNotification(itemName, type = 'item') {
  itemNotificationText = itemName;
  itemNotificationType = type;
  itemNotificationTimer = ITEM_NOTIFICATION_DURATION;
}

export function drawItemNotification() {
  if (itemNotificationTimer <= 0) return;

  // Pause timer during dialog so notifications don't vanish behind dialog box
  if (state.currentState !== GAME_STATE.DIALOG && !state.currentDialog) {
    itemNotificationTimer--;
  }

  const alpha = itemNotificationTimer < 30
    ? itemNotificationTimer / 30
    : Math.min(itemNotificationTimer / 10, 1); // fade in quickly

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = 'center';

  const isAction = itemNotificationType === 'action';
  const text = isAction ? itemNotificationText : `Received: ${itemNotificationText}`;
  const color = isAction ? '#90ee90' : '#ffd700'; // light green for actions, gold for items
  const textWidth = Math.max(text.length * 7, 140);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(canvasWidth / 2 - textWidth / 2 - 10, canvasHeight / 2 - 20, textWidth + 20, 32);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(canvasWidth / 2 - textWidth / 2 - 10, canvasHeight / 2 - 20, textWidth + 20, 32);

  ctx.fillStyle = color;
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
  ctx.fillText(isTouch() ? 'Tap to close' : 'Press TAB to close', canvasWidth / 2, canvasHeight - 16);

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

// --- Area transition exit indicators (touch devices) ---

export const AREA_EXITS = {
  meadow: [
    { edge: 'right', label: 'Park' }
  ],
  park: [
    { edge: 'left', label: 'Meadow' },
    { edge: 'top', label: 'Boathouse' },
    { edge: 'bottom', label: 'Playground' }
  ],
  playground: [
    { edge: 'top', label: 'Park' }
  ],
  boathouse: [
    { edge: 'bottom', label: 'Park', walkX: 325, ix: 275, iw: 100 },
    { edge: 'right', label: 'Gate Area' }
  ],
  gate_area: [
    { edge: 'left', label: 'Boathouse' },
    { edge: 'top', label: 'Woods', condition: 'logsCleared', walkX: 300, ix: 230 }
  ],
  woods: [
    { edge: 'bottom', label: 'Gate Area' }
  ]
};

const EXIT_EDGES = {
  right:  { ix: 568, iy: 195, iw: 68, ih: 90, walkX: 640, walkY: 240 },
  left:   { ix: 4,   iy: 195, iw: 68, ih: 90, walkX: 0,   walkY: 240 },
  top:    { ix: 250, iy: 4,   iw: 140, ih: 42, walkX: 320, walkY: 0   },
  bottom: { ix: 250, iy: 434, iw: 140, ih: 42, walkX: 320, walkY: 480 },
};

export function getExitBounds(exit) {
  const d = EXIT_EDGES[exit.edge];
  return {
    x: exit.ix ?? d.ix,
    y: exit.iy ?? d.iy,
    w: exit.iw ?? d.iw,
    h: exit.ih ?? d.ih,
    walkX: exit.walkX ?? d.walkX,
    walkY: exit.walkY ?? d.walkY,
  };
}

const EXIT_ARROWS = { right: '▸', left: '◂', top: '▴', bottom: '▾' };

export function drawTransitionIndicators() {
  const exits = AREA_EXITS[state.currentArea];
  if (!exits) return;

  const pulse = 0.45 + 0.15 * Math.sin(state.frameCount * 0.05);

  for (const exit of exits) {
    if (exit.condition && !state[exit.condition]) continue;

    const b = getExitBounds(exit);
    ctx.save();

    // Background
    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#000';
    ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);

    // Text
    ctx.globalAlpha = pulse + 0.25;
    ctx.fillStyle = '#fff';
    ctx.font = '7px "Press Start 2P"';
    ctx.textAlign = 'center';
    const cx = b.x + b.w / 2;
    const cy = b.y + b.h / 2;

    if (exit.edge === 'left' || exit.edge === 'right') {
      ctx.fillText(EXIT_ARROWS[exit.edge], cx, cy - 14);
      const label = exit.label;
      if (label.length > 8 && label.includes(' ')) {
        const parts = label.split(' ');
        ctx.fillText(parts[0], cx, cy + 4);
        ctx.fillText(parts[1], cx, cy + 18);
      } else {
        ctx.fillText(label, cx, cy + 8);
      }
    } else {
      ctx.fillText(EXIT_ARROWS[exit.edge] + ' ' + exit.label, cx, cy + 3);
    }

    ctx.textAlign = 'start';
    ctx.restore();
  }
}
