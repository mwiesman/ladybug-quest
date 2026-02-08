// Player object and movement logic

export const player = {
  x: 320,
  y: 280,
  width: 24,
  height: 32,
  speed: 2.5,
  direction: 'down',
  animFrame: 0,
  animTimer: 0,
  isMoving: false
};

export function resetPlayer() {
  player.x = 320;
  player.y = 280;
  player.direction = 'down';
  player.animFrame = 0;
  player.animTimer = 0;
  player.isMoving = false;
}
