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
  CREDITS: 'credits',
  MAP: 'map'
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
  dialogPhase: 'main', // 'main' | 'afterTrade' | 'decline'
  tradePrompted: false,

  // Bird flight
  birdStopped: false,
  birdStoppedX: 0,
  birdStoppedY: 0,

  // Squirrel run animation (after gate unlocks)
  squirrelRunPhase: -1, // -1 = not active, 0+ = frame counter

  // Kid run animation (runs to player when parent is talked to)
  kidRunPhase: -1, // -1 = not active, 0+ = frame counter
  kidRunTargetX: 0,
  kidRunTargetY: 0,

  // Ladybug ending prompt
  ladybugPrompted: false,
  endingFadeAlpha: 0,

  // Interaction hint
  nearInteractable: false,

  // Woods first entry (ladybug sighting animation)
  woodsFirstEntry: true,
  woodsSightingPhase: -1, // -1 = not active, 0+ = animation frame counter

  // Screen transition
  transitioning: false,
  transitionAlpha: 0,
  transitionTarget: null,
  transitionPhase: 'out',

  // Proposal sequence (boy stops girl before she leaves meadow)
  proposalDone: false,       // true after player accepts — never triggers again
  proposalPhase: -1,         // -1=inactive, 0+=animation frame counter
  proposalDialogStep: 0,     // 0=wait, 1=walking, 2=love dialog, 3=proposal prompt, 4=yes-only

  // Global frame counter for environmental animations
  frameCount: 0
};

// Reset entire state (for restart)
export function resetState() {
  state.currentState = GAME_STATE.CUTSCENE_INTRO;
  state.currentArea = 'meadow';
  state.cutsceneTimer = 0;
  state.animationPhase = 0;
  state.endingPhase = 0;
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
  state.dialogPhase = 'main';
  state.tradePrompted = false;
  state.birdStopped = false;
  state.birdStoppedX = 0;
  state.birdStoppedY = 0;
  state.squirrelRunPhase = -1;
  state.kidRunPhase = -1;
  state.kidRunTargetX = 0;
  state.kidRunTargetY = 0;
  state.ladybugPrompted = false;
  state.endingFadeAlpha = 0;
  state.nearInteractable = false;
  state.woodsFirstEntry = true;
  state.woodsSightingPhase = -1;
  state.transitioning = false;
  state.transitionAlpha = 0;
  state.transitionTarget = null;
  state.transitionPhase = 'out';
  state.proposalDone = false;
  state.proposalPhase = -1;
  state.proposalDialogStep = 0;
  state.frameCount = 0;
}
