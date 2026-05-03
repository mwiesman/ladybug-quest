// Interaction detection - proximity checks for NPCs, items, and world objects
// Checks player distance to interactables each frame and triggers dialogs/pickups

import { state, GAME_STATE } from '../game/state.js';
import { player } from '../game/player.js';
import { inventory } from './inventory.js';
import { showDialog } from './dialog.js';
import { ENDING_CUTSCENE } from '../data/cutscenes.js';
import { playSFX } from './audio.js';
import { saveGame } from './save.js';
import { showItemNotification } from '../rendering/ui.js';
import { isTouchDevice } from './touch.js';

const cutsceneOverlay = document.getElementById('cutsceneOverlay');
const cutsceneText = document.getElementById('cutsceneText');

// --- Position helpers (shared with areas.js rendering) ---

/** Get the bird's current display position (flight sine wave or frozen spot) */
export function getBirdPosition() {
  const bird = state.npcs.bird;
  if (state.birdStopped) {
    return { x: state.birdStoppedX, y: state.birdStoppedY };
  }
  return {
    x: bird.x + Math.sin(state.frameCount * 0.02) * 60,
    y: bird.y + Math.sin(state.frameCount * 0.03) * 8
  };
}

/** Get the squirrel's current display position (moves inside gate when unlocked) */
export function getSquirrelPosition() {
  if (state.gateUnlocked) {
    return { x: 500, y: 120 }; // Inside gated corner at acorn tree
  }
  return { x: state.npcs.squirrel.x, y: state.npcs.squirrel.y };
}

/** Get the kid's current display position (runs to player during parent dialog) */
export function getKidPosition() {
  if (state.kidRunPhase >= 40 && state.kidRunTargetX > 0) {
    return { x: state.kidRunTargetX, y: state.kidRunTargetY };
  }
  return { x: state.npcs.kid.x, y: state.npcs.kid.y };
}

/** Fast distance check using squared comparison (avoids Math.sqrt) */
function inRange(x1, y1, x2, y2, range) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy < range * range;
}

// --- Main interaction check (called on SPACE press) ---

export function checkInteraction() {
  const { currentArea, npcs, worldItems, gateUnlocked, logsCleared, ladybug } = state;

  // Check NPCs in current area
  for (const npcKey in npcs) {
    const npc = npcs[npcKey];
    if (npc.area !== currentArea) continue;

    // Squirrel — uses inside position when gate unlocked (even after trade)
    if (npc === npcs.squirrel) {
      const sq = getSquirrelPosition();
      const range = (!gateUnlocked && npc.behindGate) ? 50 : 40;
      if (inRange(player.x, player.y, sq.x, sq.y, range)) {
        showDialog(npc);
        return;
      }
      continue;
    }

    // Bird — uses flight position when flying, stored position when stopped
    if (npc === npcs.bird && npc.flies) {
      const bird = getBirdPosition();
      if (inRange(player.x, player.y, bird.x, bird.y, 40)) {
        showDialog(npc);
        return;
      }
      continue;
    }

    // Kid — uses animated position after running to player
    let npcX = npc.x, npcY = npc.y;
    if (npc === npcs.kid && state.kidRunPhase >= 40) {
      npcX = state.kidRunTargetX;
      npcY = state.kidRunTargetY;
    }

    if (inRange(player.x, player.y, npcX, npcY, 40)) {
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
      showDialog({ dialog: ["*Birds seem to have plenty to spare.*"], isStatic: true });
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
    if (Math.abs(player.x - 400) < 40 && Math.abs(player.y - 215) < 40) {
      state.gateUnlocked = true;
      playSFX('gate_unlock');
      inventory.removeItem('Key');
      npcs.squirrel.behindGate = false;
      state.squirrelRunPhase = 0; // Start squirrel run animation
      showItemNotification('Gate Unlocked!', 'action');
      saveGame();
      return;
    }
  }

  // Logs interaction (in gate_area, blocking north exit to woods)
  if (!logsCleared && currentArea === 'gate_area') {
    if (Math.abs(player.x - 300) < 40 && Math.abs(player.y - 35) < 40) {
      if (inventory.hasItem('Axe')) {
        state.logsCleared = true;
        playSFX('logs_clear');
        inventory.removeItem('Axe');
        showItemNotification('Logs Cleared!', 'action');
        saveGame();
      } else {
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

  // Horse poop easter egg (meadow, bottom-left corner)
  if (currentArea === 'meadow') {
    if (Math.abs(player.x - 69) < 30 && Math.abs(player.y - 451) < 30) {
      showDialog({
        dialog: ["*Faithful-to-real-life engagement horse poop.*"],
        isStatic: true
      });
      return;
    }
  }

  // Boy interaction (meadow) - different dialog depending on progress
  if (currentArea === 'meadow') {
    if (inRange(player.x, player.y, state.boy.x, state.boy.y, 40)) {
      if (inventory.hasItem('Net')) {
        showDialog({
          dialog: ["You found it! The ladybug...", "I think it's back by the old oak tree."],
          isStatic: true,
          speaker: 'boy'
        });
      } else if (state.gateUnlocked) {
        showDialog({
          dialog: ["You're really getting the hang of this.", "Keep going — I believe in you!"],
          isStatic: true,
          speaker: 'boy'
        });
      } else {
        showDialog({
          dialog: ["Be careful out there!", "I'll be right here if you need me."],
          isStatic: true,
          speaker: 'boy'
        });
      }
      return;
    }
  }

  // Ladybug interaction - prompt first, then trigger ending
  if (inventory.hasItem('Net') && currentArea === 'meadow') {
    if (inRange(player.x, player.y, ladybug.x, ladybug.y, 60)) {
      if (!state.ladybugPrompted) {
        state.ladybugPrompted = true;
        const catchText = isTouchDevice()
          ? "*Tap again to try to catch it!*"
          : "*Press [SPACE] to try to catch it!*";
        showDialog({
          dialog: ["*You spot the ladybug resting on a leaf...*", catchText],
          isStatic: true
        });
      } else {
        triggerEndingAnimation();
      }
    }
  }
}

// --- Proximity hint check (called every frame to show "Press SPACE" prompt) ---

export function checkNearInteractable() {
  const { currentArea, npcs, worldItems } = state;

  for (const npcKey in npcs) {
    const npc = npcs[npcKey];
    if (npc.area !== currentArea) continue;

    let npcX = npc.x, npcY = npc.y;

    // Squirrel moves inside gated area when gate unlocked
    if (npc === npcs.squirrel && state.gateUnlocked) {
      npcX = 500; npcY = 120;
    }

    // Bird flight position
    if (npc === npcs.bird && npc.flies) {
      const bird = getBirdPosition();
      npcX = bird.x;
      npcY = bird.y;
    }

    // Kid uses animated position after running to player
    if (npc === npcs.kid && state.kidRunPhase >= 40) {
      npcX = state.kidRunTargetX;
      npcY = state.kidRunTargetY;
    }

    if (inRange(player.x, player.y, npcX, npcY, 50)) return true;
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

  // Boy in meadow
  if (currentArea === 'meadow') {
    if (inRange(player.x, player.y, state.boy.x, state.boy.y, 40)) return true;
  }

  // Horse poop in meadow
  if (currentArea === 'meadow') {
    if (Math.abs(player.x - 69) < 30 && Math.abs(player.y - 451) < 30) return true;
  }

  return false;
}

function triggerEndingAnimation() {
  state.currentState = GAME_STATE.ENDING_ANIMATION;
  state.endingPhase = 0;
  inventory.removeItem('Net');
  // Note: ladybug.found is set later (in showCredits) so drawLadybug still works during the animation
}
