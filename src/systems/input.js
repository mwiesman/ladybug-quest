// Keyboard input handling

export const keys = {};
export let spacePressed = false;

export function initInput(onSpace, onRestart, onMuteToggle, onEscape, onManualSave, onContinue, onNewGame) {
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      if (!spacePressed) {
        spacePressed = true;
        onSpace();
      }
      e.preventDefault();
    } else if (e.key === 'Escape') {
      if (onEscape) onEscape();
    } else {
      keys[e.key] = true;
    }

    if (e.key === 'r' || e.key === 'R') {
      onRestart();
    }

    if (e.key === 'm' || e.key === 'M') {
      if (onMuteToggle) onMuteToggle();
    }

    if (e.key === 'p' || e.key === 'P') {
      if (onManualSave) onManualSave();
    }

    if (e.key === 'c' || e.key === 'C') {
      if (onContinue) onContinue();
    }

    if (e.key === 'n' || e.key === 'N') {
      if (onNewGame) onNewGame();
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === ' ') {
      spacePressed = false;
    } else {
      keys[e.key] = false;
    }
  });
}
