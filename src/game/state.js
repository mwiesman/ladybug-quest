// Central game state - shared mutable object imported by all modules
// GAME_STATE enum and all runtime state lives here

import { NPC_DATA } from '../data/npcs.js';
import { WORLD_ITEMS, STARTING_ITEMS } from '../data/items.js';
import { INTRO_CUTSCENE } from '../data/cutscenes.js';

export const GAME_STATE = {
  CUTSCENE_INTRO: 'cutscene_intro',
  INTRO_ANIMATION: 'intro_animation',
  PLAYING: 'playing',
  DIALOG: 'dialog',
  ENDING_ANIMATION: 'ending_animation',
  CUTSCENE_ENDING: 'cutscene_ending',
  CREDITS: 'credits'
};

// Deep-clone NPC data so runtime state doesn't mutate the definitions
function initNPCs() {
  const result = {};
  for (const [id, data] of Object.entries(NPC_DATA)) {
    result[id] = { ...data, completed: data.completed ?? false };
  }
  return result;
}

function initWorldItems() {
  const result = {};
  for (const [id, data] of Object.entries(WORLD_ITEMS)) {
    result[id] = { ...data };
  }
  return result;
}

export const state = {
  currentState: GAME_STATE.CUTSCENE_INTRO,
  previousState: null,
  currentArea: 'meadow',

  // Cutscene
  cutsceneFrame: 0,
  cutsceneTimer: 0,
  animationPhase: 0,
  endingPhase: 0,
  currentCutscene: INTRO_CUTSCENE,
  currentCutsceneIndex: 0,

  // World flags
  gateUnlocked: false,
  logsCleared: false,

  // NPCs (runtime state with completed flags)
  npcs: initNPCs(),

  // World items (collectibles)
  worldItems: initWorldItems(),

  // Ladybug - resting on a leaf near the big tree
  ladybug: {
    x: 295,
    y: 195,
    size: 12,
    found: false,
    pulse: 0
  },

  // Boy (static NPC)
  boy: {
    x: 290,
    y: 270,
    area: 'meadow'
  },

  // Dialog system
  currentDialog: null,
  dialogIndex: 0,
  dialogSpeaker: null,
  tradePrompted: false,

  // Interaction hint
  nearInteractable: false,

  // Global frame counter for environmental animations
  frameCount: 0
};

// Reset entire state (for restart)
export function resetState() {
  state.currentState = GAME_STATE.CUTSCENE_INTRO;
  state.currentArea = 'meadow';
  state.cutsceneFrame = 0;
  state.cutsceneTimer = 0;
  state.animationPhase = 0;
  state.currentCutscene = INTRO_CUTSCENE;
  state.currentCutsceneIndex = 0;
  state.gateUnlocked = false;
  state.logsCleared = false;
  state.npcs = initNPCs();
  state.worldItems = initWorldItems();
  state.ladybug.found = false;
  state.ladybug.pulse = 0;
  state.currentDialog = null;
  state.dialogIndex = 0;
  state.dialogSpeaker = null;
  state.nearInteractable = false;
  state.frameCount = 0;
}
