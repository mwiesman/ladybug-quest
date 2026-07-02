// 3D runtime state.
// Reuses the 8-bit game's data files as the source of truth for the quest:
// NPC dialog/trades, world items, area graph, and cutscene text all come
// from ../../src/data. Logical positions stay in the original 640x480
// coordinate space so shared positions and interaction ranges work verbatim;
// they are mapped onto the 3D ground plane at render time (see coords below).

import { NPC_DATA } from '../../src/data/npcs.js';
import { WORLD_ITEMS, STARTING_ITEMS } from '../../src/data/items.js';

export const MODE = {
  INTRO: 'intro',
  PLAYING: 'playing',
  DIALOG: 'dialog',
  ENDING: 'ending',
  CREDITS: 'credits'
};

// 640x480 logical space -> world units centered on origin
export const WORLD_SCALE = 1 / 20;
export const toX = (x) => (x - 320) * WORLD_SCALE;
export const toZ = (y) => (y - 240) * WORLD_SCALE;
export const HALF_W = 320 * WORLD_SCALE; // 16
export const HALF_D = 240 * WORLD_SCALE; // 12

function initNPCs() {
  const result = {};
  for (const [id, data] of Object.entries(NPC_DATA)) {
    result[id] = { ...data, id, completed: data.completed ?? false };
  }
  return result;
}

function initWorldItems() {
  const result = {};
  for (const [id, data] of Object.entries(WORLD_ITEMS)) {
    result[id] = { ...data };
  }
  return result;
}

export const state = {
  mode: MODE.INTRO,
  currentArea: 'meadow',

  npcs: initNPCs(),
  worldItems: initWorldItems(),

  inventory: [...STARTING_ITEMS],

  gateUnlocked: false,
  logsCleared: false,

  ladybug: { x: 295, y: 195, found: false },
  boy: { x: 290, y: 270, area: 'meadow' },

  // Dialog
  currentDialog: null,
  dialogIndex: 0,
  dialogPhase: 'main', // main | afterTrade | decline
  tradePrompted: false,
  ladybugPrompted: false,

  // Bird flight freeze (once you talk to it, it lands)
  birdStopped: false,
  birdStoppedX: 0,
  birdStoppedY: 0,

  // Area transition
  transitioning: false,

  elapsed: 0
};

export const inventory = {
  hasItem: (item) => state.inventory.includes(item),
  addItem(item) {
    state.inventory.push(item);
    notifyChange();
  },
  removeItem(item) {
    const i = state.inventory.indexOf(item);
    if (i > -1) state.inventory.splice(i, 1);
    notifyChange();
  }
};

let changeListener = null;
export function onInventoryChange(fn) { changeListener = fn; }
function notifyChange() { if (changeListener) changeListener(state.inventory); }
