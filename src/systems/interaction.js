// Interaction detection - proximity checks for NPCs, items, and world objects

import { state, GAME_STATE } from '../game/state.js';
import { player } from '../game/player.js';
import { inventory } from './inventory.js';
import { showDialog } from './dialog.js';
import { ENDING_CUTSCENE } from '../data/cutscenes.js';
import { playSFX } from './audio.js';

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
      playSFX('pickup');
      inventory.addItem('Birdseed');
      return;
    }
  }

  // Gold doubloons pickup (behind logs in woods)
  if (!worldItems.doubloons.collected && currentArea === 'woods' && logsCleared) {
    if (Math.abs(player.x - worldItems.doubloons.x) < 30 &&
        Math.abs(player.y - worldItems.doubloons.y) < 30) {
      worldItems.doubloons.collected = true;
      playSFX('pickup');
      inventory.addItem('Gold Doubloons');
      return;
    }
  }

  // Gate unlock with key
  if (!gateUnlocked && currentArea === 'gate_area' && inventory.hasItem('Key')) {
    if (Math.abs(player.x - 360) < 40 && Math.abs(player.y - 120) < 40) {
      state.gateUnlocked = true;
      playSFX('gate_unlock');
      inventory.removeItem('Key');
      npcs.squirrel.behindGate = false;
      return;
    }
  }

  // Logs interaction
  if (!logsCleared && currentArea === 'woods') {
    if (Math.abs(player.x - 450) < 40 && Math.abs(player.y - 200) < 40) {
      if (inventory.hasItem('Axe')) {
        // Clear logs with axe
        state.logsCleared = true;
        playSFX('logs_clear');
        inventory.removeItem('Axe');
      } else {
        // Show "need more than arms" message
        showDialog({
          dialog: ["*Looks like you'll need more than just your arms to get past these logs.*"],
          isStatic: true
        });
      }
      return;
    }
  }

  // Ladybug interaction - triggers ending animation
  if (inventory.hasItem('Net') && currentArea === 'meadow') {
    const dx = player.x - ladybug.x;
    const dy = player.y - ladybug.y;
    if (Math.sqrt(dx * dx + dy * dy) < 60) {
      triggerEndingAnimation();
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

  // Logs in woods
  if (!state.logsCleared && currentArea === 'woods') {
    if (Math.abs(player.x - 450) < 40 && Math.abs(player.y - 200) < 40) {
      return true;
    }
  }

  // Doubloons in woods (behind logs)
  if (!worldItems.doubloons.collected && currentArea === 'woods' && state.logsCleared) {
    if (Math.abs(player.x - worldItems.doubloons.x) < 30 &&
        Math.abs(player.y - worldItems.doubloons.y) < 30) {
      return true;
    }
  }

  return false;
}

function triggerEndingAnimation() {
  state.currentState = GAME_STATE.ENDING_ANIMATION;
  state.endingPhase = 0;
  state.ladybug.found = true;
  inventory.removeItem('Net');
}
