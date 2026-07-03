// Dialog portraits, Hades-style: tall full-character illustrations that
// rise out of the dialog box. The speaker's actual 3D model is rendered
// offscreen, then post-processed into a sketch — posterized flat color
// with ink edge lines (Sobel) and light hatching on warm paper — so the
// portraits read as drawn character art, not a 3D screenshot. Everything
// stays procedural.

import * as THREE from 'three';
import { buildGirl, buildBoy, buildLadybug, NPC_BUILDERS } from './characters.js';

const W = 340, H = 520;

let renderer = null;   // offscreen WebGL
let outCtx = null;     // visible 2D canvas in the dialog box
let workCanvas = null; // intermediate 2D for pixel work
let workCtx = null;
let scene = null;
let camera = null;
let currentModel = null;
const cache = {};

// Full-character framing per speaker: [lookAt], [camera position]
const FRAMING = {
  girl: { look: [0, 0.66, 0], cam: [0.5, 0.72, 1.9] },
  boy: { look: [0, 0.66, 0], cam: [-0.5, 0.72, 1.9] },
  fisherman: { look: [0.1, 0.7, 0.1], cam: [0.55, 0.75, 2.05] },
  hippie: { look: [0, 0.66, 0.1], cam: [0.5, 0.72, 1.95] },
  kid: { look: [0, 0.44, 0], cam: [0.32, 0.5, 1.3] },
  parent: { look: [0, 0.68, 0.05], cam: [0.5, 0.75, 1.95] },
  dog: { look: [0, 0.38, 0.05], cam: [0.5, 0.55, 1.35] },
  squirrel: { look: [0, 0.26, 0], cam: [0.3, 0.38, 0.85] },
  bird: { look: [0, 0.02, 0], cam: [0.25, 0.14, 0.6] },
  coffeeCart: { look: [0.08, 1.0, 0], cam: [0.5, 1.15, 1.8] },
  ladybug: { look: [0, 0.04, 0], cam: [0.2, 0.3, 0.55] }
};

const BUILDERS = { girl: buildGirl, boy: buildBoy, ladybug: buildLadybug, ...NPC_BUILDERS };

// Flat toon materials + inverted-hull ink outlines
function stylize(model) {
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x2a2018, side: THREE.BackSide });
  const meshes = [];
  model.traverse((obj) => { if (obj.isMesh) meshes.push(obj); });
  for (const mesh of meshes) {
    const convert = (m) => {
      if (!m || !m.isMeshLambertMaterial) return m;
      return new THREE.MeshToonMaterial({
        color: m.color, map: m.map ?? null, side: m.side,
        transparent: m.transparent, opacity: m.opacity
      });
    };
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(convert) : convert(mesh.material);
    const outline = new THREE.Mesh(mesh.geometry, outlineMat);
    outline.scale.setScalar(1.05);
    mesh.add(outline);
  }
  return model;
}

function getModel(speaker) {
  if (!cache[speaker]) {
    const build = BUILDERS[speaker] ?? buildGirl;
    cache[speaker] = stylize(build());
  }
  return cache[speaker];
}

export function initPortraits(canvas) {
  canvas.width = W;
  canvas.height = H;
  outCtx = canvas.getContext('2d');

  workCanvas = document.createElement('canvas');
  workCanvas.width = W;
  workCanvas.height = H;
  workCtx = workCanvas.getContext('2d', { willReadFrequently: true });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W, H);
  renderer.setClearColor(0xf0e6cf); // warm paper

  scene = new THREE.Scene();
  // Hard key + cool fill: strong shapes for the sketch pass
  const key = new THREE.DirectionalLight(0xfff4e0, 2.8);
  key.position.set(1.8, 2.5, 2);
  const fill = new THREE.DirectionalLight(0xbcd8ff, 0.8);
  fill.position.set(-2, 1, 1);
  scene.add(key, fill, new THREE.AmbientLight(0xffffff, 0.5));

  camera = new THREE.PerspectiveCamera(34, W / H, 0.05, 20);
}

// Posterize colors and draw Sobel edges as ink strokes
function sketchify() {
  const img = workCtx.getImageData(0, 0, W, H);
  const d = img.data;
  const lum = new Float32Array(W * H);

  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    lum[p] = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    // Posterize to ~6 levels per channel
    d[i] = ((d[i] / 43) | 0) * 43 + 21;
    d[i + 1] = ((d[i + 1] / 43) | 0) * 43 + 21;
    d[i + 2] = ((d[i + 2] / 43) | 0) * 43 + 21;
  }

  // Sobel edge detection on luminance -> ink lines
  const INK = [46, 34, 26];
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const p = y * W + x;
      const gx = -lum[p - W - 1] - 2 * lum[p - 1] - lum[p + W - 1]
               + lum[p - W + 1] + 2 * lum[p + 1] + lum[p + W + 1];
      const gy = -lum[p - W - 1] - 2 * lum[p - W] - lum[p - W + 1]
               + lum[p + W - 1] + 2 * lum[p + W] + lum[p + W + 1];
      if (gx * gx + gy * gy > 5200) {
        const q = p * 4;
        d[q] = INK[0]; d[q + 1] = INK[1]; d[q + 2] = INK[2];
      }
    }
  }
  workCtx.putImageData(img, 0, 0);

  // Compose onto the output with hatching + vignette for the drawn feel
  outCtx.clearRect(0, 0, W, H);
  outCtx.drawImage(workCanvas, 0, 0);

  outCtx.save();
  outCtx.strokeStyle = 'rgba(70, 52, 38, 0.07)';
  outCtx.lineWidth = 2;
  for (let i = -H; i < W; i += 11) {
    outCtx.beginPath();
    outCtx.moveTo(i, 0);
    outCtx.lineTo(i + H, H);
    outCtx.stroke();
  }
  const vig = outCtx.createRadialGradient(W / 2, H * 0.42, H * 0.3, W / 2, H * 0.5, H * 0.72);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(58, 42, 28, 0.32)');
  outCtx.fillStyle = vig;
  outCtx.fillRect(0, 0, W, H);
  outCtx.restore();
}

export function renderPortrait(speaker) {
  if (!renderer) return;
  const key = FRAMING[speaker] ? speaker : 'girl';
  const model = getModel(key);
  if (currentModel && currentModel !== model) scene.remove(currentModel);
  scene.add(model);
  currentModel = model;

  // Dramatic three-quarter pose toward the reader
  model.rotation.y = key === 'boy' ? -0.55 : 0.55;

  const f = FRAMING[key];
  camera.position.set(...f.cam);
  camera.lookAt(...f.look);
  renderer.render(scene, camera);

  workCtx.drawImage(renderer.domElement, 0, 0, W, H);
  sketchify();
}
