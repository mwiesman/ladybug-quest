// Interaction detection - proximity checks for NPCs, items, and world objects

import { state, GAME_STATE } from '../game/state.js';
import { player } from '../game/player.js';
import { inventory } from './inventory.js';
import { showDialog } from './dialog.js';
import { ENDING_CUTSCENE } from '../data/cutscenes.js';
import { playSFX } from './audio.js';
import { saveGame } from './save.js';

const cutsceneOverlay = document.getElementById('cutsceneOverlay');
const cutsceneText = document.getElementById('cutsceneText');

export function checkInteraction() {
  const { currentArea, npcs, worldItems, gateUnlocked, logsCleared, ladybug } = state;

  // Check NPCs in current area
  for (const npcKey in npcs) {
    const npc = npcs[npcKey];
    if (npc.area !== currentArea) continue;

    // Squirrel — uses different position when gate unlocked
    if (npc === npcs.squirrel) {
      let sqX, sqY;
      if (gateUnlocked && !npc.completed) {
        sqX = 500; sqY = 140; // Inside gated area at leaf pile
      } else {
        sqX = npc.x; sqY = npc.y;
      }

      // Allow talk through gate when locked
      const range = (!gateUnlocked && npc.behindGate) ? 50 : 40;
      const dx = player.x - sqX;
      const dy = player.y - sqY;
      if (Math.sqrt(dx * dx + dy * dy) < range) {
        showDialog(npc);
        return;
      }
      continue;
    }

    // Bird — uses flight position when flying
    if (npc === npcs.bird && npc.flies && !state.birdStopped) {
      const birdX = npc.x + Math.sin(state.frameCount * 0.02) * 60;
      const birdY = npc.y + Math.sin(state.frameCount * 0.03) * 8;
      const dx = player.x - birdX;
      const dy = player.y - birdY;
      if (Math.sqrt(dx * dx + dy * dy) < 40) {
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
      saveGame();
      return;
    }
  }

  // Gold doubloons pickup (hidden in the woods)
  if (!worldItems.doubloons.collected && currentArea === 'woods') {
    if (Math.abs(player.x - worldItems.doubloons.x) < 30 &&
        Math.abs(player.y - worldItems.doubloons.y) < 30) {
      worldItems.doubloons.collected = true;
      playSFX('pickup');
      inventory.addItem('Gold Doubloons');
      saveGame();
      return;
    }
  }

  // Gate unlock with key
  if (!gateUnlocked && currentArea === 'gate_area' && inventory.hasItem('Key')) {
    if (Math.abs(player.x - 380) < 40 && Math.abs(player.y - 140) < 40) {
      state.gateUnlocked = true;
      playSFX('gate_unlock');
      inventory.removeItem('Key');
      npcs.squirrel.behindGate = false;
      state.squirrelRunPhase = 0; // Start squirrel run animation
      saveGame();
      return;
    }
  }

  // Logs interaction (in gate_area, blocking north exit to woods)
  if (!logsCleared && currentArea === 'gate_area') {
    if (Math.abs(player.x - 300) < 40 && Math.abs(player.y - 35) < 40) {
      if (inventory.hasItem('Axe')) {
        // Clear logs with axe
        state.logsCleared = true;
        playSFX('logs_clear');
        inventory.removeItem('Axe');
        saveGame();
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

  // Camperdown Elm plaque (boathouse area)
  if (currentArea === 'boathouse') {
    if (Math.abs(player.x - 418) < 30 && Math.abs(player.y - 90) < 30) {
      showDialog({
        dialog: ["*You read the plaque...*", "\"Camperdown Elm — a rare weeping tree,\ntwisted by nature into living art.\""],
        isStatic: true
      });
      return;
    }
  }

  // Ladybug interaction - prompt first, then trigger ending
  if (inventory.hasItem('Net') && currentArea === 'meadow') {
    const dx = player.x - ladybug.x;
    const dy = player.y - ladybug.y;
    if (Math.sqrt(dx * dx + dy * dy) < 60) {
      if (!state.ladybugPrompted) {
        state.ladybugPrompted = true;
        showDialog({
          dialog: ["*You spot the ladybug resting on a leaf...*", "*Press [SPACE] to try to catch it!*"],
          isStatic: true
        });
      } else {
        triggerEndingAnimation();
      }
    }
  }
}

export function checkNearInteractable() {
  const { currentArea, npcs, worldItems } = state;

  for (const npcKey in npcs) {
    const npc = npcs[npcKey];
    if (npc.area !== currentArea) continue;

    let npcX = npc.x, npcY = npc.y;

    // Squirrel moves inside gated area when gate unlocked
    if (npc === npcs.squirrel && state.gateUnlocked && !npc.completed) {
      npcX = 500; npcY = 140;
    }

    // Bird flight position
    if (npc === npcs.bird && npc.flies && !state.birdStopped) {
      npcX = npc.x + Math.sin(state.frameCount * 0.02) * 60;
      npcY = npc.y + Math.sin(state.frameCount * 0.03) * 8;
    }

    const dx = player.x - npcX;
    const dy = player.y - npcY;
    if (Math.sqrt(dx * dx + dy * dy) < 50) return true;
  }

  if (!worldItems.birdseed.collected && currentArea === 'park') {
    if (Math.abs(player.x - worldItems.birdseed.x) < 30 &&
        Math.abs(player.y - worldItems.birdseed.y) < 30) {
      return true;
    }
  }

  // Logs in gate_area
  if (!state.logsCleared && currentArea === 'gate_area') {
    if (Math.abs(player.x - 300) < 40 && Math.abs(player.y - 35) < 40) {
      return true;
    }
  }

  // Doubloons in the woods
  if (!worldItems.doubloons.collected && currentArea === 'woods') {
    if (Math.abs(player.x - worldItems.doubloons.x) < 30 &&
        Math.abs(player.y - worldItems.doubloons.y) < 30) {
      return true;
    }
  }

  // Camperdown Elm plaque
  if (currentArea === 'boathouse') {
    if (Math.abs(player.x - 418) < 30 && Math.abs(player.y - 90) < 30) {
      return true;
    }
  }

  return false;
}

function triggerEndingAnimation() {
  state.currentState = GAME_STATE.ENDING_ANIMATION;
  state.endingPhase = 0;
  inventory.removeItem('Net');
  // Note: ladybug.found is set later (in showCredits) so drawLadybug still works during the animation
}
