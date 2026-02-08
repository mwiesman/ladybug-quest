// Interaction detection - proximity checks for NPCs, items, and world objects

import { state, GAME_STATE } from '../game/state.js';
import { player } from '../game/player.js';
import { inventory } from './inventory.js';
import { showDialog } from './dialog.js';
import { ENDING_CUTSCENE } from '../data/cutscenes.js';

const cutsceneOverlay = document.getElementById('cutsceneOverlay');
const cutsceneText = document.getElementById('cutsceneText');

export function checkInteraction() {
  const { currentArea, npcs, worldItems, gateUnlocked, logsCleared, ladybug } = state;

  // Check NPCs in current area
  for (const npcKey in npcs) {
    const npc = npcs[npcKey];
    if (npc.area !== currentArea) continue;

    // Squirrel behind locked gate - allow talk through gate
    if (npc === npcs.squirrel && npc.behindGate && !gateUnlocked) {
      const dx = player.x - npc.x;
      const dy = player.y - npc.y;
      if (Math.sqrt(dx * dx + dy * dy) < 50) {
        showDialog(npc);
        return;
      }
      continue;
    }

    const dx = player.x - npc.x;
    const dy = player.y - npc.y;
    if (Math.sqrt(dx * dx + dy * dy) < 40) {
      showDialog(npc);
      return;
    }
  }

  // Birdseed pickup
  if (!worldItems.birdseed.collected && currentArea === 'park') {
    if (Math.abs(player.x - worldItems.birdseed.x) < 30 &&
        Math.abs(player.y - worldItems.birdseed.y) < 30) {
      worldItems.birdseed.collected = true;
      inventory.addItem('Birdseed');
      return;
    }
  }

  // Gold doubloons pickup
  if (!worldItems.doubloons.collected && currentArea === 'gate_area') {
    if (Math.abs(player.x - worldItems.doubloons.x) < 30 &&
        Math.abs(player.y - worldItems.doubloons.y) < 30) {
      worldItems.doubloons.collected = true;
      inventory.addItem('Gold Doubloons');
      return;
    }
  }

  // Gate unlock with key
  if (!gateUnlocked && currentArea === 'gate_area' && inventory.hasItem('Key')) {
    if (Math.abs(player.x - 360) < 40 && Math.abs(player.y - 120) < 40) {
      state.gateUnlocked = true;
      inventory.removeItem('Key');
      npcs.squirrel.behindGate = false;
      return;
    }
  }

  // Logs clearing with axe
  if (!logsCleared && currentArea === 'woods' && inventory.hasItem('Axe')) {
    if (Math.abs(player.x - 450) < 40 && Math.abs(player.y - 200) < 40) {
      state.logsCleared = true;
      inventory.removeItem('Axe');
      return;
    }
  }

  // Ladybug interaction - triggers ending cutscene
  if (inventory.hasItem('Net') && currentArea === 'boathouse') {
    const dx = player.x - ladybug.x;
    const dy = player.y - ladybug.y;
    if (Math.sqrt(dx * dx + dy * dy) < 50) {
      triggerEndingCutscene();
    }
  }
}

export function checkNearInteractable() {
  const { currentArea, npcs, worldItems } = state;

  for (const npcKey in npcs) {
    const npc = npcs[npcKey];
    if (npc.area !== currentArea) continue;
    const dx = player.x - npc.x;
    const dy = player.y - npc.y;
    if (Math.sqrt(dx * dx + dy * dy) < 50) return true;
  }

  if (!worldItems.birdseed.collected && currentArea === 'park') {
    if (Math.abs(player.x - worldItems.birdseed.x) < 30 &&
        Math.abs(player.y - worldItems.birdseed.y) < 30) {
      return true;
    }
  }

  return false;
}

function triggerEndingCutscene() {
  state.currentState = GAME_STATE.CUTSCENE_ENDING;
  state.currentCutscene = ENDING_CUTSCENE;
  state.currentCutsceneIndex = 0;
  state.cutsceneTimer = 0;
  cutsceneOverlay.classList.add('active');
  cutsceneText.textContent = state.currentCutscene[0].text;
}
