// Dialog portraits — anime-styled, Hades / JoJo direction: angular faces
// with real jawlines, almond eyes under heavy lids, short strong necks,
// asymmetric leaning poses, hard cel shadows, spiky hair shapes, and a rim
// light — over a colored glow with hatching and vignette on warm paper.
// All drawn in canvas code; no image assets.

const W = 340;
const H = 520;
const INK = '#2b1f16';
const PAPER = '#efe4cb';

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

function stroke(ctx, color, width, pathFn) {
  ctx.beginPath();
  pathFn(ctx);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function backdrop(ctx, accent) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, H * 0.36, 30, W / 2, H * 0.44, H * 0.58);
  glow.addColorStop(0, accent);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
}

function finish(ctx) {
  ctx.save();
  ctx.strokeStyle = 'rgba(70, 52, 38, 0.055)';
  ctx.lineWidth = 2;
  for (let i = -H; i < W; i += 12) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();
  }
  const vig = ctx.createRadialGradient(W / 2, H * 0.42, H * 0.3, W / 2, H * 0.5, H * 0.78);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(50, 36, 24, 0.34)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// The whole figure drawn inside a leaning frame — Hades poses tilt
function withLean(ctx, lean, fn) {
  ctx.save();
  ctx.translate(W / 2, H * 0.6);
  ctx.rotate(lean);
  ctx.translate(-W / 2, -H * 0.6);
  fn();
  ctx.restore();
}

// ------------------------------------------------------------ anime rig

// Angular head with jawline and squared chin; slight 3/4 asymmetry.
// Returns the path fn so masks/shadows can reuse it.
function headPath(m) {
  const { cx, cy, hw } = m;
  return (c) => {
    c.moveTo(cx - hw, cy - 6);
    c.quadraticCurveTo(cx - hw - 6, cy - 74, cx - 16, cy - 84);
    c.quadraticCurveTo(cx + hw - 10, cy - 90, cx + hw - 2, cy - 26);
    c.quadraticCurveTo(cx + hw + 3, cy + 26, cx + 36, cy + 64);
    c.quadraticCurveTo(cx + 20, cy + 84, cx - 2, cy + 86);
    c.lineTo(cx - 16, cy + 82);
    c.quadraticCurveTo(cx - hw + 2, cy + 48, cx - hw, cy - 6);
    c.closePath();
  };
}

// Short strong neck + sloped shoulders/torso, one shoulder raised
function animeBody(ctx, m, { skin, torso, sleeves = null, shoulderTilt = 8 }) {
  const { cx } = m;
  const chinY = m.cy + 84;
  const shY = chinY + 62;

  // Neck first — the torso covers its flare so no stray lines cross the shirt
  shape(ctx, skin, 5, (c) => {
    c.moveTo(cx - 24, chinY - 14);
    c.quadraticCurveTo(cx - 26, chinY + 26, cx - 38, shY - 12 - shoulderTilt);
    c.lineTo(cx + 38, shY - 12 + shoulderTilt);
    c.quadraticCurveTo(cx + 26, chinY + 26, cx + 24, chinY - 14);
    c.closePath();
  });
  // Neck shadow under the jaw
  ctx.fillStyle = 'rgba(110, 70, 45, 0.22)';
  ctx.beginPath();
  ctx.moveTo(cx - 22, chinY - 12);
  ctx.quadraticCurveTo(cx, chinY + 4, cx + 22, chinY - 12);
  ctx.quadraticCurveTo(cx, chinY + 20, cx - 22, chinY - 12);
  ctx.fill();

  // Torso, cropped by the frame; shoulders angled
  shape(ctx, torso, 6, (c) => {
    c.moveTo(cx - 128, H + 20);
    c.lineTo(cx - 120, shY + 30 - shoulderTilt);
    c.quadraticCurveTo(cx - 110, shY - 14 - shoulderTilt, cx - 46, shY - 22 - shoulderTilt);
    c.lineTo(cx + 46, shY - 22 + shoulderTilt);
    c.quadraticCurveTo(cx + 110, shY - 14 + shoulderTilt, cx + 120, shY + 30 + shoulderTilt);
    c.lineTo(cx + 128, H + 20);
  });
  // Soft fold hints at the shoulders
  ctx.globalAlpha = 0.22;
  line(ctx, 3, (c) => {
    c.moveTo(cx - 78, shY + 26 - shoulderTilt);
    c.lineTo(cx - 62, shY + 74);
  });
  line(ctx, 3, (c) => {
    c.moveTo(cx + 74, shY + 22 + shoulderTilt);
    c.lineTo(cx + 60, shY + 66);
  });
  ctx.globalAlpha = 1;
  if (sleeves) {
    for (const side of [-1, 1]) {
      const st = side * shoulderTilt;
      shape(ctx, sleeves, 5, (c) => {
        c.moveTo(cx + side * 118, shY + 34 + st);
        c.quadraticCurveTo(cx + side * 110, shY - 12 + st, cx + side * 54, shY - 22 + st);
        c.lineTo(cx + side * 72, shY + 62 + st);
        c.lineTo(cx + side * 118, shY + 76 + st);
        c.closePath();
      });
    }
  }
}

function animeHeadBase(ctx, m, skin) {
  const { cx, cy, hw } = m;
  // Ears
  for (const side of [-1, 1]) {
    shape(ctx, skin, 4.5, (c) =>
      c.ellipse(cx + side * (hw - 2), cy + 18, 10, 16, side * 0.15, 0, Math.PI * 2));
  }
  shape(ctx, skin, 6, headPath(m));

  // Hard cel shadow: angular polygon down the right side of the face
  ctx.save();
  ctx.beginPath();
  headPath(m)(ctx);
  ctx.clip();
  ctx.fillStyle = 'rgba(120, 76, 48, 0.2)';
  ctx.beginPath();
  ctx.moveTo(cx + hw * 0.34, cy - 88);
  ctx.lineTo(cx + hw + 6, cy - 60);
  ctx.lineTo(cx + hw + 6, cy + 90);
  ctx.lineTo(cx + 6, cy + 90);
  ctx.lineTo(cx + hw * 0.5, cy + 30);
  ctx.lineTo(cx + hw * 0.3, cy - 30);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Nose-bridge hint above where the mask sits
  line(ctx, 2.5, (c) => {
    c.moveTo(cx + 4, cy + 6);
    c.lineTo(cx + 9, cy + 16);
  });
}

// Almond anime eyes: heavy angled top lid, iris partly covered, crease line
function animeEyes(ctx, m, { iris = '#5a3a1a', mood = 'open', lashes = false } = {}) {
  const { cx, cy } = m;
  const ey = cy + 2;
  for (const side of [-1, 1]) {
    const ex = cx + side * 29;
    if (mood === 'happy') {
      line(ctx, 5, (c) => c.arc(ex, ey + 2, 12, Math.PI * 1.15, Math.PI * 1.85));
    } else {
      // Eye white between the lids
      shape(ctx, '#f8f3e6', 0, (c) => {
        c.moveTo(ex - 16, ey + 3);
        c.quadraticCurveTo(ex - 4, ey - 8, ex + 14, ey - 4);
        c.quadraticCurveTo(ex + 15, ey + 7, ex + 8, ey + 10);
        c.quadraticCurveTo(ex - 8, ey + 12, ex - 16, ey + 3);
        c.closePath();
      });
      // Iris (tall, clipped by the lids)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(ex - 16, ey + 3);
      ctx.quadraticCurveTo(ex - 4, ey - 8, ex + 14, ey - 4);
      ctx.quadraticCurveTo(ex + 15, ey + 7, ex + 8, ey + 10);
      ctx.quadraticCurveTo(ex - 8, ey + 12, ex - 16, ey + 3);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = iris;
      ctx.beginPath();
      ctx.ellipse(ex + 1, ey + 2, 8, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(ex + 1, ey + 3, 4, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath();
      ctx.arc(ex - 2, ey - 1, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Heavy top lid, angled up at the outer corner
      line(ctx, 5.5, (c) => {
        c.moveTo(ex - 17, ey + 4);
        c.quadraticCurveTo(ex - 4, ey - 9, ex + 15, ey - 5);
      });
      // Lower lid, light
      line(ctx, 2.2, (c) => {
        c.moveTo(ex - 12, ey + 9);
        c.quadraticCurveTo(ex, ey + 12, ex + 9, ey + 9);
      });
      // Crease
      ctx.globalAlpha = 0.5;
      line(ctx, 2.2, (c) => {
        c.moveTo(ex - 12, ey - 11);
        c.quadraticCurveTo(ex, ey - 15, ex + 12, ey - 11);
      });
      ctx.globalAlpha = 1;
      if (lashes) {
        line(ctx, 3, (c) => {
          c.moveTo(ex + side * 14, ey - 5);
          c.lineTo(ex + side * 21, ey - 10);
        });
      }
    }
    // Angular brow
    line(ctx, 6, (c) => {
      c.moveTo(ex - 17, ey - 20);
      c.lineTo(ex + 2, ey - 26);
      c.lineTo(ex + 16, ey - 19);
    });
  }
}

// Angular mask across the lower face, following the jaw to the chin
function animeMask(ctx, m, { color, pattern = null, crooked = 0, bandana = false } = {}) {
  const { cx, cy, hw } = m;
  const top = cy + 22;
  const chinY = cy + 86;

  ctx.save();
  if (crooked) {
    ctx.translate(cx, (top + chinY) / 2);
    ctx.rotate(crooked);
    ctx.translate(-cx, -(top + chinY) / 2);
  }
  shape(ctx, color, 5, (c) => {
    c.moveTo(cx - hw * 0.94, top + 4);
    c.quadraticCurveTo(cx, top + 16, cx + hw * 0.9, top);
    c.lineTo(cx + hw * 0.62, chinY - 16);
    c.quadraticCurveTo(cx + 16, chinY + 6, cx - 4, chinY + 6);
    c.quadraticCurveTo(cx - hw * 0.6, chinY - 6, cx - hw * 0.94, top + 4);
    c.closePath();
  });
  if (bandana) {
    shape(ctx, color, 5, (c) => {
      c.moveTo(cx - hw * 0.55, chinY - 10);
      c.lineTo(cx - 2, chinY + 44);
      c.lineTo(cx + hw * 0.55, chinY - 14);
    });
  }
  // Angular fold lines
  ctx.globalAlpha = 0.35;
  line(ctx, 2.5, (c) => {
    c.moveTo(cx - hw * 0.6, top + 20);
    c.lineTo(cx + 4, top + 28);
    c.lineTo(cx + hw * 0.55, top + 18);
  });
  line(ctx, 2.5, (c) => {
    c.moveTo(cx - hw * 0.45, top + 40);
    c.lineTo(cx + 2, top + 46);
  });
  ctx.globalAlpha = 1;
  if (pattern) pattern(ctx, cx, (top + chinY) / 2, hw);
  ctx.restore();

  // Straps
  for (const side of [-1, 1]) {
    line(ctx, 4, (c) => {
      c.moveTo(cx + side * hw * 0.88, top + 6);
      c.lineTo(cx + side * (hw + 10), cy + 12);
    });
  }
}

// Warm rim light along the left contour — the Hades pop
function rimLight(ctx, m) {
  const { cx, cy, hw } = m;
  stroke(ctx, 'rgba(255, 238, 200, 0.9)', 4, (c) => {
    c.moveTo(cx - hw + 2, cy - 8);
    c.quadraticCurveTo(cx - hw - 3, cy - 70, cx - 18, cy - 80);
  });
  stroke(ctx, 'rgba(255, 238, 200, 0.75)', 4, (c) => {
    c.moveTo(cx - hw + 3, cy + 40);
    c.quadraticCurveTo(cx - 30, cy + 118, cx - 44, cy + 150);
  });
}

function metrics() {
  return { cx: W / 2, cy: 180, hw: 58 };
}

// ---------------------------------------------------------------- people

function drawGirl(ctx) {
  backdrop(ctx, 'rgba(220, 60, 80, 0.5)');
  withLean(ctx, -0.05, () => {
    const m = metrics();

    const gingham = (() => {
      const p = document.createElement('canvas');
      p.width = p.height = 24;
      const px = p.getContext('2d');
      px.fillStyle = '#f6f1e7';
      px.fillRect(0, 0, 24, 24);
      px.fillStyle = 'rgba(204,34,34,0.55)';
      px.fillRect(0, 0, 12, 24);
      px.fillRect(0, 0, 24, 12);
      return ctx.createPattern(p, 'repeat');
    })();

    // Pigtails: sharp swept bunches behind the head
    for (const side of [-1, 1]) {
      shape(ctx, '#7a3d10', 5, (c) => {
        c.moveTo(m.cx + side * (m.hw - 6), m.cy - 20);
        c.quadraticCurveTo(m.cx + side * (m.hw + 58), m.cy - 6, m.cx + side * (m.hw + 46), m.cy + 88);
        c.lineTo(m.cx + side * (m.hw + 18), m.cy + 116);
        c.quadraticCurveTo(m.cx + side * (m.hw + 6), m.cy + 40, m.cx + side * (m.hw - 10), m.cy + 8);
        c.closePath();
      });
    }

    animeBody(ctx, m, { skin: '#fbd3a2', torso: gingham, shoulderTilt: 9 });
    animeHeadBase(ctx, m, '#fbd3a2');

    // Hair: swept bangs with pointed clumps
    shape(ctx, '#8b4513', 6, (c) => {
      c.moveTo(m.cx - m.hw - 4, m.cy + 8);
      c.quadraticCurveTo(m.cx - m.hw - 10, m.cy - 78, m.cx - 8, m.cy - 90);
      c.quadraticCurveTo(m.cx + m.hw + 2, m.cy - 96, m.cx + m.hw + 2, m.cy - 12);
      c.lineTo(m.cx + m.hw - 14, m.cy + 2);
      c.lineTo(m.cx + 34, m.cy - 44);
      c.lineTo(m.cx + 12, m.cy - 28);
      c.lineTo(m.cx - 8, m.cy - 52);
      c.lineTo(m.cx - 26, m.cy - 26);
      c.lineTo(m.cx - m.hw + 12, m.cy - 44);
      c.lineTo(m.cx - m.hw + 4, m.cy + 4);
      c.closePath();
    });
    // Bow, sharper
    shape(ctx, '#dc143c', 4, (c) => {
      c.moveTo(m.cx + 34, m.cy - 84);
      c.lineTo(m.cx + 10, m.cy - 70);
      c.lineTo(m.cx + 34, m.cy - 58);
      c.closePath();
    });
    shape(ctx, '#dc143c', 4, (c) => {
      c.moveTo(m.cx + 40, m.cy - 84);
      c.lineTo(m.cx + 64, m.cy - 74);
      c.lineTo(m.cx + 42, m.cy - 58);
      c.closePath();
    });
    shape(ctx, INK, 0, (c) => c.arc(m.cx + 37, m.cy - 71, 5, 0, Math.PI * 2));

    animeEyes(ctx, m, { iris: '#6a4020', lashes: true });
    animeMask(ctx, m, {
      color: '#dc143c',
      pattern: (c, x, y, r) => {
        c.fillStyle = '#fff';
        for (const [dx, dy] of [[-r * 0.45, -6], [0, -12], [r * 0.45, -8], [-r * 0.24, 14], [r * 0.24, 12], [-2, 32]]) {
          c.beginPath();
          c.arc(x + dx, y + dy, 4.5, 0, Math.PI * 2);
          c.fill();
        }
      }
    });
    rimLight(ctx, m);
  });
  finish(ctx);
}

function drawBoy(ctx) {
  backdrop(ctx, 'rgba(80, 130, 200, 0.5)');
  withLean(ctx, 0.06, () => {
    const m = metrics();
    const skin = '#b0714a'; // mixed race — warm brown skin
    animeBody(ctx, m, { skin, torso: '#4682b4', sleeves: '#5a9bd4', shoulderTilt: -10 });
    animeHeadBase(ctx, m, skin);

    // Spiky dark hair, JoJo energy
    shape(ctx, '#1c1815', 6, (c) => {
      c.moveTo(m.cx - m.hw - 6, m.cy + 6);
      c.lineTo(m.cx - m.hw - 18, m.cy - 40);
      c.lineTo(m.cx - m.hw + 10, m.cy - 52);
      c.lineTo(m.cx - 34, m.cy - 96);
      c.lineTo(m.cx - 10, m.cy - 66);
      c.lineTo(m.cx + 6, m.cy - 104);
      c.lineTo(m.cx + 24, m.cy - 64);
      c.lineTo(m.cx + 46, m.cy - 92);
      c.lineTo(m.cx + m.hw + 10, m.cy - 36);
      c.lineTo(m.cx + m.hw - 2, m.cy - 10);
      c.lineTo(m.cx + m.hw - 16, m.cy - 2);
      c.lineTo(m.cx + 30, m.cy - 40);
      c.lineTo(m.cx + 6, m.cy - 26);
      c.lineTo(m.cx - 18, m.cy - 48);
      c.lineTo(m.cx - 34, m.cy - 22);
      c.lineTo(m.cx - m.hw + 6, m.cy - 12);
      c.closePath();
    });

    animeEyes(ctx, m, { iris: '#3a2415' });
    animeMask(ctx, m, {
      color: '#7b68ee',
      pattern: (c, x, y, r) => {
        const cols = ['#ff1493', '#4169e1', '#e6d8ff', '#9370db'];
        for (let ring = 0; ring < 4; ring++) {
          c.strokeStyle = cols[ring];
          c.lineWidth = 6 - ring;
          c.beginPath();
          for (let a = 0; a <= Math.PI * 2; a += 0.32) {
            const rr = (24 - ring * 5.5) + Math.sin(a * 3 + ring) * 3;
            const px = x - 6 + Math.cos(a) * rr;
            const py = y + 2 + Math.sin(a) * rr * 0.62;
            if (a === 0) c.moveTo(px, py);
            else c.lineTo(px, py);
          }
          c.closePath();
          c.stroke();
        }
      }
    });
    rimLight(ctx, m);
  });
  finish(ctx);
}

function drawFisherman(ctx) {
  backdrop(ctx, 'rgba(70, 110, 110, 0.5)');
  withLean(ctx, -0.045, () => {
    const m = metrics();
    animeBody(ctx, m, { skin: '#eec294', torso: '#2f4f4f', sleeves: '#3d5f5f', shoulderTilt: 7 });
    animeHeadBase(ctx, m, '#eec294');

    // Gray temple tufts
    for (const side of [-1, 1]) {
      shape(ctx, '#9a9a96', 4, (c) => {
        c.moveTo(m.cx + side * (m.hw - 8), m.cy - 8);
        c.lineTo(m.cx + side * (m.hw + 8), m.cy + 10);
        c.lineTo(m.cx + side * (m.hw - 8), m.cy + 22);
        c.closePath();
      });
    }
    animeEyes(ctx, m, { iris: '#4a5a5a' });
    // Crow's feet
    for (const side of [-1, 1]) {
      ctx.globalAlpha = 0.6;
      line(ctx, 2.2, (c) => {
        c.moveTo(m.cx + side * 48, m.cy + 4);
        c.lineTo(m.cx + side * 58, m.cy - 2);
      });
      ctx.globalAlpha = 1;
    }
    animeMask(ctx, m, { color: '#8a8a86' });

    // Bucket hat, brim angled
    shape(ctx, '#7a4416', 6, (c) => {
      c.moveTo(m.cx - m.hw - 30, m.cy - 34);
      c.lineTo(m.cx + m.hw + 24, m.cy - 46);
      c.lineTo(m.cx + m.hw - 8, m.cy - 72);
      c.quadraticCurveTo(m.cx + 30, m.cy - 122, m.cx - 8, m.cy - 120);
      c.quadraticCurveTo(m.cx - 52, m.cy - 116, m.cx - m.hw + 2, m.cy - 62);
      c.closePath();
    });
    line(ctx, 3, (c) => {
      c.moveTo(m.cx - m.hw + 4, m.cy - 56);
      c.lineTo(m.cx + m.hw - 10, m.cy - 66);
    });

    // Rod over the shoulder
    line(ctx, 7, (c) => {
      c.moveTo(m.cx + 100, H - 20);
      c.lineTo(m.cx + 152, m.cy - 130);
    });
    line(ctx, 2.2, (c) => {
      c.moveTo(m.cx + 152, m.cy - 130);
      c.quadraticCurveTo(m.cx + 162, m.cy - 40, m.cx + 150, m.cy + 20);
    });
    shape(ctx, '#ff6347', 3, (c) => c.arc(m.cx + 150, m.cy + 28, 8, 0, Math.PI * 2));

    rimLight(ctx, m);
  });
  finish(ctx);
}

function drawHippie(ctx) {
  backdrop(ctx, 'rgba(150, 110, 220, 0.5)');
  withLean(ctx, 0.055, () => {
    const m = metrics();

    // Long straight hair with pointed ends, behind
    for (const side of [-1, 1]) {
      shape(ctx, '#82683e', 5, (c) => {
        c.moveTo(m.cx + side * (m.hw - 10), m.cy - 44);
        c.quadraticCurveTo(m.cx + side * (m.hw + 34), m.cy + 60, m.cx + side * (m.hw + 20), m.cy + 210);
        c.lineTo(m.cx + side * (m.hw - 4), m.cy + 186);
        c.lineTo(m.cx + side * (m.hw + 2), m.cy + 220);
        c.lineTo(m.cx + side * (m.hw - 26), m.cy + 190);
        c.quadraticCurveTo(m.cx + side * (m.hw - 16), m.cy + 60, m.cx + side * (m.hw - 22), m.cy - 20);
        c.closePath();
      });
    }

    animeBody(ctx, m, { skin: '#fbd3a2', torso: '#9370db', shoulderTilt: -8 });
    animeHeadBase(ctx, m, '#fbd3a2');

    // Center-parted top
    shape(ctx, '#82683e', 6, (c) => {
      c.moveTo(m.cx - m.hw - 6, m.cy - 4);
      c.quadraticCurveTo(m.cx - m.hw - 8, m.cy - 84, m.cx - 4, m.cy - 92);
      c.quadraticCurveTo(m.cx + m.hw + 4, m.cy - 88, m.cx + m.hw + 4, m.cy - 8);
      c.lineTo(m.cx + m.hw - 12, m.cy - 20);
      c.quadraticCurveTo(m.cx + 20, m.cy - 60, m.cx + 2, m.cy - 62);
      c.quadraticCurveTo(m.cx - 20, m.cy - 60, m.cx - m.hw + 10, m.cy - 22);
      c.closePath();
    });
    // Headband
    shape(ctx, '#ff6347', 5, (c) => {
      c.moveTo(m.cx - m.hw - 4, m.cy - 36);
      c.lineTo(m.cx + m.hw + 4, m.cy - 44);
      c.lineTo(m.cx + m.hw + 2, m.cy - 30);
      c.lineTo(m.cx - m.hw - 6, m.cy - 22);
      c.closePath();
    });

    animeEyes(ctx, m, { iris: '#5a4a2a', mood: 'calm' });
    // Round glasses
    for (const side of [-1, 1]) {
      line(ctx, 4, (c) => c.arc(m.cx + side * 29, m.cy + 2, 21, 0, Math.PI * 2));
    }
    line(ctx, 4, (c) => {
      c.moveTo(m.cx - 8, m.cy + 2);
      c.lineTo(m.cx + 8, m.cy + 2);
    });

    animeMask(ctx, m, {
      color: '#ff6347', bandana: true,
      pattern: (c, x, y, r) => {
        c.fillStyle = 'rgba(255, 230, 200, 0.8)';
        for (const [dx, dy] of [[-r * 0.35, -2], [0, 8], [r * 0.35, -4], [0, -14]]) {
          c.beginPath();
          c.arc(x + dx, y + dy, 3.2, 0, Math.PI * 2);
          c.fill();
        }
      }
    });

    // Peace pendant
    const shY = m.cy + 150;
    line(ctx, 4, (c) => c.arc(m.cx, shY + 8, 36, Math.PI * 0.12, Math.PI * 0.88));
    shape(ctx, '#e8c840', 4, (c) => c.arc(m.cx, shY + 46, 13, 0, Math.PI * 2));
    line(ctx, 2.5, (c) => {
      c.moveTo(m.cx, shY + 33);
      c.lineTo(m.cx, shY + 59);
      c.moveTo(m.cx, shY + 46);
      c.lineTo(m.cx - 9, shY + 55);
      c.moveTo(m.cx, shY + 46);
      c.lineTo(m.cx + 9, shY + 55);
    });
    rimLight(ctx, m);
  });
  finish(ctx);
}

function drawKid(ctx) {
  backdrop(ctx, 'rgba(255, 160, 40, 0.5)');
  withLean(ctx, -0.07, () => {
    const m = metrics();
    animeBody(ctx, m, { skin: '#fbd3a2', torso: '#ffa500', sleeves: '#ff8c00', shoulderTilt: 11 });
    animeHeadBase(ctx, m, '#fbd3a2');

    // Backwards cap with attitude
    shape(ctx, '#e87c00', 6, (c) => {
      c.moveTo(m.cx - m.hw - 6, m.cy - 26);
      c.quadraticCurveTo(m.cx - m.hw - 4, m.cy - 90, m.cx, m.cy - 96);
      c.quadraticCurveTo(m.cx + m.hw + 6, m.cy - 92, m.cx + m.hw + 4, m.cy - 30);
      c.quadraticCurveTo(m.cx, m.cy - 52, m.cx - m.hw - 6, m.cy - 26);
      c.closePath();
    });
    shape(ctx, '#e87c00', 5, (c) => {
      c.moveTo(m.cx - m.hw - 2, m.cy - 48);
      c.lineTo(m.cx - m.hw - 52, m.cy - 66);
      c.lineTo(m.cx - m.hw - 44, m.cy - 34);
      c.closePath();
    });
    line(ctx, 3, (c) => {
      c.moveTo(m.cx, m.cy - 96);
      c.lineTo(m.cx, m.cy - 56);
    });
    // Hair spikes poking out
    shape(ctx, '#5a3a14', 4, (c) => {
      c.moveTo(m.cx + 26, m.cy - 44);
      c.lineTo(m.cx + 48, m.cy - 58);
      c.lineTo(m.cx + 52, m.cy - 34);
      c.closePath();
    });

    animeEyes(ctx, m, { iris: '#5a3a1a' });
    ctx.fillStyle = 'rgba(200, 130, 90, 0.7)';
    for (const [dx, dy] of [[-44, 22], [-36, 28], [-48, 30], [44, 20], [36, 26], [48, 28]]) {
      ctx.beginPath();
      ctx.arc(m.cx + dx, m.cy + dy - 6, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    animeMask(ctx, m, { color: '#87ceeb', crooked: 0.07 });
    rimLight(ctx, m);
  });
  finish(ctx);
}

function drawParent(ctx) {
  backdrop(ctx, 'rgba(120, 160, 80, 0.5)');
  withLean(ctx, 0.05, () => {
    const m = metrics();

    // Shoulder-length hair behind
    for (const side of [-1, 1]) {
      shape(ctx, '#33200e', 5, (c) => {
        c.moveTo(m.cx + side * (m.hw - 12), m.cy - 40);
        c.quadraticCurveTo(m.cx + side * (m.hw + 30), m.cy + 40, m.cx + side * (m.hw + 16), m.cy + 150);
        c.lineTo(m.cx + side * (m.hw - 18), m.cy + 128);
        c.quadraticCurveTo(m.cx + side * (m.hw - 12), m.cy + 40, m.cx + side * (m.hw - 20), m.cy - 16);
        c.closePath();
      });
    }
    animeBody(ctx, m, { skin: '#fbd3a2', torso: '#6b8e23', sleeves: '#7ba02e', shoulderTilt: -7 });
    animeHeadBase(ctx, m, '#fbd3a2');

    shape(ctx, '#33200e', 6, (c) => {
      c.moveTo(m.cx - m.hw - 6, m.cy - 8);
      c.quadraticCurveTo(m.cx - m.hw - 6, m.cy - 84, m.cx - 2, m.cy - 90);
      c.quadraticCurveTo(m.cx + m.hw + 6, m.cy - 86, m.cx + m.hw + 6, m.cy - 12);
      c.lineTo(m.cx + m.hw - 10, m.cy - 24);
      c.quadraticCurveTo(m.cx + 24, m.cy - 56, m.cx - 12, m.cy - 58);
      c.quadraticCurveTo(m.cx - 44, m.cy - 52, m.cx - m.hw + 8, m.cy - 24);
      c.closePath();
    });
    // Sun hat: wide ellipse at an angle
    shape(ctx, '#4a4a4a', 6, (c) =>
      c.ellipse(m.cx + 2, m.cy - 78, m.hw + 54, 22, -0.08, 0, Math.PI * 2));
    shape(ctx, '#5a5a5a', 5, (c) => {
      c.moveTo(m.cx - 46, m.cy - 80);
      c.quadraticCurveTo(m.cx, m.cy - 132, m.cx + 46, m.cy - 86);
      c.quadraticCurveTo(m.cx, m.cy - 62, m.cx - 46, m.cy - 80);
    });

    animeEyes(ctx, m, { iris: '#4a3018', lashes: true, mood: 'calm' });
    animeMask(ctx, m, { color: '#f5f0e6' });

    // Coffee raised near the shoulder
    shape(ctx, '#f5f0e6', 5, (c) => {
      c.moveTo(m.cx + 96, m.cy + 190);
      c.lineTo(m.cx + 140, m.cy + 190);
      c.lineTo(m.cx + 134, m.cy + 250);
      c.lineTo(m.cx + 102, m.cy + 250);
      c.closePath();
    });
    shape(ctx, '#8b4513', 4, (c) => {
      c.moveTo(m.cx + 92, m.cy + 190);
      c.lineTo(m.cx + 144, m.cy + 190);
      c.lineTo(m.cx + 142, m.cy + 178);
      c.lineTo(m.cx + 94, m.cy + 178);
      c.closePath();
    });
    rimLight(ctx, m);
  });
  finish(ctx);
}

// ---------------------------------------------------------------- animals

function drawDog(ctx) {
  backdrop(ctx, 'rgba(218, 165, 32, 0.55)');
  withLean(ctx, -0.06, () => {
    const cx = W / 2;
    const cy = 210; // head center

    // Short neck first, then chest over its base
    shape(ctx, '#daa520', 5, (c) => {
      c.moveTo(cx - 34, cy + 68);
      c.quadraticCurveTo(cx - 40, cy + 104, cx - 56, cy + 138);
      c.lineTo(cx + 56, cy + 132);
      c.quadraticCurveTo(cx + 40, cy + 100, cx + 34, cy + 68);
      c.closePath();
    });
    shape(ctx, '#c8941c', 6, (c) => {
      c.moveTo(cx - 124, H + 20);
      c.quadraticCurveTo(cx - 112, cy + 190, cx - 66, cy + 136);
      c.lineTo(cx + 66, cy + 130);
      c.quadraticCurveTo(cx + 112, cy + 180, cx + 124, H + 20);
    });
    shape(ctx, '#f0e68c', 5, (c) => c.ellipse(cx, H - 20, 56, 104, 0, Math.PI, Math.PI * 2));

    // Collar at the base of the neck
    shape(ctx, '#dc143c', 5, (c) => {
      c.moveTo(cx - 48, cy + 108);
      c.quadraticCurveTo(cx, cy + 134, cx + 48, cy + 106);
      c.lineTo(cx + 44, cy + 128);
      c.quadraticCurveTo(cx, cy + 154, cx - 44, cy + 130);
      c.closePath();
    });
    shape(ctx, '#ffd700', 4, (c) => c.arc(cx, cy + 152, 12, 0, Math.PI * 2));

    // Ears: one flopped forward, one back — asymmetry
    shape(ctx, '#a8791a', 5, (c) => {
      c.moveTo(cx - 48, cy - 66);
      c.quadraticCurveTo(cx - 110, cy - 54, cx - 96, cy + 32);
      c.quadraticCurveTo(cx - 84, cy + 52, cx - 62, cy + 22);
      c.closePath();
    });
    shape(ctx, '#a8791a', 5, (c) => {
      c.moveTo(cx + 46, cy - 70);
      c.quadraticCurveTo(cx + 116, cy - 66, cx + 94, cy + 14);
      c.quadraticCurveTo(cx + 80, cy + 40, cx + 60, cy + 8);
      c.closePath();
    });

    // Head: angular skull with a defined brow and muzzle
    shape(ctx, '#daa520', 6, (c) => {
      c.moveTo(cx - 62, cy - 30);
      c.quadraticCurveTo(cx - 58, cy - 82, cx, cy - 84);
      c.quadraticCurveTo(cx + 58, cy - 82, cx + 62, cy - 30);
      c.quadraticCurveTo(cx + 64, cy + 22, cx + 34, cy + 60);
      c.quadraticCurveTo(cx + 16, cy + 76, cx - 16, cy + 76);
      c.quadraticCurveTo(cx - 46, cy + 60, cx - 62, cy - 30);
      c.closePath();
    });
    // Brow ridge
    line(ctx, 3.5, (c) => {
      c.moveTo(cx - 40, cy - 36);
      c.lineTo(cx - 12, cy - 42);
      c.moveTo(cx + 12, cy - 42);
      c.lineTo(cx + 40, cy - 36);
    });
    // Muzzle
    shape(ctx, '#f0e68c', 5, (c) => {
      c.moveTo(cx - 34, cy + 14);
      c.quadraticCurveTo(cx, cy + 2, cx + 34, cy + 14);
      c.quadraticCurveTo(cx + 30, cy + 66, cx, cy + 72);
      c.quadraticCurveTo(cx - 30, cy + 66, cx - 34, cy + 14);
      c.closePath();
    });
    shape(ctx, INK, 0, (c) => {
      c.moveTo(cx - 12, cy + 22);
      c.quadraticCurveTo(cx, cy + 14, cx + 12, cy + 22);
      c.quadraticCurveTo(cx, cy + 36, cx - 12, cy + 22);
    });
    // Tongue
    shape(ctx, '#ff8da1', 4, (c) => {
      c.moveTo(cx - 10, cy + 58);
      c.quadraticCurveTo(cx - 10, cy + 92, cx + 2, cy + 92);
      c.quadraticCurveTo(cx + 14, cy + 92, cx + 12, cy + 58);
      c.closePath();
    });

    // Keen anime eyes
    for (const side of [-1, 1]) {
      const ex = cx + side * 30;
      const ey = cy - 18;
      shape(ctx, '#f8f3e6', 0, (c) => {
        c.moveTo(ex - 13, ey + 3);
        c.quadraticCurveTo(ex, ey - 7, ex + 12, ey - 2);
        c.quadraticCurveTo(ex + 11, ey + 8, ex - 2, ey + 9);
        c.closePath();
      });
      ctx.fillStyle = '#4a3018';
      ctx.beginPath();
      ctx.ellipse(ex, ey + 1, 6.5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(ex - 2, ey - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      line(ctx, 4.5, (c) => {
        c.moveTo(ex - 14, ey + 4);
        c.quadraticCurveTo(ex, ey - 8, ex + 13, ey - 3);
      });
    }
    // Rim light
    stroke(ctx, 'rgba(255, 238, 200, 0.85)', 4, (c) => {
      c.moveTo(cx - 60, cy - 34);
      c.quadraticCurveTo(cx - 56, cy - 80, cx - 4, cy - 83);
    });
  });
  finish(ctx);
}

function drawSquirrel(ctx) {
  backdrop(ctx, 'rgba(160, 82, 45, 0.55)');
  withLean(ctx, 0.06, () => {
    const cx = W / 2;
    const cy = 220;

    // Sweeping tail behind — one big S flourish
    shape(ctx, '#7a5a10', 6, (c) => {
      c.moveTo(cx + 66, H);
      c.quadraticCurveTo(cx + 190, cy + 140, cx + 130, cy - 60);
      c.quadraticCurveTo(cx + 100, cy - 170, cx - 10, cy - 148);
      c.quadraticCurveTo(cx + 82, cy - 140, cx + 92, cy - 40);
      c.quadraticCurveTo(cx + 108, cy + 120, cx + 26, H);
      c.closePath();
    });

    // Short neck first, then chest/shoulders over its base
    shape(ctx, '#a0522d', 5, (c) => {
      c.moveTo(cx - 26, cy + 60);
      c.quadraticCurveTo(cx - 30, cy + 96, cx - 44, cy + 128);
      c.lineTo(cx + 44, cy + 124);
      c.quadraticCurveTo(cx + 30, cy + 94, cx + 26, cy + 60);
      c.closePath();
    });
    shape(ctx, '#96491f', 6, (c) => {
      c.moveTo(cx - 110, H + 20);
      c.quadraticCurveTo(cx - 102, cy + 180, cx - 56, cy + 126);
      c.lineTo(cx + 56, cy + 122);
      c.quadraticCurveTo(cx + 102, cy + 170, cx + 110, H + 20);
    });
    shape(ctx, '#d2a679', 5, (c) => c.ellipse(cx, H - 16, 50, 96, 0, Math.PI, Math.PI * 2));

    // Ears, sharp
    for (const side of [-1, 1]) {
      shape(ctx, '#a0522d', 5, (c) => {
        c.moveTo(cx + side * 22, cy - 66);
        c.lineTo(cx + side * 52, cy - 122);
        c.lineTo(cx + side * 54, cy - 58);
        c.closePath();
      });
    }
    // Head with cheeks, slightly angular
    shape(ctx, '#a0522d', 6, (c) => {
      c.moveTo(cx - 54, cy - 40);
      c.quadraticCurveTo(cx - 48, cy - 78, cx, cy - 80);
      c.quadraticCurveTo(cx + 48, cy - 78, cx + 54, cy - 40);
      c.quadraticCurveTo(cx + 64, cy + 18, cx + 24, cy + 46);
      c.lineTo(cx - 24, cy + 46);
      c.quadraticCurveTo(cx - 64, cy + 18, cx - 54, cy - 40);
      c.closePath();
    });
    shape(ctx, '#d2a679', 5, (c) => c.ellipse(cx, cy + 16, 30, 24, 0, 0, Math.PI * 2));
    shape(ctx, INK, 0, (c) => c.ellipse(cx, cy + 2, 8, 6, 0, 0, Math.PI * 2));
    shape(ctx, '#f8f3e6', 3, (c) => {
      c.rect(cx - 7, cy + 18, 7, 12);
      c.rect(cx, cy + 18, 7, 12);
    });

    // Sharp little eyes
    for (const side of [-1, 1]) {
      const ex = cx + side * 27;
      const ey = cy - 32;
      shape(ctx, '#f8f3e6', 0, (c) => {
        c.moveTo(ex - 11, ey + 3);
        c.quadraticCurveTo(ex, ey - 6, ex + 10, ey - 1);
        c.quadraticCurveTo(ex + 9, ey + 7, ex - 2, ey + 8);
        c.closePath();
      });
      ctx.fillStyle = '#2a1a08';
      ctx.beginPath();
      ctx.ellipse(ex, ey + 1, 5.5, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(ex - 2, ey - 1, 1.8, 0, Math.PI * 2);
      ctx.fill();
      line(ctx, 4, (c) => {
        c.moveTo(ex - 12, ey + 4);
        c.quadraticCurveTo(ex, ey - 7, ex + 11, ey - 2);
      });
    }

    // Acorn held up by little paws
    shape(ctx, '#c8a038', 5, (c) => c.ellipse(cx - 10, cy + 150, 22, 28, 0.1, 0, Math.PI * 2));
    shape(ctx, '#654321', 4, (c) => {
      c.moveTo(cx - 34, cy + 132);
      c.quadraticCurveTo(cx - 10, cy + 114, cx + 14, cy + 132);
      c.quadraticCurveTo(cx - 10, cy + 142, cx - 34, cy + 132);
    });
    for (const side of [-1, 1]) {
      shape(ctx, '#96491f', 4, (c) =>
        c.ellipse(cx - 10 + side * 26, cy + 156, 11, 14, side * 0.5, 0, Math.PI * 2));
    }
    stroke(ctx, 'rgba(255, 238, 200, 0.85)', 4, (c) => {
      c.moveTo(cx - 52, cy - 44);
      c.quadraticCurveTo(cx - 46, cy - 76, cx - 2, cy - 79);
    });
  });
  finish(ctx);
}

function drawBird(ctx) {
  backdrop(ctx, 'rgba(255, 99, 71, 0.5)');
  withLean(ctx, -0.05, () => {
    const cx = W / 2;
    const cy = 250;

    // Tail feathers, sharp
    shape(ctx, '#54360e', 5, (c) => {
      c.moveTo(cx + 44, cy + 116);
      c.lineTo(cx + 158, cy + 176);
      c.lineTo(cx + 150, cy + 204);
      c.lineTo(cx + 128, cy + 190);
      c.lineTo(cx + 134, cy + 218);
      c.lineTo(cx + 30, cy + 156);
      c.closePath();
    });
    // Body
    shape(ctx, '#8b4513', 6, (c) => c.ellipse(cx, cy + 58, 104, 126, -0.08, 0, Math.PI * 2));
    shape(ctx, '#ff6347', 5, (c) => c.ellipse(cx - 12, cy + 90, 72, 88, -0.06, 0, Math.PI * 2));
    // Wing, pointed
    shape(ctx, '#54360e', 5, (c) => {
      c.moveTo(cx + 54, cy + 4);
      c.quadraticCurveTo(cx + 132, cy + 54, cx + 104, cy + 150);
      c.lineTo(cx + 84, cy + 118);
      c.lineTo(cx + 88, cy + 154);
      c.lineTo(cx + 62, cy + 104);
      c.closePath();
    });
    // Head, tilted forward with intent
    shape(ctx, '#8b4513', 6, (c) => c.ellipse(cx - 32, cy - 62, 70, 64, 0.1, 0, Math.PI * 2));
    // Beak, sharp
    shape(ctx, '#e88c00', 5, (c) => {
      c.moveTo(cx - 96, cy - 74);
      c.lineTo(cx - 158, cy - 50);
      c.lineTo(cx - 94, cy - 40);
      c.closePath();
    });
    line(ctx, 3, (c) => {
      c.moveTo(cx - 96, cy - 58);
      c.lineTo(cx - 148, cy - 51);
    });
    // Keen eye (one visible, profile-ish)
    const ex = cx - 44;
    const ey = cy - 76;
    shape(ctx, '#f8f3e6', 0, (c) => {
      c.moveTo(ex - 12, ey + 3);
      c.quadraticCurveTo(ex, ey - 7, ex + 12, ey - 2);
      c.quadraticCurveTo(ex + 10, ey + 8, ex - 2, ey + 9);
      c.closePath();
    });
    ctx.fillStyle = '#2a1a08';
    ctx.beginPath();
    ctx.ellipse(ex, ey + 1, 6, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(ex - 2, ey - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    line(ctx, 4.5, (c) => {
      c.moveTo(ex - 13, ey + 4);
      c.quadraticCurveTo(ex, ey - 8, ex + 13, ey - 3);
    });
    line(ctx, 3.5, (c) => {
      c.moveTo(ex - 14, ey - 10);
      c.lineTo(ex + 10, ey - 14);
    });
    stroke(ctx, 'rgba(255, 238, 200, 0.85)', 4, (c) => {
      c.arc(cx - 44, cy - 68, 58, Math.PI * 0.9, Math.PI * 1.35);
    });
  });
  finish(ctx);
}

function drawCoffee(ctx) {
  backdrop(ctx, 'rgba(139, 69, 19, 0.55)');
  const cx = W / 2;

  // Window frame + dark interior
  shape(ctx, '#6b3410', 7, (c) => c.rect(26, 54, W - 52, H - 130));
  shape(ctx, '#241408', 0, (c) => c.rect(40, 68, W - 80, H - 158));
  shape(ctx, '#d8c8a8', 6, (c) => c.rect(26, H - 88, W - 52, 32));

  withLean(ctx, 0.04, () => {
    const m = { cx, cy: 208, hw: 56 };
    // Shoulders + apron
    shape(ctx, '#5a3a22', 6, (c) => {
      c.moveTo(cx - 108, H - 88);
      c.quadraticCurveTo(cx - 100, m.cy + 168, cx - 46, m.cy + 152);
      c.lineTo(cx + 46, m.cy + 148);
      c.quadraticCurveTo(cx + 100, m.cy + 162, cx + 108, H - 88);
    });
    shape(ctx, '#cfc5ae', 5, (c) => {
      c.moveTo(cx - 52, m.cy + 168);
      c.lineTo(cx + 52, m.cy + 164);
      c.lineTo(cx + 44, H - 88);
      c.lineTo(cx - 44, H - 88);
      c.closePath();
    });
    // Neck
    shape(ctx, '#c9a175', 5, (c) => {
      c.moveTo(cx - 22, m.cy + 70);
      c.quadraticCurveTo(cx - 24, m.cy + 110, cx - 38, m.cy + 152);
      c.lineTo(cx + 38, m.cy + 148);
      c.quadraticCurveTo(cx + 24, m.cy + 108, cx + 22, m.cy + 70);
      c.closePath();
    });
    animeHeadBase(ctx, m, '#c9a175');
    animeEyes(ctx, m, { iris: '#3a2a1a' });
    animeMask(ctx, m, { color: '#2c2c2c' });
    // Brim shadow falling across the upper face
    ctx.save();
    ctx.beginPath();
    headPath(m)(ctx);
    ctx.clip();
    ctx.fillStyle = 'rgba(20, 14, 10, 0.38)';
    ctx.beginPath();
    ctx.moveTo(cx - m.hw - 4, m.cy - 30);
    ctx.quadraticCurveTo(cx, m.cy - 2, cx + m.hw + 4, m.cy - 32);
    ctx.lineTo(cx + m.hw + 4, m.cy - 90);
    ctx.lineTo(cx - m.hw - 4, m.cy - 90);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // Cap pulled low — the brim cuts across the top of his eyes
    shape(ctx, '#2c2c2c', 6, (c) => {
      c.moveTo(cx - m.hw - 6, m.cy - 16);
      c.quadraticCurveTo(cx - m.hw - 2, m.cy - 84, cx, m.cy - 88);
      c.quadraticCurveTo(cx + m.hw + 2, m.cy - 84, cx + m.hw + 6, m.cy - 20);
      c.quadraticCurveTo(cx, m.cy - 44, cx - m.hw - 6, m.cy - 16);
      c.closePath();
    });
    shape(ctx, '#232323', 5, (c) => {
      c.moveTo(cx - 62, m.cy - 24);
      c.quadraticCurveTo(cx, m.cy + 6, cx + 62, m.cy - 26);
      c.quadraticCurveTo(cx, m.cy - 12, cx - 62, m.cy - 24);
    });
    rimLight(ctx, m);
  });

  // Cup + steam on the counter
  shape(ctx, '#f5f0e6', 5, (c) => {
    c.moveTo(cx + 72, H - 88);
    c.lineTo(cx + 112, H - 88);
    c.lineTo(cx + 106, H - 130);
    c.lineTo(cx + 78, H - 130);
    c.closePath();
  });
  ctx.globalAlpha = 0.5;
  line(ctx, 3, (c) => {
    c.moveTo(cx + 92, H - 138);
    c.quadraticCurveTo(cx + 82, H - 158, cx + 94, H - 176);
    c.quadraticCurveTo(cx + 104, H - 190, cx + 96, H - 204);
  });
  ctx.globalAlpha = 1;
  finish(ctx);
}

function drawLadybug(ctx) {
  backdrop(ctx, 'rgba(221, 34, 34, 0.5)');
  withLean(ctx, -0.04, () => {
    const cx = W / 2;
    const cy = 285;

    shape(ctx, '#4d9a3c', 5, (c) => {
      c.moveTo(cx - 132, cy + 128);
      c.quadraticCurveTo(cx, cy + 58, cx + 132, cy + 122);
      c.quadraticCurveTo(cx, cy + 196, cx - 132, cy + 128);
    });
    line(ctx, 3, (c) => {
      c.moveTo(cx - 112, cy + 126);
      c.quadraticCurveTo(cx, cy + 114, cx + 112, cy + 124);
    });

    shape(ctx, '#c11', 6, (c) => c.ellipse(cx, cy - 4, 104, 92, -0.06, 0, Math.PI * 2));
    line(ctx, 5, (c) => {
      c.moveTo(cx + 6, cy - 96);
      c.lineTo(cx - 6, cy + 88);
    });
    ctx.fillStyle = INK;
    for (const [dx, dy, r] of [[-52, -32, 14], [50, -36, 14], [-40, 32, 11], [40, 28, 11], [-72, 2, 8], [72, -6, 8]]) {
      ctx.beginPath();
      ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Head with keen little eyes
    shape(ctx, '#1a1a1a', 5, (c) => c.ellipse(cx, cy - 98, 44, 32, 0, Math.PI, Math.PI * 2));
    for (const side of [-1, 1]) {
      shape(ctx, '#f8f3e6', 2.5, (c) => c.arc(cx + side * 19, cy - 110, 8, 0, Math.PI * 2));
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(cx + side * 20, cy - 109, 3.6, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const side of [-1, 1]) {
      line(ctx, 3.5, (c) => {
        c.moveTo(cx + side * 15, cy - 126);
        c.quadraticCurveTo(cx + side * 34, cy - 158, cx + side * 55, cy - 165);
      });
      shape(ctx, '#1a1a1a', 0, (c) => c.arc(cx + side * 57, cy - 166, 5, 0, Math.PI * 2));
    }
    stroke(ctx, 'rgba(255, 238, 200, 0.8)', 4, (c) => {
      c.arc(cx - 8, cy - 4, 96, Math.PI * 0.85, Math.PI * 1.25);
    });
  });
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
