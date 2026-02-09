// Save system - LocalStorage persistence
// Auto-saves at key moments, manual save with P key
// Continue / New Game prompt on launch

import { state, GAME_STATE } from '../game/state.js';
import { player } from '../game/player.js';
import { inventory } from './inventory.js';

const SAVE_KEY = 'ladybug-quest-save';
const SAVE_VERSION = 2;

export function saveGame() {
  const saveData = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    currentArea: state.currentArea,
    gateUnlocked: state.gateUnlocked,
    logsCleared: state.logsCleared,
    ladybugFound: state.ladybug.found,
    woodsFirstEntry: state.woodsFirstEntry,
    npcs: {},
    worldItems: {},
    player: { x: player.x, y: player.y, direction: player.direction },
    inventory: [...inventory.items]
  };

  for (const [id, npc] of Object.entries(state.npcs)) {
    saveData.npcs[id] = { completed: npc.completed };
    if (npc.behindGate !== undefined) {
      saveData.npcs[id].behindGate = npc.behindGate;
    }
  }

  for (const [id, item] of Object.entries(state.worldItems)) {
    saveData.worldItems[id] = { collected: item.collected };
  }

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (e) {
    // LocalStorage full or unavailable — silently fail
  }
}

export function loadSaveData() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.version !== SAVE_VERSION) return null;
    return data;
  } catch (e) {
    return null;
  }
}

export function applySaveData(data) {
  if (!data) return;

  // Game progress
  state.currentArea = data.currentArea;
  state.gateUnlocked = data.gateUnlocked;
  state.logsCleared = data.logsCleared;
  state.ladybug.found = data.ladybugFound;
  state.woodsFirstEntry = data.woodsFirstEntry ?? true;

  // NPC flags — merge into existing NPC data (preserves dialog, positions, etc.)
  for (const [id, saved] of Object.entries(data.npcs)) {
    if (state.npcs[id]) {
      state.npcs[id].completed = saved.completed;
      if (saved.behindGate !== undefined) {
        state.npcs[id].behindGate = saved.behindGate;
      }
    }
  }

  // World items — merge collected flags
  for (const [id, saved] of Object.entries(data.worldItems)) {
    if (state.worldItems[id]) {
      state.worldItems[id].collected = saved.collected;
    }
  }

  // Player position
  player.x = data.player.x;
  player.y = data.player.y;
  player.direction = data.player.direction;

  // Inventory
  inventory.items = [...data.inventory];

  // Skip cutscene — go straight to playing
  state.currentState = GAME_STATE.PLAYING;
}

export function hasSave() {
  return loadSaveData() !== null;
}

export function deleteSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    // Silently fail
  }
}
