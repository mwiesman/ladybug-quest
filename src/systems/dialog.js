// Dialog system - show, advance, and close NPC dialogs
// Supports mid-dialog trade prompts via dialogAfterTrade / dialogDecline

import { state, GAME_STATE } from '../game/state.js';
import { player } from '../game/player.js';
import { inventory } from './inventory.js';
import { getSprite } from '../rendering/spriteLoader.js';
import { playSFX } from './audio.js';
import { saveGame } from './save.js';

const dialogBox = document.getElementById('dialogBox');
const dialogText = document.getElementById('dialogText');
const portraitCtx = document.getElementById('dialogPortrait').getContext('2d');

export function showDialog(npc) {
  // Store previous state for static dialogs (intro animation)
  if (!npc.isStatic) {
    state.previousState = state.currentState;
    state.currentState = GAME_STATE.DIALOG;
  } else {
    // For static dialogs, store that we're showing a dialog but keep animation running
    state.previousState = state.currentState;
  }

  dialogBox.classList.add('active');
  state.currentDialog = npc;
  state.dialogIndex = 0;
  state.dialogPhase = 'main';

  // Stop bird when interacting with it
  if (npc === state.npcs.bird && npc.flies) {
    state.birdStopped = true;
  }

  playSFX('dialog_open');
  drawPortrait(resolvePortraitChar(npc));
  updateDialogText();
}

export function advanceDialog() {
  playSFX('dialog_advance');

  const npc = state.currentDialog;

  // If trade was just prompted and player pressed space = accept
  if (state.tradePrompted) {
    state.tradePrompted = false;
    processNPCTrade(npc);

    // If NPC has dialogAfterTrade, show those lines
    if (npc.dialogAfterTrade && npc.dialogAfterTrade.length > 0) {
      state.dialogPhase = 'afterTrade';
      state.dialogIndex = 0;
      updateDialogText();
      return;
    }

    // No after-trade dialog — just close
    closeDialog();
    return;
  }

  state.dialogIndex++;
  const dialogArray = getActiveDialogArray(npc);

  // Check if we've reached the end of the current dialog phase
  if (state.dialogIndex >= dialogArray.length) {
    if (state.dialogPhase === 'main' && shouldPromptTrade(npc)) {
      // Show trade confirmation prompt
      state.tradePrompted = true;
      showTradePrompt(npc);
    } else if (state.dialogPhase === 'decline') {
      // Decline dialog finished — close
      closeDialog();
    } else if (state.dialogPhase === 'afterTrade') {
      // After-trade dialog finished — close
      closeDialog();
    } else {
      // Normal end of dialog (no trade available)
      closeDialog();
    }
  } else {
    updateDialogText();
  }
}

export function declineDialog() {
  if (!state.tradePrompted) return;

  state.tradePrompted = false;
  const npc = state.currentDialog;

  // If NPC has decline dialog, show it
  if (npc && npc.dialogDecline && npc.dialogDecline.length > 0) {
    state.dialogPhase = 'decline';
    state.dialogIndex = 0;
    updateDialogText();
  } else {
    closeDialog();
  }
}

export function closeDialog() {
  // Restore previous state (could be PLAYING or INTRO_ANIMATION)
  state.currentState = state.previousState || GAME_STATE.PLAYING;
  dialogBox.classList.remove('active');
  state.currentDialog = null;
  state.dialogIndex = 0;
  state.dialogPhase = 'main';
}

function getActiveDialogArray(npc) {
  if (!npc) return [];

  if (state.dialogPhase === 'afterTrade') {
    return npc.dialogAfterTrade || [];
  }
  if (state.dialogPhase === 'decline') {
    return npc.dialogDecline || [];
  }

  // Main phase — use resolveDialogArray for proper before/complete/default selection
  return resolveDialogArray(npc);
}

function updateDialogText() {
  const dialogArray = getActiveDialogArray(state.currentDialog);
  if (state.dialogIndex < dialogArray.length) {
    dialogText.textContent = dialogArray[state.dialogIndex];
  }

  // Kid runs over when parent dialog reaches the interruption line
  if (state.currentDialog === state.npcs.parent &&
      state.dialogPhase === 'main' && state.dialogIndex === 2 &&
      state.kidRunPhase === -1) {
    state.kidRunPhase = 0;
    state.kidRunTargetX = player.x - 10;
    state.kidRunTargetY = player.y + 10;
  }
}

function shouldPromptTrade(npc) {
  if (!npc || npc.completed || npc.isVendor) return false;

  // Squirrel special case
  if (npc.needsItem === 'Gate Unlocked') {
    return state.gateUnlocked && !npc.completed;
  }

  // Standard trade: check if player has needed item
  return npc.needsItem && inventory.hasItem(npc.needsItem);
}

function showTradePrompt(npc) {
  const itemName = npc.needsItem === 'Gate Unlocked' ? 'gate unlocked' : npc.needsItem;
  const npcName = npc === state.npcs.dog ? 'dog' :
                  npc === state.npcs.bird ? 'bird' :
                  npc === state.npcs.squirrel ? 'squirrel' :
                  npc === state.npcs.hippie ? 'hippie' :
                  npc === state.npcs.kid ? 'kid' :
                  npc === state.npcs.fisherman ? 'fisherman' : 'them';

  if (npc.needsItem === 'Gate Unlocked') {
    dialogText.textContent = `*The gate is unlocked. The squirrel can get its acorns now!* [SPACE] Yes  [ESC] No`;
  } else {
    dialogText.textContent = `*Give ${npcName} the ${itemName}?* [SPACE] Yes  [ESC] No`;
  }
}

// Pick the right dialog array based on trade state
function resolveDialogArray(npc) {
  if (!npc) return [];

  if (npc.dialogBefore && !npc.completed &&
      (!npc.needsItem || !inventory.hasItem(npc.needsItem))) {
    // Special case: squirrel dialogBefore only when gate NOT unlocked
    if (npc.needsItem === 'Gate Unlocked' && state.gateUnlocked) {
      return npc.dialog || [];
    }
    return npc.dialogBefore;
  }
  if (npc.dialogComplete && npc.completed) {
    return npc.dialogComplete;
  }
  return npc.dialog || [];
}

function resolvePortraitChar(npc) {
  if (!npc) return 'girl';
  if (npc === state.npcs.dog) return 'dog';
  if (npc === state.npcs.boy || npc.isStatic) return 'boy';
  return 'girl';
}

function drawPortrait(character) {
  portraitCtx.clearRect(0, 0, 80, 80);

  const sprite = getSprite('portrait_' + character);
  if (sprite) {
    portraitCtx.drawImage(sprite, 0, 0, 80, 80);
    return;
  }

  // Placeholder portraits - fallback when sprite not available
  portraitCtx.fillStyle = '#2a2a3e';
  portraitCtx.fillRect(0, 0, 80, 80);
  portraitCtx.fillStyle = '#fff';
  portraitCtx.font = '8px "Press Start 2P"';
  const label = { girl: 'Girl', boy: 'Boy', dog: 'Dog' }[character] || '?';
  portraitCtx.fillText(label, 15, 45);
}

export function processNPCTrade(npc) {
  if (!npc || npc.completed) return;

  // Vendor (coffee cart) - free item, no trade needed
  if (npc.isVendor) {
    playSFX('trade');
    inventory.addItem(npc.givesItem);
    npc.completed = true;
    saveGame();
    return;
  }

  // Squirrel special case: rewards when gate has been unlocked
  if (npc.needsItem === 'Gate Unlocked' && state.gateUnlocked) {
    playSFX('trade');
    inventory.addItem(npc.givesItem);
    npc.completed = true;
    npc.behindGate = false;
    saveGame();
    return;
  }

  // Standard item trade
  if (npc.needsItem && inventory.hasItem(npc.needsItem)) {
    playSFX('trade');
    inventory.removeItem(npc.needsItem);
    inventory.addItem(npc.givesItem);
    npc.completed = true;
    saveGame();
  }
}
