// Dialog system - show, advance, and close NPC dialogs

import { state, GAME_STATE } from '../game/state.js';
import { inventory } from './inventory.js';

const dialogBox = document.getElementById('dialogBox');
const dialogText = document.getElementById('dialogText');
const portraitCtx = document.getElementById('dialogPortrait').getContext('2d');

export function showDialog(npc) {
  state.currentState = GAME_STATE.DIALOG;
  dialogBox.classList.add('active');
  state.currentDialog = npc;
  state.dialogIndex = 0;

  drawPortrait(resolvePortraitChar(npc));
  updateDialogText();
}

export function advanceDialog() {
  state.dialogIndex++;

  const dialogArray = resolveDialogArray(state.currentDialog);

  if (state.dialogIndex >= dialogArray.length) {
    const npc = state.currentDialog;
    closeDialog();
    processNPCTrade(npc);
  } else {
    updateDialogText();
  }
}

export function closeDialog() {
  state.currentState = GAME_STATE.PLAYING;
  dialogBox.classList.remove('active');
  state.currentDialog = null;
  state.dialogIndex = 0;
}

function updateDialogText() {
  const dialogArray = resolveDialogArray(state.currentDialog);
  if (state.dialogIndex < dialogArray.length) {
    dialogText.textContent = dialogArray[state.dialogIndex];
  }
}

// Pick the right dialog array based on trade state
function resolveDialogArray(npc) {
  if (!npc) return [];

  if (npc.dialogBefore && !npc.completed &&
      (!npc.needsItem || !inventory.hasItem(npc.needsItem))) {
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
  portraitCtx.fillStyle = '#2a2a3e';
  portraitCtx.fillRect(0, 0, 80, 80);

  // Placeholder portraits - to be replaced with sprite art (see SPRITE_REQUIREMENTS.md)
  portraitCtx.fillStyle = '#fff';
  portraitCtx.font = '8px "Press Start 2P"';
  const label = { girl: 'Girl', boy: 'Boy', dog: 'Dog' }[character] || '?';
  portraitCtx.fillText(label, 15, 45);
}

export function processNPCTrade(npc) {
  if (!npc || npc.completed) return;

  // Vendor (coffee cart) - free item, no trade needed
  if (npc.isVendor) {
    inventory.addItem(npc.givesItem);
    npc.completed = true;
    return;
  }

  // Squirrel special case: rewards when gate has been unlocked
  if (npc.needsItem === 'Gate Unlocked' && state.gateUnlocked) {
    inventory.addItem(npc.givesItem);
    npc.completed = true;
    npc.behindGate = false;
    return;
  }

  // Standard item trade
  if (npc.needsItem && inventory.hasItem(npc.needsItem)) {
    inventory.removeItem(npc.needsItem);
    inventory.addItem(npc.givesItem);
    npc.completed = true;
  }
}
