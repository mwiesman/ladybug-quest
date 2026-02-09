// World / area transition logic
// Handles moving between areas and resetting player position

import { state, GAME_STATE } from './state.js';
import { player } from './player.js';
import { playMusic, playSFX } from '../systems/audio.js';
import { saveGame } from '../systems/save.js';

// Transition player to a new area, repositioning them at the correct edge
export function transitionToArea(newArea) {
  const old = state.currentArea;
  state.currentArea = newArea;

  playSFX('area_transition');
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
  } else if (old === 'park' && newArea === 'gate_area') {
    player.x = 320; player.y = 450;
  } else if (old === 'gate_area' && newArea === 'park') {
    player.x = 320; player.y = 30;
  } else if (old === 'gate_area' && newArea === 'woods') {
    player.x = 30; player.y = 240;
  } else if (old === 'woods' && newArea === 'gate_area') {
    player.x = 610; player.y = 240;
  } else if (old === 'woods' && newArea === 'boathouse') {
    player.x = 320; player.y = 450;
  } else if (old === 'boathouse' && newArea === 'woods') {
    player.x = 320; player.y = 30;
  } else {
    player.x = 320; player.y = 240;
  }

  saveGame();
}

// Check if player is at an area boundary and transition if needed
export function checkAreaTransition() {
  const { currentArea, gateUnlocked, logsCleared } = state;
  const margin = 10;

  if (currentArea === 'meadow' && player.x > 640 - margin) {
    transitionToArea('park');
  } else if (currentArea === 'park' && player.x < margin) {
    transitionToArea('meadow');
  } else if (currentArea === 'park' && player.y < margin) {
    transitionToArea('gate_area');
  } else if (currentArea === 'park' && player.y > 480 - margin) {
    transitionToArea('playground');
  } else if (currentArea === 'playground' && player.y < margin) {
    transitionToArea('park');
  } else if (currentArea === 'gate_area' && player.y > 480 - margin) {
    transitionToArea('park');
  } else if (currentArea === 'gate_area' && gateUnlocked && player.x > 640 - margin) {
    transitionToArea('woods');
  } else if (currentArea === 'woods' && player.x < margin) {
    transitionToArea('gate_area');
  } else if (currentArea === 'woods' && logsCleared && player.y < margin) {
    transitionToArea('boathouse');
  } else if (currentArea === 'boathouse' && player.y > 480 - margin) {
    transitionToArea('woods');
  }
}
