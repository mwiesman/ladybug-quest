// Dialog system — direct port of the 8-bit game's phase machine
// (src/systems/dialog.js): main / trade prompt / afterTrade / decline,
// with before/complete dialog selection. Consumes the shared NPC_DATA.

import { state, inventory, MODE } from './state.js';
import { showItemNotification } from './hud.js';

const dialogBox = document.getElementById('dialogBox');
const dialogText = document.getElementById('dialogText');
const dialogSpeaker = document.getElementById('dialogSpeaker');
const dialogPortrait = document.getElementById('dialogPortrait');
const dialogPromptHint = document.getElementById('dialogPromptHint');
const tradeButtonsEl = document.getElementById('tradeButtons');

const PORTRAITS = {
  girl: '👧', boy: '👦', dog: '🐕', bird: '🐦', squirrel: '🐿️',
  fisherman: '🎣', hippie: '✌️', kid: '🧒', parent: '🧑', coffeeCart: '☕',
  ladybug: '🐞'
};

const NAMES = {
  girl: 'You', boy: 'Boy', dog: 'Dog', bird: 'Bird', squirrel: 'Squirrel',
  fisherman: 'Fisherman', hippie: 'Hippie', kid: 'Kid', parent: 'Parent',
  coffeeCart: 'Coffee Cart', ladybug: 'Ladybug'
};

export function showDialog(npc) {
  if (!npc.isStatic) {
    state.mode = MODE.DIALOG;
  }
  dialogBox.classList.add('active');
  state.currentDialog = npc;
  state.dialogIndex = 0;
  state.dialogPhase = 'main';
  state.tradePrompted = false;

  // Bird lands when you talk to it
  if (npc === state.npcs.bird && npc.flies && !state.birdStopped) {
    state.birdStopped = true;
    state.birdStoppedX = npc.x + Math.sin(state.elapsed * 1.2) * 60;
    state.birdStoppedY = npc.y + Math.sin(state.elapsed * 1.8) * 8;
  }

  setPortrait(resolveSpeaker(npc));
  updateDialogText();
}

export function advanceDialog() {
  const npc = state.currentDialog;
  if (!npc) return;

  // Trade prompt is answered by the Yes/No buttons only
  if (state.tradePrompted) return;

  state.dialogIndex++;
  const dialogArray = getActiveDialogArray(npc);

  if (state.dialogIndex >= dialogArray.length) {
    if (state.dialogPhase === 'main' && shouldPromptTrade(npc)) {
      state.tradePrompted = true;
      showTradePrompt(npc);
    } else {
      closeDialog();
    }
  } else {
    updateDialogText();
  }
}

export function acceptTrade() {
  if (!state.tradePrompted) return;
  const npc = state.currentDialog;
  state.tradePrompted = false;
  hideTradePrompt();
  processNPCTrade(npc);

  if (npc.dialogAfterTrade && npc.dialogAfterTrade.length > 0) {
    state.dialogPhase = 'afterTrade';
    state.dialogIndex = 0;
    updateDialogText();
  } else {
    closeDialog();
  }
}

export function declineTrade() {
  if (!state.tradePrompted) return;
  const npc = state.currentDialog;
  state.tradePrompted = false;
  hideTradePrompt();

  if (npc && npc.dialogDecline && npc.dialogDecline.length > 0) {
    state.dialogPhase = 'decline';
    state.dialogIndex = 0;
    updateDialogText();
  } else {
    closeDialog();
  }
}

export function closeDialog() {
  state.mode = MODE.PLAYING;
  dialogBox.classList.remove('active');
  hideTradePrompt();
  state.currentDialog = null;
  state.dialogIndex = 0;
  state.dialogPhase = 'main';
  state.tradePrompted = false;
}

export function isDialogOpen() {
  return state.currentDialog !== null;
}

function getActiveDialogArray(npc) {
  if (!npc) return [];
  if (state.dialogPhase === 'afterTrade') return npc.dialogAfterTrade || [];
  if (state.dialogPhase === 'decline') return npc.dialogDecline || [];
  return resolveDialogArray(npc);
}

function updateDialogText() {
  const npc = state.currentDialog;
  const dialogArray = getActiveDialogArray(npc);
  if (state.dialogIndex < dialogArray.length) {
    dialogText.textContent = dialogArray[state.dialogIndex];
  }

  // Per-line speaker switch (parent/kid interruption)
  if (npc && npc.lineSpeakers && state.dialogPhase === 'main') {
    const lineSpeaker = npc.lineSpeakers[state.dialogIndex];
    setPortrait(lineSpeaker || resolveSpeaker(npc));
  }
}

function shouldPromptTrade(npc) {
  if (!npc || npc.completed) return false;

  // Vendor (coffee cart) hands the item over at end of dialog, no prompt
  if (npc.isVendor) {
    processNPCTrade(npc);
    return false;
  }
  if (npc.needsItem === 'Gate Unlocked') {
    return state.gateUnlocked && !npc.completed;
  }
  return npc.needsItem && inventory.hasItem(npc.needsItem);
}

function showTradePrompt(npc) {
  if (npc.needsItem === 'Gate Unlocked') {
    dialogText.textContent = '*The gate is unlocked. The squirrel can get its acorns now!*';
  } else {
    dialogText.textContent = `*Give ${NAMES[npc.id] ?? 'them'} the ${npc.needsItem}?*`;
  }
  tradeButtonsEl.classList.add('active');
  dialogPromptHint.style.display = 'none';
}

function hideTradePrompt() {
  tradeButtonsEl.classList.remove('active');
  dialogPromptHint.style.display = '';
}

function resolveDialogArray(npc) {
  if (!npc) return [];
  if (npc.dialogBefore && !npc.completed &&
      (!npc.needsItem || !inventory.hasItem(npc.needsItem))) {
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

function resolveSpeaker(npc) {
  if (npc && npc.speaker) return npc.speaker;
  if (!npc || npc.isStatic) return 'girl';
  return npc.id || 'girl';
}

function setPortrait(speaker) {
  dialogPortrait.textContent = PORTRAITS[speaker] ?? '🐞';
  dialogSpeaker.textContent = NAMES[speaker] ?? '';
}

export function processNPCTrade(npc) {
  if (!npc || npc.completed) return;

  if (npc.isVendor) {
    inventory.addItem(npc.givesItem);
    showItemNotification(npc.givesItem);
    npc.completed = true;
    return;
  }

  if (npc.needsItem === 'Gate Unlocked' && state.gateUnlocked) {
    inventory.addItem(npc.givesItem);
    showItemNotification(npc.givesItem);
    npc.completed = true;
    npc.behindGate = false;
    return;
  }

  if (npc.needsItem && inventory.hasItem(npc.needsItem)) {
    inventory.removeItem(npc.needsItem);
    inventory.addItem(npc.givesItem);
    showItemNotification(npc.givesItem);
    npc.completed = true;
  }
}
