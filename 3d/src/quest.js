// Interaction + fetch-quest logic — port of src/systems/interaction.js,
// operating on the same logical coordinates and shared NPC/item data.

import { state, inventory } from './state.js';
import { player } from './player.js';
import { showDialog } from './dialog.js';
import { showItemNotification } from './hud.js';

export function getBirdPosition() {
  const bird = state.npcs.bird;
  if (state.birdStopped) {
    return { x: state.birdStoppedX, y: state.birdStoppedY };
  }
  return {
    x: bird.x + Math.sin(state.elapsed * 1.2) * 60,
    y: bird.y + Math.sin(state.elapsed * 1.8) * 8
  };
}

export function getSquirrelPosition() {
  if (state.gateUnlocked) {
    return { x: 500, y: 120 }; // at the acorn pile inside the fence
  }
  return { x: state.npcs.squirrel.x, y: state.npcs.squirrel.y };
}

export function getNPCPosition(npc) {
  if (npc === state.npcs.squirrel) return getSquirrelPosition();
  if (npc === state.npcs.bird && npc.flies) return getBirdPosition();
  return { x: npc.x, y: npc.y };
}

function inRange(x1, y1, x2, y2, range) {
  const dx = x1 - x2, dy = y1 - y2;
  return dx * dx + dy * dy < range * range;
}

// Called on SPACE. Returns 'ending' when the ladybug catch is triggered.
export function checkInteraction() {
  const { currentArea, npcs, worldItems, gateUnlocked, logsCleared, ladybug } = state;

  for (const npcKey in npcs) {
    const npc = npcs[npcKey];
    if (npc.area !== currentArea) continue;
    const pos = getNPCPosition(npc);
    const range = (npc === npcs.squirrel && !gateUnlocked && npc.behindGate) ? 50 : 40;
    if (inRange(player.x, player.y, pos.x, pos.y, range)) {
      showDialog(npc);
      return 'dialog';
    }
  }

  // Birdseed pickup
  if (!worldItems.birdseed.collected && currentArea === 'park') {
    if (Math.abs(player.x - worldItems.birdseed.x) < 30 &&
        Math.abs(player.y - worldItems.birdseed.y) < 30) {
      worldItems.birdseed.collected = true;
      inventory.addItem('Birdseed');
      showItemNotification('Birdseed');
      showDialog({ dialog: ['*Birds seem to have plenty to spare.*'], isStatic: true });
      return 'dialog';
    }
  }

  // Gold doubloons (easter egg in the woods)
  if (!worldItems.doubloons.collected && currentArea === 'woods') {
    if (Math.abs(player.x - worldItems.doubloons.x) < 30 &&
        Math.abs(player.y - worldItems.doubloons.y) < 30) {
      worldItems.doubloons.collected = true;
      inventory.addItem('Gold Doubloons');
      showItemNotification('Gold Doubloons');
      return 'pickup';
    }
  }

  // Gate unlock with key
  if (!gateUnlocked && currentArea === 'gate_area' && inventory.hasItem('Key')) {
    if (Math.abs(player.x - 400) < 40 && Math.abs(player.y - 215) < 40) {
      state.gateUnlocked = true;
      inventory.removeItem('Key');
      state.npcs.squirrel.behindGate = false;
      showItemNotification('Gate Unlocked!', 'action');
      return 'gate';
    }
  }

  // Logs blocking the woods
  if (!logsCleared && currentArea === 'gate_area') {
    if (Math.abs(player.x - 300) < 45 && Math.abs(player.y - 65) < 45) {
      if (inventory.hasItem('Axe')) {
        state.logsCleared = true;
        inventory.removeItem('Axe');
        showItemNotification('Logs Cleared!', 'action');
        return 'logs';
      }
      showDialog({
        dialog: ["*Looks like you'll need more than just your arms to get past these logs.*"],
        isStatic: true
      });
      return 'dialog';
    }
  }

  // Camperdown Elm plaque
  if (currentArea === 'boathouse') {
    if (Math.abs(player.x - 418) < 30 && Math.abs(player.y - 120) < 30) {
      showDialog({
        dialog: ['*You read the plaque...*',
          '"Camperdown Elm — a rare weeping tree,\ntwisted by nature into living art."'],
        isStatic: true
      });
      return 'dialog';
    }
  }

  // Horse poop easter egg
  if (currentArea === 'meadow') {
    if (Math.abs(player.x - 69) < 30 && Math.abs(player.y - 451) < 30) {
      showDialog({ dialog: ['*Faithful-to-real-life engagement horse poop.*'], isStatic: true });
      return 'dialog';
    }
  }

  // Boy in the meadow
  if (currentArea === 'meadow') {
    if (inRange(player.x, player.y, state.boy.x, state.boy.y, 40)) {
      if (inventory.hasItem('Net')) {
        showDialog({
          dialog: ['You found it! The ladybug...', "I think it's back by the old oak tree."],
          isStatic: true, speaker: 'boy'
        });
      } else if (state.gateUnlocked) {
        showDialog({
          dialog: ["You're really getting the hang of this.", 'Keep going — I believe in you!'],
          isStatic: true, speaker: 'boy'
        });
      } else {
        showDialog({
          dialog: ['Be careful out there!', "I'll be right here if you need me."],
          isStatic: true, speaker: 'boy'
        });
      }
      return 'dialog';
    }
  }

  // The ladybug — prompt first, then the ending
  if (inventory.hasItem('Net') && currentArea === 'meadow') {
    if (inRange(player.x, player.y, ladybug.x, ladybug.y, 60)) {
      if (!state.ladybugPrompted) {
        state.ladybugPrompted = true;
        showDialog({
          dialog: ['*You spot the ladybug resting on a leaf...*',
            '*Press [SPACE] to try to catch it!*'],
          isStatic: true
        });
        return 'dialog';
      }
      inventory.removeItem('Net');
      return 'ending';
    }
  }

  return null;
}

// Proximity hint for the "Press SPACE" prompt
export function checkNearInteractable() {
  const { currentArea, npcs, worldItems } = state;

  for (const npcKey in npcs) {
    const npc = npcs[npcKey];
    if (npc.area !== currentArea) continue;
    const pos = getNPCPosition(npc);
    if (inRange(player.x, player.y, pos.x, pos.y, 50)) return true;
  }

  if (!worldItems.birdseed.collected && currentArea === 'park' &&
      Math.abs(player.x - worldItems.birdseed.x) < 30 &&
      Math.abs(player.y - worldItems.birdseed.y) < 30) return true;

  if (!state.logsCleared && currentArea === 'gate_area' &&
      Math.abs(player.x - 300) < 45 && Math.abs(player.y - 65) < 45) return true;

  if (!state.gateUnlocked && currentArea === 'gate_area' && inventory.hasItem('Key') &&
      Math.abs(player.x - 400) < 40 && Math.abs(player.y - 215) < 40) return true;

  if (!worldItems.doubloons.collected && currentArea === 'woods' &&
      Math.abs(player.x - worldItems.doubloons.x) < 30 &&
      Math.abs(player.y - worldItems.doubloons.y) < 30) return true;

  if (currentArea === 'boathouse' &&
      Math.abs(player.x - 418) < 30 && Math.abs(player.y - 120) < 30) return true;

  if (currentArea === 'meadow') {
    if (inRange(player.x, player.y, state.boy.x, state.boy.y, 40)) return true;
    if (Math.abs(player.x - 69) < 30 && Math.abs(player.y - 451) < 30) return true;
    if (inventory.hasItem('Net') &&
        inRange(player.x, player.y, state.ladybug.x, state.ladybug.y, 60)) return true;
  }

  return false;
}
