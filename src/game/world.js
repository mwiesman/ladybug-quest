// World / area transition logic
// Handles moving between areas with fade-to-black screen transitions

import { state, GAME_STATE } from './state.js';
import { player } from './player.js';
import { playMusic, playSFX } from '../systems/audio.js';
import { saveGame } from '../systems/save.js';

const FADE_SPEED = 0.06; // alpha per frame (~17 frames each way)

// Start a fade-to-black transition to a new area
export function startTransition(newArea) {
  if (state.transitioning) return;
  state.transitioning = true;
  state.transitionAlpha = 0;
  state.transitionTarget = newArea;
  state.transitionPhase = 'out'; // fading out (going dark)
  playSFX('area_transition');
}

// Called every frame while transitioning — returns true while active
export function updateTransition() {
  if (!state.transitioning) return false;

  if (state.transitionPhase === 'out') {
    state.transitionAlpha += FADE_SPEED;
    if (state.transitionAlpha >= 1) {
      state.transitionAlpha = 1;
      // Screen is fully black — do the actual area swap
      executeAreaSwap(state.transitionTarget);
      state.transitionPhase = 'in'; // now fading back in
    }
  } else {
    // Fading in (clearing)
    state.transitionAlpha -= FADE_SPEED;
    if (state.transitionAlpha <= 0) {
      state.transitionAlpha = 0;
      state.transitioning = false;
      state.transitionTarget = null;
    }
  }

  return true;
}

// Internal: performs the actual area/player swap at the midpoint of the fade
function executeAreaSwap(newArea) {
  const old = state.currentArea;
  state.currentArea = newArea;

  playMusic(newArea);

  // Position player at the entry edge of the new area
  if (old === 'meadow' && newArea === 'park') {
    player.x = 30; player.y = 240;
  } else if (old === 'park' && newArea === 'meadow') {
    player.x = 610; player.y = 240;
  } else if (old === 'park' && newArea === 'playground') {
    player.x = 320; player.y = 30;
  } else if (old === 'playground' && newArea === 'park') {
    player.x = 320; player.y = 450;
  } else if (old === 'park' && newArea === 'boathouse') {
    player.x = 320; player.y = 450;
  } else if (old === 'boathouse' && newArea === 'park') {
    player.x = 320; player.y = 30;
  } else if (old === 'boathouse' && newArea === 'gate_area') {
    player.x = 30; player.y = 240;
  } else if (old === 'gate_area' && newArea === 'boathouse') {
    player.x = 610; player.y = 240;
  } else if (old === 'gate_area' && newArea === 'woods') {
    player.x = 320; player.y = 450;
  } else if (old === 'woods' && newArea === 'gate_area') {
    player.x = 320; player.y = 30;
  } else {
    player.x = 320; player.y = 240;
  }

  // Move boy to his resting position once player leaves meadow
  if (old === 'meadow') {
    state.boy.x = 290;
    state.boy.y = 270;
  }

  // Check for first woods entry (ladybug sighting)
  if (newArea === 'woods' && state.woodsFirstEntry) {
    state.woodsFirstEntry = false;
    state.woodsSightingPhase = 0;
  }

  saveGame();
}

// Check if player is at an area boundary and start a transition if needed
export function checkAreaTransition() {
  if (state.transitioning) return;

  const { currentArea, logsCleared } = state;
  const margin = 10;

  if (currentArea === 'meadow' && player.x > 640 - margin) {
    startTransition('park');
  } else if (currentArea === 'park' && player.x < margin) {
    startTransition('meadow');
  } else if (currentArea === 'park' && player.y > 480 - margin) {
    startTransition('playground');
  } else if (currentArea === 'playground' && player.y < margin) {
    startTransition('park');
  } else if (currentArea === 'park' && player.y < margin) {
    startTransition('boathouse');
  } else if (currentArea === 'boathouse' && player.y > 480 - margin) {
    startTransition('park');
  } else if (currentArea === 'boathouse' && player.x > 640 - margin) {
    startTransition('gate_area');
  } else if (currentArea === 'gate_area' && player.x < margin) {
    startTransition('boathouse');
  } else if (currentArea === 'gate_area' && logsCleared && player.y < margin) {
    startTransition('woods');
  } else if (currentArea === 'woods' && player.y > 480 - margin) {
    startTransition('gate_area');
  }
}
