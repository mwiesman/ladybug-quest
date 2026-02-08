// Keyboard input handling

export const keys = {};
export let spacePressed = false;

export function initInput(onSpace, onRestart) {
  window.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      if (!spacePressed) {
        spacePressed = true;
        onSpace();
      }
      e.preventDefault();
    } else {
      keys[e.key] = true;
    }

    if (e.key === 'r' || e.key === 'R') {
      onRestart();
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
