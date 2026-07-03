// Save system — localStorage persistence, same approach as the 8-bit
// game's src/systems/save.js but with its own key so the two games'
// saves never collide.

import { state } from './state.js';
import { player } from './player.js';

const SAVE_KEY = 'ladybug-quest-3d-save';
const SAVE_VERSION = 1;

export function saveGame() {
  const saveData = {
    version: SAVE_VERSION,
    timestamp: Date.now(),
    currentArea: state.currentArea,
    gateUnlocked: state.gateUnlocked,
    logsCleared: state.logsCleared,
    ladybugFound: state.ladybug.found,
    ladybugPrompted: state.ladybugPrompted,
    birdStopped: state.birdStopped,
    birdStoppedX: state.birdStoppedX,
    birdStoppedY: state.birdStoppedY,
    proposalDone: state.proposalDone,
    boy: { x: state.boy.x, y: state.boy.y },
    npcs: {},
    worldItems: {},
    player: { x: player.x, y: player.y },
    inventory: [...state.inventory]
  };

  for (const [id, npc] of Object.entries(state.npcs)) {
    saveData.npcs[id] = { completed: npc.completed };
    if (npc.behindGate !== undefined) saveData.npcs[id].behindGate = npc.behindGate;
    if (npc.congratsSaid !== undefined) saveData.npcs[id].congratsSaid = npc.congratsSaid;
  }
  for (const [id, item] of Object.entries(state.worldItems)) {
    saveData.worldItems[id] = { collected: item.collected };
  }

  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (e) {
    // localStorage full or unavailable — silently fail
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

  state.currentArea = data.currentArea;
  state.gateUnlocked = data.gateUnlocked;
  state.logsCleared = data.logsCleared;
  state.ladybug.found = data.ladybugFound;
  state.ladybugPrompted = data.ladybugPrompted ?? false;
  state.birdStopped = data.birdStopped ?? false;
  state.birdStoppedX = data.birdStoppedX ?? 0;
  state.birdStoppedY = data.birdStoppedY ?? 0;
  state.proposalDone = data.proposalDone ?? false;
  if (data.boy) {
    state.boy.x = data.boy.x;
    state.boy.y = data.boy.y;
  }

  // Merge saved flags into the initialized NPC/item data
  for (const [id, saved] of Object.entries(data.npcs)) {
    if (state.npcs[id]) {
      state.npcs[id].completed = saved.completed;
      if (saved.behindGate !== undefined) state.npcs[id].behindGate = saved.behindGate;
      if (saved.congratsSaid !== undefined) state.npcs[id].congratsSaid = saved.congratsSaid;
    }
  }
  for (const [id, saved] of Object.entries(data.worldItems)) {
    if (state.worldItems[id]) {
      state.worldItems[id].collected = saved.collected;
    }
  }

  player.x = data.player.x;
  player.y = data.player.y;
  state.inventory.length = 0;
  state.inventory.push(...data.inventory);
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
