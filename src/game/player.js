// Player object and movement logic

export const player = {
  x: 310,
  y: 200,
  width: 24,
  height: 32,
  speed: 2,
  direction: 'down',
  animFrame: 0,
  animTimer: 0,
  isMoving: false
};

export function resetPlayer() {
  player.x = 310;
  player.y = 200;
  player.direction = 'down';
  player.animFrame = 0;
  player.animTimer = 0;
  player.isMoving = false;
}
