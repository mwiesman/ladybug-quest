// Dialog portraits — hand-drawn, Hades-style. Each character is a 2D
// canvas illustration: cartoonish human proportions, bold ink lines, cel
// shading, a colored glow behind the figure, hatching and a vignette on
// warm paper. All drawn in code; no image assets.

const W = 340;
const H = 520;
const INK = '#33241a';
const PAPER = '#f0e6cf';

let boundCtx = null;

export function initPortraits(canvas) {
  canvas.width = W;
  canvas.height = H;
  boundCtx = canvas.getContext('2d');
}

export function renderPortrait(speaker) {
  if (!boundCtx) return;
  drawPortraitTo(boundCtx, speaker);
}

// ---------------------------------------------------------------- helpers

function ink(ctx, width = 5) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
}

function shape(ctx, fill, width, pathFn) {
  ctx.beginPath();
  pathFn(ctx);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (width > 0) {
    ink(ctx, width);
    ctx.stroke();
  }
}

function line(ctx, width, pathFn) {
  ctx.beginPath();
  pathFn(ctx);
  ink(ctx, width);
  ctx.stroke();
}

function backdrop(ctx, accent) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, H * 0.38, 30, W / 2, H * 0.45, H * 0.55);
  glow.addColorStop(0, accent);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
}

function finish(ctx) {
  // Sketch hatching + vignette
  ctx.save();
  ctx.strokeStyle = 'rgba(70, 52, 38, 0.06)';
  ctx.lineWidth = 2;
  for (let i = -H; i < W; i += 12) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();
  }
  const vig = ctx.createRadialGradient(W / 2, H * 0.42, H * 0.3, W / 2, H * 0.5, H * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(58, 42, 28, 0.3)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Soft cel shadow down the right side of the face
function faceShade(ctx, cx, cy, rx, ry) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = 'rgba(120, 80, 50, 0.16)';
  ctx.beginPath();
  ctx.ellipse(cx + rx * 0.62, cy, rx * 0.65, ry * 1.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Big cartoon eyes with brows. mood: 'open' | 'happy' | 'calm'
function eyes(ctx, cx, cy, { iris = '#5a3a1a', spread = 30, size = 1, mood = 'open',
                              lashes = false, browY = -32, browTilt = 0 } = {}) {
  for (const side of [-1, 1]) {
    const ex = cx + side * spread;
    if (mood === 'happy') {
      // Closed happy arcs
      line(ctx, 5, (c) => c.arc(ex, cy + 2, 13 * size, Math.PI * 1.15, Math.PI * 1.85));
    } else {
      shape(ctx, '#fdfaf2', 4, (c) => c.ellipse(ex, cy, 13 * size, 16 * size, 0, 0, Math.PI * 2));
      ctx.fillStyle = iris;
      ctx.beginPath();
      ctx.ellipse(ex + 2, cy + 2, 7.5 * size, 9 * size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(ex + 2, cy + 2, 3.6 * size, 4.4 * size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ex - 2, cy - 3, 3 * size, 0, Math.PI * 2);
      ctx.fill();
      // Upper lid
      line(ctx, 4, (c) => c.arc(ex, cy - 1, 13.5 * size, Math.PI * 1.1, Math.PI * 1.9));
      if (lashes) {
        line(ctx, 3, (c) => {
          c.moveTo(ex + side * 12 * size, cy - 8 * size);
          c.lineTo(ex + side * 19 * size, cy - 12 * size);
        });
      }
    }
    // Brow
    line(ctx, 6, (c) => c.arc(ex + side * 2, cy + browY + 18, 16,
      Math.PI * (1.2 + side * browTilt), Math.PI * (1.8 + side * browTilt)));
  }
}

// Face mask: sits across the lower half of the face with straps and folds
function faceMask(ctx, cx, cy, faceRx, { color, pattern = null, crooked = 0, bandana = false } = {}) {
  const top = cy + 8;
  const bottom = cy + faceRx * 1.06;
  ctx.save();
  ctx.translate(cx, (top + bottom) / 2);
  ctx.rotate(crooked);
  ctx.translate(-cx, -(top + bottom) / 2);

  shape(ctx, color, 5, (c) => {
    c.moveTo(cx - faceRx * 0.92, top);
    c.quadraticCurveTo(cx, top + 14, cx + faceRx * 0.92, top);
    c.quadraticCurveTo(cx + faceRx * 0.98, bottom - 26, cx, bottom);
    c.quadraticCurveTo(cx - faceRx * 0.98, bottom - 26, cx - faceRx * 0.92, top);
    c.closePath();
  });

  // Bandana hangs to a point below the chin
  if (bandana) {
    shape(ctx, color, 5, (c) => {
      c.moveTo(cx - faceRx * 0.6, bottom - 18);
      c.lineTo(cx, bottom + 34);
      c.lineTo(cx + faceRx * 0.6, bottom - 18);
    });
  }

  // Fold lines
  ctx.globalAlpha = 0.35;
  line(ctx, 3, (c) => c.moveTo(cx - faceRx * 0.6, top + 22) ||
    c.quadraticCurveTo(cx, top + 32, cx + faceRx * 0.6, top + 22));
  line(ctx, 3, (c) => c.moveTo(cx - faceRx * 0.55, top + 44) ||
    c.quadraticCurveTo(cx, top + 54, cx + faceRx * 0.55, top + 44));
  ctx.globalAlpha = 1;

  if (pattern) pattern(ctx, cx, (top + bottom) / 2, faceRx);
  ctx.restore();

  // Straps to the ears
  for (const side of [-1, 1]) {
    line(ctx, 4, (c) => {
      c.moveTo(cx + side * faceRx * 0.9, top + 4);
      c.quadraticCurveTo(cx + side * (faceRx + 14), top - 6, cx + side * (faceRx + 8), top - 22);
    });
  }
}

// A human bust: torso, neck, head, ears. Returns face metrics.
function bust(ctx, { skin, torso, sleeves = null, collar = null }) {
  const cx = W / 2;
  const headCy = 190;
  const faceRx = 64;
  const faceRy = 74;
  const shoulderY = 330;

  // Torso (waist-up, cropped by the frame)
  shape(ctx, torso, 6, (c) => {
    c.moveTo(cx - 118, H + 10);
    c.lineTo(cx - 112, shoulderY + 26);
    c.quadraticCurveTo(cx - 104, shoulderY - 22, cx - 46, shoulderY - 30);
    c.lineTo(cx + 46, shoulderY - 30);
    c.quadraticCurveTo(cx + 104, shoulderY - 22, cx + 112, shoulderY + 26);
    c.lineTo(cx + 118, H + 10);
  });
  // Sleeve seams
  if (sleeves) {
    for (const side of [-1, 1]) {
      shape(ctx, sleeves, 5, (c) => {
        c.moveTo(cx + side * 112, shoulderY + 30);
        c.quadraticCurveTo(cx + side * 106, shoulderY - 18, cx + side * 52, shoulderY - 28);
        c.lineTo(cx + side * 70, shoulderY + 60);
        c.lineTo(cx + side * 112, shoulderY + 70);
        c.closePath();
      });
    }
  }
  if (collar) {
    shape(ctx, collar, 5, (c) => {
      c.moveTo(cx - 40, shoulderY - 30);
      c.quadraticCurveTo(cx, shoulderY - 6, cx + 40, shoulderY - 30);
      c.quadraticCurveTo(cx, shoulderY - 44, cx - 40, shoulderY - 30);
    });
  }

  // Neck
  shape(ctx, skin, 5, (c) => {
    c.moveTo(cx - 20, headCy + faceRy - 18);
    c.lineTo(cx - 22, shoulderY - 26);
    c.lineTo(cx + 22, shoulderY - 26);
    c.lineTo(cx + 20, headCy + faceRy - 18);
  });

  // Ears
  for (const side of [-1, 1]) {
    shape(ctx, skin, 5, (c) =>
      c.ellipse(cx + side * faceRx, headCy + 14, 13, 18, 0, 0, Math.PI * 2));
  }

  // Head: rounded crown tapering to a soft chin
  shape(ctx, skin, 6, (c) => {
    c.moveTo(cx - faceRx, headCy - 8);
    c.quadraticCurveTo(cx - faceRx * 1.02, headCy - faceRy, cx, headCy - faceRy);
    c.quadraticCurveTo(cx + faceRx * 1.02, headCy - faceRy, cx + faceRx, headCy - 8);
    c.quadraticCurveTo(cx + faceRx * 0.9, headCy + faceRy * 0.72, cx, headCy + faceRy);
    c.quadraticCurveTo(cx - faceRx * 0.9, headCy + faceRy * 0.72, cx - faceRx, headCy - 8);
    c.closePath();
  });
  faceShade(ctx, cx, headCy, faceRx, faceRy);

  return { cx, headCy, faceRx, faceRy, shoulderY };
}

// ---------------------------------------------------------------- people

function drawGirl(ctx) {
  backdrop(ctx, 'rgba(220, 60, 80, 0.5)');

  const gingham = (() => {
    const p = document.createElement('canvas');
    p.width = p.height = 26;
    const px = p.getContext('2d');
    px.fillStyle = '#f6f1e7';
    px.fillRect(0, 0, 26, 26);
    px.fillStyle = 'rgba(204,34,34,0.55)';
    px.fillRect(0, 0, 13, 26);
    px.fillRect(0, 0, 26, 13);
    return ctx.createPattern(p, 'repeat');
  })();

  const m = bust(ctx, { skin: '#ffd9b0', torso: gingham, collar: '#cc2222' });

  // Pigtails behind the head
  for (const side of [-1, 1]) {
    shape(ctx, '#8b4513', 5, (c) =>
      c.ellipse(m.cx + side * (m.faceRx + 26), m.headCy + 34, 26, 34, side * 0.25, 0, Math.PI * 2));
    shape(ctx, '#8b4513', 5, (c) =>
      c.ellipse(m.cx + side * (m.faceRx + 34), m.headCy + 86, 18, 24, side * 0.3, 0, Math.PI * 2));
  }
  // Hair: rounded cap with a soft fringe
  shape(ctx, '#8b4513', 6, (c) => {
    c.moveTo(m.cx - m.faceRx - 4, m.headCy + 16);
    c.quadraticCurveTo(m.cx - m.faceRx * 1.14, m.headCy - m.faceRy * 1.02, m.cx, m.headCy - m.faceRy * 1.12);
    c.quadraticCurveTo(m.cx + m.faceRx * 1.14, m.headCy - m.faceRy * 1.02, m.cx + m.faceRx + 4, m.headCy + 16);
    c.quadraticCurveTo(m.cx + m.faceRx * 0.7, m.headCy - 26, m.cx + 20, m.headCy - 44);
    c.quadraticCurveTo(m.cx - 30, m.headCy - 62, m.cx - m.faceRx * 0.72, m.headCy - 18);
    c.closePath();
  });
  // Red bow
  shape(ctx, '#dc143c', 4, (c) => c.ellipse(m.cx + 44, m.headCy - m.faceRy + 6, 15, 10, 0.5, 0, Math.PI * 2));
  shape(ctx, '#dc143c', 4, (c) => c.ellipse(m.cx + 66, m.headCy - m.faceRy + 16, 15, 10, -0.2, 0, Math.PI * 2));
  shape(ctx, INK, 0, (c) => c.arc(m.cx + 55, m.headCy - m.faceRy + 12, 5, 0, Math.PI * 2));

  eyes(ctx, m.cx, m.headCy - 6, { iris: '#6a4020', lashes: true, size: 1.05 });
  faceMask(ctx, m.cx, m.headCy, m.faceRx, {
    color: '#dc143c',
    pattern: (c, x, y, r) => {
      c.fillStyle = '#fff';
      for (const [dx, dy] of [[-r * 0.5, -8], [0, -14], [r * 0.5, -8], [-r * 0.28, 16], [r * 0.28, 16], [0, 34]]) {
        c.beginPath();
        c.arc(x + dx, y + dy, 5, 0, Math.PI * 2);
        c.fill();
      }
    }
  });
  finish(ctx);
}

function drawBoy(ctx) {
  backdrop(ctx, 'rgba(80, 130, 200, 0.5)');
  const m = bust(ctx, { skin: '#ffd9b0', torso: '#4682b4', sleeves: '#5a9bd4' });

  // Short messy dark hair
  shape(ctx, '#2c2c2c', 6, (c) => {
    c.moveTo(m.cx - m.faceRx - 4, m.headCy + 4);
    c.quadraticCurveTo(m.cx - m.faceRx * 1.16, m.headCy - m.faceRy, m.cx - 16, m.headCy - m.faceRy * 1.12);
    c.lineTo(m.cx + 2, m.headCy - m.faceRy * 0.98);
    c.lineTo(m.cx + 22, m.headCy - m.faceRy * 1.14);
    c.lineTo(m.cx + 34, m.headCy - m.faceRy * 0.96);
    c.quadraticCurveTo(m.cx + m.faceRx * 1.12, m.headCy - m.faceRy * 0.9, m.cx + m.faceRx + 4, m.headCy + 4);
    c.quadraticCurveTo(m.cx + m.faceRx * 0.72, m.headCy - 34, m.cx + 12, m.headCy - 48);
    c.quadraticCurveTo(m.cx - 40, m.headCy - 56, m.cx - m.faceRx * 0.74, m.headCy - 24);
    c.closePath();
  });

  eyes(ctx, m.cx, m.headCy - 4, { iris: '#4a3018' });
  faceMask(ctx, m.cx, m.headCy, m.faceRx, {
    color: '#7b68ee',
    pattern: (c, x, y, r) => {
      // Tie-dye swirl rings
      const cols = ['#ff1493', '#4169e1', '#e6d8ff', '#9370db'];
      for (let ring = 0; ring < 4; ring++) {
        c.strokeStyle = cols[ring];
        c.lineWidth = 7 - ring;
        c.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.3) {
          const rr = (26 - ring * 6) + Math.sin(a * 3 + ring) * 3;
          const px = x - 6 + Math.cos(a) * rr;
          const py = y + 6 + Math.sin(a) * rr * 0.7;
          a === 0 ? c.moveTo(px, py) : c.lineTo(px, py);
        }
        c.closePath();
        c.stroke();
      }
    }
  });
  finish(ctx);
}

function drawFisherman(ctx) {
  backdrop(ctx, 'rgba(70, 110, 110, 0.5)');
  const m = bust(ctx, { skin: '#f0c8a0', torso: '#2f4f4f', collar: '#3d5f5f' });

  // Bushy gray brows drawn by eyes(); gray tufts by the ears
  for (const side of [-1, 1]) {
    shape(ctx, '#9a9a96', 4, (c) =>
      c.ellipse(m.cx + side * (m.faceRx - 4), m.headCy + 6, 10, 16, side * 0.3, 0, Math.PI * 2));
  }
  eyes(ctx, m.cx, m.headCy - 2, { iris: '#4a5a5a', size: 0.85, browY: -26 });
  // Weathered crow's feet
  for (const side of [-1, 1]) {
    line(ctx, 2.5, (c) => {
      c.moveTo(m.cx + side * 46, m.headCy - 4);
      c.lineTo(m.cx + side * 56, m.headCy - 8);
    });
  }
  faceMask(ctx, m.cx, m.headCy, m.faceRx, { color: '#8a8a86' });

  // Bucket hat
  shape(ctx, '#8b4513', 6, (c) => {
    c.moveTo(m.cx - m.faceRx - 24, m.headCy - 42);
    c.quadraticCurveTo(m.cx, m.headCy - 18, m.cx + m.faceRx + 24, m.headCy - 42);
    c.lineTo(m.cx + m.faceRx - 2, m.headCy - 66);
    c.quadraticCurveTo(m.cx + 40, m.headCy - m.faceRy - 34, m.cx, m.headCy - m.faceRy - 36);
    c.quadraticCurveTo(m.cx - 40, m.headCy - m.faceRy - 34, m.cx - m.faceRx + 2, m.headCy - 66);
    c.closePath();
  });
  line(ctx, 3, (c) => {
    c.moveTo(m.cx - m.faceRx + 6, m.headCy - 60);
    c.quadraticCurveTo(m.cx, m.headCy - 46, m.cx + m.faceRx - 6, m.headCy - 60);
  });

  // Fishing rod over the shoulder
  line(ctx, 7, (c) => {
    c.moveTo(m.cx + 96, H - 30);
    c.lineTo(m.cx + 150, m.headCy - 120);
  });
  line(ctx, 2.5, (c) => {
    c.moveTo(m.cx + 150, m.headCy - 120);
    c.quadraticCurveTo(m.cx + 158, m.headCy - 40, m.cx + 148, m.headCy + 10);
  });
  shape(ctx, '#ff6347', 3, (c) => c.arc(m.cx + 148, m.headCy + 18, 8, 0, Math.PI * 2));

  finish(ctx);
}

function drawHippie(ctx) {
  backdrop(ctx, 'rgba(150, 110, 220, 0.5)');
  const m = bust(ctx, { skin: '#ffd9b0', torso: '#9370db' });

  // Long flowing hair behind the shoulders
  shape(ctx, '#8b7355', 6, (c) => {
    c.moveTo(m.cx - m.faceRx - 6, m.headCy - 20);
    c.quadraticCurveTo(m.cx - m.faceRx - 40, m.headCy + 120, m.cx - m.faceRx - 20, m.shoulderY + 90);
    c.lineTo(m.cx - m.faceRx + 26, m.shoulderY + 60);
    c.quadraticCurveTo(m.cx - m.faceRx - 4, m.headCy + 90, m.cx - m.faceRx + 8, m.headCy + 20);
    c.closePath();
  });
  shape(ctx, '#8b7355', 6, (c) => {
    c.moveTo(m.cx + m.faceRx + 6, m.headCy - 20);
    c.quadraticCurveTo(m.cx + m.faceRx + 40, m.headCy + 120, m.cx + m.faceRx + 20, m.shoulderY + 90);
    c.lineTo(m.cx + m.faceRx - 26, m.shoulderY + 60);
    c.quadraticCurveTo(m.cx + m.faceRx + 4, m.headCy + 90, m.cx + m.faceRx - 8, m.headCy + 20);
    c.closePath();
  });
  // Top of the hair
  shape(ctx, '#8b7355', 6, (c) => {
    c.moveTo(m.cx - m.faceRx - 6, m.headCy - 16);
    c.quadraticCurveTo(m.cx - m.faceRx * 1.15, m.headCy - m.faceRy * 1.05, m.cx, m.headCy - m.faceRy * 1.14);
    c.quadraticCurveTo(m.cx + m.faceRx * 1.15, m.headCy - m.faceRy * 1.05, m.cx + m.faceRx + 6, m.headCy - 16);
    c.quadraticCurveTo(m.cx + m.faceRx * 0.66, m.headCy - 40, m.cx, m.headCy - 46);
    c.quadraticCurveTo(m.cx - m.faceRx * 0.66, m.headCy - 40, m.cx - m.faceRx - 6, m.headCy - 16);
    c.closePath();
  });
  // Headband
  shape(ctx, '#ff6347', 5, (c) => {
    c.moveTo(m.cx - m.faceRx - 4, m.headCy - 34);
    c.quadraticCurveTo(m.cx, m.headCy - 52, m.cx + m.faceRx + 4, m.headCy - 34);
    c.quadraticCurveTo(m.cx, m.headCy - 30, m.cx - m.faceRx - 4, m.headCy - 34);
  });

  eyes(ctx, m.cx, m.headCy - 4, { iris: '#5a4a2a', mood: 'calm', size: 0.95 });
  // Round glasses
  for (const side of [-1, 1]) {
    line(ctx, 4, (c) => c.arc(m.cx + side * 30, m.headCy - 4, 22, 0, Math.PI * 2));
  }
  line(ctx, 4, (c) => {
    c.moveTo(m.cx - 8, m.headCy - 4);
    c.lineTo(m.cx + 8, m.headCy - 4);
  });

  faceMask(ctx, m.cx, m.headCy, m.faceRx, { color: '#ff6347', bandana: true,
    pattern: (c, x, y, r) => {
      c.fillStyle = 'rgba(255, 230, 200, 0.8)';
      for (const [dx, dy] of [[-r * 0.4, 0], [0, 10], [r * 0.4, 0], [0, -12]]) {
        c.beginPath();
        c.arc(x + dx, y + dy, 3.5, 0, Math.PI * 2);
        c.fill();
      }
    } });

  // Peace pendant
  line(ctx, 4, (c) => c.arc(m.cx, m.shoulderY + 26, 34, Math.PI * 0.15, Math.PI * 0.85));
  shape(ctx, '#e8c840', 4, (c) => c.arc(m.cx, m.shoulderY + 62, 13, 0, Math.PI * 2));
  line(ctx, 2.5, (c) => {
    c.moveTo(m.cx, m.shoulderY + 49);
    c.lineTo(m.cx, m.shoulderY + 75);
    c.moveTo(m.cx, m.shoulderY + 62);
    c.lineTo(m.cx - 9, m.shoulderY + 71);
    c.moveTo(m.cx, m.shoulderY + 62);
    c.lineTo(m.cx + 9, m.shoulderY + 71);
  });
  finish(ctx);
}

function drawKid(ctx) {
  backdrop(ctx, 'rgba(255, 160, 40, 0.5)');
  const m = bust(ctx, { skin: '#ffd9b0', torso: '#ffa500', sleeves: '#ff8c00' });

  // Backwards cap
  shape(ctx, '#ff8c00', 6, (c) => {
    c.moveTo(m.cx - m.faceRx - 4, m.headCy - 24);
    c.quadraticCurveTo(m.cx - m.faceRx * 1.08, m.headCy - m.faceRy * 1.06, m.cx, m.headCy - m.faceRy * 1.12);
    c.quadraticCurveTo(m.cx + m.faceRx * 1.08, m.headCy - m.faceRy * 1.06, m.cx + m.faceRx + 4, m.headCy - 24);
    c.quadraticCurveTo(m.cx, m.headCy - 56, m.cx - m.faceRx - 4, m.headCy - 24);
    c.closePath();
  });
  // Brim poking out the back-left
  shape(ctx, '#ff8c00', 5, (c) => {
    c.moveTo(m.cx - m.faceRx - 2, m.headCy - 44);
    c.quadraticCurveTo(m.cx - m.faceRx - 46, m.headCy - 56, m.cx - m.faceRx - 40, m.headCy - 30);
    c.quadraticCurveTo(m.cx - m.faceRx - 12, m.headCy - 26, m.cx - m.faceRx - 2, m.headCy - 44);
  });
  // Cap button + seam
  line(ctx, 3, (c) => {
    c.moveTo(m.cx, m.headCy - m.faceRy * 1.1);
    c.lineTo(m.cx, m.headCy - 40);
  });
  // Tuft of hair under the cap
  shape(ctx, '#654321', 4, (c) => {
    c.moveTo(m.cx + 24, m.headCy - 40);
    c.quadraticCurveTo(m.cx + 44, m.headCy - 50, m.cx + 52, m.headCy - 32);
    c.quadraticCurveTo(m.cx + 36, m.headCy - 32, m.cx + 24, m.headCy - 40);
  });

  eyes(ctx, m.cx, m.headCy - 6, { iris: '#5a3a1a', size: 1.15, browY: -36 });
  // Freckles above the mask
  ctx.fillStyle = 'rgba(200, 130, 90, 0.7)';
  for (const [dx, dy] of [[-42, 16], [-34, 22], [-46, 24], [42, 16], [34, 22], [46, 24]]) {
    ctx.beginPath();
    ctx.arc(m.cx + dx, m.headCy + dy - 10, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  faceMask(ctx, m.cx, m.headCy, m.faceRx, { color: '#87ceeb', crooked: 0.06 });
  finish(ctx);
}

function drawParent(ctx) {
  backdrop(ctx, 'rgba(120, 160, 80, 0.5)');
  const m = bust(ctx, { skin: '#ffd9b0', torso: '#6b8e23', collar: '#7ba02e' });

  // Shoulder-length hair
  for (const side of [-1, 1]) {
    shape(ctx, '#3b2412', 6, (c) => {
      c.moveTo(m.cx + side * (m.faceRx - 8), m.headCy - 30);
      c.quadraticCurveTo(m.cx + side * (m.faceRx + 34), m.headCy + 40, m.cx + side * (m.faceRx + 18), m.shoulderY + 10);
      c.quadraticCurveTo(m.cx + side * (m.faceRx - 10), m.shoulderY + 4, m.cx + side * (m.faceRx - 20), m.headCy + 60);
      c.closePath();
    });
  }
  shape(ctx, '#3b2412', 6, (c) => {
    c.moveTo(m.cx - m.faceRx - 8, m.headCy - 10);
    c.quadraticCurveTo(m.cx - m.faceRx * 1.15, m.headCy - m.faceRy, m.cx, m.headCy - m.faceRy * 1.1);
    c.quadraticCurveTo(m.cx + m.faceRx * 1.15, m.headCy - m.faceRy, m.cx + m.faceRx + 8, m.headCy - 10);
    c.quadraticCurveTo(m.cx + m.faceRx * 0.6, m.headCy - 38, m.cx - 10, m.headCy - 44);
    c.quadraticCurveTo(m.cx - m.faceRx * 0.7, m.headCy - 36, m.cx - m.faceRx - 8, m.headCy - 10);
    c.closePath();
  });
  // Wide sun hat
  shape(ctx, '#4a4a4a', 6, (c) =>
    c.ellipse(m.cx, m.headCy - m.faceRy + 4, m.faceRx + 52, 26, 0, 0, Math.PI * 2));
  shape(ctx, '#5a5a5a', 5, (c) => {
    c.moveTo(m.cx - 48, m.headCy - m.faceRy + 2);
    c.quadraticCurveTo(m.cx, m.headCy - m.faceRy - 52, m.cx + 48, m.headCy - m.faceRy + 2);
    c.quadraticCurveTo(m.cx, m.headCy - m.faceRy + 22, m.cx - 48, m.headCy - m.faceRy + 2);
  });

  eyes(ctx, m.cx, m.headCy - 4, { iris: '#4a3018', lashes: true, mood: 'calm' });
  faceMask(ctx, m.cx, m.headCy, m.faceRx, { color: '#f5f0e6' });

  // Coffee cup in hand at the frame's edge
  shape(ctx, '#f5f0e6', 5, (c) => {
    c.moveTo(m.cx + 74, H - 60);
    c.lineTo(m.cx + 122, H - 60);
    c.lineTo(m.cx + 116, H - 4);
    c.lineTo(m.cx + 80, H - 4);
    c.closePath();
  });
  shape(ctx, '#8b4513', 4, (c) => {
    c.moveTo(m.cx + 70, H - 60);
    c.lineTo(m.cx + 126, H - 60);
    c.lineTo(m.cx + 124, H - 48);
    c.lineTo(m.cx + 72, H - 48);
    c.closePath();
  });
  finish(ctx);
}

// ---------------------------------------------------------------- animals

function drawDog(ctx) {
  backdrop(ctx, 'rgba(218, 165, 32, 0.55)');
  const cx = W / 2, cy = 250;

  // Chest
  shape(ctx, '#daa520', 6, (c) => {
    c.moveTo(cx - 110, H + 10);
    c.quadraticCurveTo(cx - 96, 380, cx - 60, 360);
    c.lineTo(cx + 60, 360);
    c.quadraticCurveTo(cx + 96, 380, cx + 110, H + 10);
  });
  shape(ctx, '#f0e68c', 5, (c) => c.ellipse(cx, H - 40, 58, 80, 0, Math.PI, Math.PI * 2));

  // Floppy ears
  for (const side of [-1, 1]) {
    shape(ctx, '#b8860b', 6, (c) => {
      c.moveTo(cx + side * 52, cy - 88);
      c.quadraticCurveTo(cx + side * 132, cy - 66, cx + side * 108, cy + 38);
      c.quadraticCurveTo(cx + side * 92, cy + 60, cx + side * 70, cy + 30);
      c.closePath();
    });
  }
  // Head
  shape(ctx, '#daa520', 6, (c) => {
    c.moveTo(cx - 78, cy - 40);
    c.quadraticCurveTo(cx - 78, cy - 108, cx, cy - 108);
    c.quadraticCurveTo(cx + 78, cy - 108, cx + 78, cy - 40);
    c.quadraticCurveTo(cx + 76, cy + 50, cx, cy + 66);
    c.quadraticCurveTo(cx - 76, cy + 50, cx - 78, cy - 40);
    c.closePath();
  });
  // Muzzle
  shape(ctx, '#f0e68c', 5, (c) => c.ellipse(cx, cy + 28, 44, 36, 0, 0, Math.PI * 2));
  shape(ctx, INK, 0, (c) => c.ellipse(cx, cy + 10, 14, 10, 0, 0, Math.PI * 2));
  // Tongue
  shape(ctx, '#ff8da1', 4, (c) => {
    c.moveTo(cx - 12, cy + 46);
    c.quadraticCurveTo(cx - 12, cy + 84, cx + 4, cy + 84);
    c.quadraticCurveTo(cx + 18, cy + 84, c.lineTo ? cx + 14 : cx + 14, cy + 46);
    c.closePath();
  });
  line(ctx, 3, (c) => {
    c.moveTo(cx + 1, cy + 56);
    c.lineTo(cx + 1, cy + 76);
  });

  eyes(ctx, cx, cy - 40, { iris: '#4a3018', spread: 34, size: 1.1, mood: 'happy' });
  // Collar + tag
  shape(ctx, '#dc143c', 5, (c) => {
    c.moveTo(cx - 62, 352);
    c.quadraticCurveTo(cx, 386, cx + 62, 352);
    c.lineTo(cx + 58, 376);
    c.quadraticCurveTo(cx, 408, cx - 58, 376);
    c.closePath();
  });
  shape(ctx, '#ffd700', 4, (c) => c.arc(cx, 404, 14, 0, Math.PI * 2));
  finish(ctx);
}

function drawSquirrel(ctx) {
  backdrop(ctx, 'rgba(160, 82, 45, 0.55)');
  const cx = W / 2, cy = 260;

  // Big tail curling behind
  shape(ctx, '#8b6914', 6, (c) => {
    c.moveTo(cx + 60, H);
    c.quadraticCurveTo(cx + 170, H - 130, cx + 130, cy - 90);
    c.quadraticCurveTo(cx + 110, cy - 170, cx + 30, cy - 150);
    c.quadraticCurveTo(cx + 100, cy - 130, cx + 92, cy - 60);
    c.quadraticCurveTo(cx + 96, 60, cx + 20, H);
    c.closePath();
  });

  // Body/chest
  shape(ctx, '#a0522d', 6, (c) => {
    c.moveTo(cx - 96, H + 10);
    c.quadraticCurveTo(cx - 90, 390, cx - 50, 368);
    c.lineTo(cx + 50, 368);
    c.quadraticCurveTo(cx + 90, 390, cx + 96, H + 10);
  });
  shape(ctx, '#d2a679', 5, (c) => c.ellipse(cx, H - 30, 52, 74, 0, Math.PI, Math.PI * 2));

  // Ears
  for (const side of [-1, 1]) {
    shape(ctx, '#a0522d', 5, (c) => {
      c.moveTo(cx + side * 28, cy - 96);
      c.lineTo(cx + side * 52, cy - 150);
      c.lineTo(cx + side * 64, cy - 92);
      c.closePath();
    });
  }
  // Head with big cheeks
  shape(ctx, '#a0522d', 6, (c) => {
    c.moveTo(cx - 66, cy - 60);
    c.quadraticCurveTo(cx - 60, cy - 110, cx, cy - 110);
    c.quadraticCurveTo(cx + 60, cy - 110, cx + 66, cy - 60);
    c.quadraticCurveTo(cx + 78, cy + 30, cx, cy + 44);
    c.quadraticCurveTo(cx - 78, cy + 30, cx - 66, cy - 60);
    c.closePath();
  });
  shape(ctx, '#d2a679', 5, (c) => c.ellipse(cx, cy + 8, 34, 28, 0, 0, Math.PI * 2));
  shape(ctx, INK, 0, (c) => c.ellipse(cx, cy - 6, 9, 7, 0, 0, Math.PI * 2));
  // Buck teeth
  shape(ctx, '#fdfaf2', 3, (c) => {
    c.rect(cx - 8, cy + 12, 8, 14);
    c.rect(cx, cy + 12, 8, 14);
  });

  eyes(ctx, cx, cy - 44, { iris: '#3a2a10', spread: 32, size: 1.05 });

  // Acorn clutched at the chest
  shape(ctx, '#c8a038', 5, (c) => c.ellipse(cx, 420, 24, 30, 0, 0, Math.PI * 2));
  shape(ctx, '#654321', 4, (c) => {
    c.moveTo(cx - 26, 402);
    c.quadraticCurveTo(cx, 384, cx + 26, 402);
    c.quadraticCurveTo(cx, 412, cx - 26, 402);
  });
  for (const side of [-1, 1]) {
    shape(ctx, '#a0522d', 4, (c) => c.ellipse(cx + side * 30, 424, 12, 16, side * 0.5, 0, Math.PI * 2));
  }
  finish(ctx);
}

function drawBird(ctx) {
  backdrop(ctx, 'rgba(255, 99, 71, 0.5)');
  const cx = W / 2, cy = 265;

  // Tail feathers
  shape(ctx, '#654321', 5, (c) => {
    c.moveTo(cx + 40, cy + 120);
    c.lineTo(cx + 150, cy + 190);
    c.lineTo(cx + 120, cy + 230);
    c.lineTo(cx + 30, cy + 160);
    c.closePath();
  });
  // Body: round robin with red breast
  shape(ctx, '#8b4513', 6, (c) => c.ellipse(cx, cy + 60, 108, 130, 0, 0, Math.PI * 2));
  shape(ctx, '#ff6347', 5, (c) => c.ellipse(cx - 10, cy + 92, 76, 92, 0, 0, Math.PI * 2));
  // Wing
  shape(ctx, '#654321', 5, (c) => {
    c.moveTo(cx + 58, cy + 10);
    c.quadraticCurveTo(cx + 130, cy + 60, cx + 96, cy + 150);
    c.quadraticCurveTo(cx + 66, cy + 110, cx + 58, cy + 10);
    c.closePath();
  });
  // Head
  shape(ctx, '#8b4513', 6, (c) => c.arc(cx - 30, cy - 60, 72, 0, Math.PI * 2));
  // Beak
  shape(ctx, '#ffa500', 5, (c) => {
    c.moveTo(cx - 96, cy - 66);
    c.lineTo(cx - 150, cy - 48);
    c.lineTo(cx - 94, cy - 38);
    c.closePath();
  });
  eyes(ctx, cx - 30, cy - 70, { iris: '#2a1a08', spread: 26, size: 0.95 });
  finish(ctx);
}

function drawCoffee(ctx) {
  backdrop(ctx, 'rgba(139, 69, 19, 0.55)');
  const cx = W / 2;

  // Service window frame
  shape(ctx, '#6b3410', 7, (c) => c.rect(26, 60, W - 52, H - 140));
  shape(ctx, '#241408', 0, (c) => c.rect(40, 74, W - 80, H - 168));
  // Counter
  shape(ctx, '#d8c8a8', 6, (c) => c.rect(26, H - 90, W - 52, 34));

  // The barista, lit from the window: cap, mask, apron
  const m = { cx, headCy: 210, faceRx: 60, faceRy: 70, shoulderY: 340 };
  shape(ctx, '#5a3a22', 6, (c) => {
    c.moveTo(cx - 104, H - 92);
    c.quadraticCurveTo(cx - 98, m.shoulderY - 18, cx - 44, m.shoulderY - 26);
    c.lineTo(cx + 44, m.shoulderY - 26);
    c.quadraticCurveTo(cx + 98, m.shoulderY - 18, cx + 104, H - 92);
    c.closePath();
  });
  shape(ctx, '#cfc5ae', 5, (c) => {
    c.moveTo(cx - 54, m.shoulderY - 10);
    c.lineTo(cx + 54, m.shoulderY - 10);
    c.lineTo(cx + 46, H - 92);
    c.lineTo(cx - 46, H - 92);
    c.closePath();
  });
  shape(ctx, '#c9a175', 5, (c) => {
    c.moveTo(cx - 18, m.headCy + m.faceRy - 16);
    c.lineTo(cx - 20, m.shoulderY - 22);
    c.lineTo(cx + 20, m.shoulderY - 22);
    c.lineTo(cx + 18, m.headCy + m.faceRy - 16);
  });
  shape(ctx, '#c9a175', 6, (c) => {
    c.moveTo(cx - m.faceRx, m.headCy - 6);
    c.quadraticCurveTo(cx - m.faceRx, m.headCy - m.faceRy, cx, m.headCy - m.faceRy);
    c.quadraticCurveTo(cx + m.faceRx, m.headCy - m.faceRy, cx + m.faceRx, m.headCy - 6);
    c.quadraticCurveTo(cx + m.faceRx * 0.88, m.headCy + m.faceRy * 0.7, cx, m.headCy + m.faceRy);
    c.quadraticCurveTo(cx - m.faceRx * 0.88, m.headCy + m.faceRy * 0.7, cx - m.faceRx, m.headCy - 6);
    c.closePath();
  });
  faceShade(ctx, cx, m.headCy, m.faceRx, m.faceRy);
  eyes(ctx, cx, m.headCy - 4, { iris: '#3a2a1a', size: 0.95 });
  faceMask(ctx, cx, m.headCy, m.faceRx, { color: '#2c2c2c' });
  // Cap pulled low
  shape(ctx, '#2c2c2c', 6, (c) => {
    c.moveTo(cx - m.faceRx - 4, m.headCy - 30);
    c.quadraticCurveTo(cx - m.faceRx, m.headCy - m.faceRy * 1.1, cx, m.headCy - m.faceRy * 1.14);
    c.quadraticCurveTo(cx + m.faceRx, m.headCy - m.faceRy * 1.1, cx + m.faceRx + 4, m.headCy - 30);
    c.quadraticCurveTo(cx, m.headCy - 54, cx - m.faceRx - 4, m.headCy - 30);
    c.closePath();
  });
  shape(ctx, '#2c2c2c', 5, (c) => {
    c.moveTo(cx - 56, m.headCy - 40);
    c.quadraticCurveTo(cx, m.headCy - 16, cx + 56, m.headCy - 40);
    c.quadraticCurveTo(cx, m.headCy - 28, cx - 56, m.headCy - 40);
  });

  // A cup on the counter with steam
  shape(ctx, '#f5f0e6', 5, (c) => {
    c.moveTo(cx + 70, H - 90);
    c.lineTo(cx + 110, H - 90);
    c.lineTo(cx + 104, H - 132);
    c.lineTo(cx + 76, H - 132);
    c.closePath();
  });
  ctx.globalAlpha = 0.5;
  line(ctx, 3, (c) => {
    c.moveTo(cx + 90, H - 140);
    c.quadraticCurveTo(cx + 80, H - 160, cx + 92, H - 178);
    c.quadraticCurveTo(cx + 102, H - 192, cx + 94, H - 206);
  });
  ctx.globalAlpha = 1;
  finish(ctx);
}

function drawLadybug(ctx) {
  backdrop(ctx, 'rgba(221, 34, 34, 0.5)');
  const cx = W / 2, cy = 290;

  // Leaf underneath
  shape(ctx, '#55aa44', 5, (c) => {
    c.moveTo(cx - 130, cy + 130);
    c.quadraticCurveTo(cx, cy + 60, cx + 130, cy + 130);
    c.quadraticCurveTo(cx, cy + 200, cx - 130, cy + 130);
  });
  line(ctx, 3, (c) => {
    c.moveTo(cx - 110, cy + 128);
    c.quadraticCurveTo(cx, cy + 118, cx + 110, cy + 128);
  });

  // Shell
  shape(ctx, '#cc1111', 6, (c) => c.ellipse(cx, cy, 105, 92, 0, 0, Math.PI * 2));
  line(ctx, 5, (c) => {
    c.moveTo(cx, cy - 92);
    c.lineTo(cx, cy + 92);
  });
  ctx.fillStyle = INK;
  for (const [dx, dy, r] of [[-52, -30, 15], [52, -30, 15], [-38, 34, 12], [38, 34, 12], [-70, 10, 9], [70, 10, 9]]) {
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Head
  shape(ctx, '#1a1a1a', 5, (c) => c.ellipse(cx, cy - 96, 46, 34, 0, Math.PI, Math.PI * 2));
  // Big friendly eyes on the head
  for (const side of [-1, 1]) {
    shape(ctx, '#fdfaf2', 3, (c) => c.arc(cx + side * 20, cy - 108, 10, 0, Math.PI * 2));
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(cx + side * 21, cy - 107, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Antennae
  for (const side of [-1, 1]) {
    line(ctx, 3.5, (c) => {
      c.moveTo(cx + side * 16, cy - 126);
      c.quadraticCurveTo(cx + side * 34, cy - 160, cx + side * 56, cy - 168);
    });
    shape(ctx, '#1a1a1a', 0, (c) => c.arc(cx + side * 58, cy - 169, 5, 0, Math.PI * 2));
  }
  finish(ctx);
}

// ---------------------------------------------------------------- registry

const DRAWERS = {
  girl: drawGirl,
  boy: drawBoy,
  fisherman: drawFisherman,
  hippie: drawHippie,
  kid: drawKid,
  parent: drawParent,
  dog: drawDog,
  squirrel: drawSquirrel,
  bird: drawBird,
  coffeeCart: drawCoffee,
  ladybug: drawLadybug
};

export function drawPortraitTo(ctx, speaker) {
  const draw = DRAWERS[speaker] ?? drawGirl;
  ctx.clearRect(0, 0, W, H);
  draw(ctx);
}
