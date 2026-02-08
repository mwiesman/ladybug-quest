// UI rendering - interaction prompts on the game canvas

let ctx;
let canvasWidth;

export function setContext(canvasCtx, w) {
  ctx = canvasCtx;
  canvasWidth = w;
}

export function drawInteractionPrompt() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(canvasWidth / 2 - 80, 30, 160, 30);
  ctx.fillStyle = '#fff';
  ctx.font = '8px "Press Start 2P"';
  ctx.fillText('Press SPACE', canvasWidth / 2 - 60, 50);
}
