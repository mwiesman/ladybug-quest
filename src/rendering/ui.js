// UI rendering - interaction prompts and notifications on the game canvas

let ctx;
let canvasWidth;

let saveNotificationTimer = 0;
const SAVE_NOTIFICATION_DURATION = 90;

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

export function showSaveNotification() {
  saveNotificationTimer = SAVE_NOTIFICATION_DURATION;
}

export function drawSaveNotification() {
  if (saveNotificationTimer <= 0) return;
  saveNotificationTimer--;

  const alpha = saveNotificationTimer < 30
    ? saveNotificationTimer / 30
    : 1;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(canvasWidth - 140, 10, 130, 28);
  ctx.fillStyle = '#fff';
  ctx.font = '8px "Press Start 2P"';
  ctx.fillText('Game Saved', canvasWidth - 130, 29);
  ctx.restore();
}
