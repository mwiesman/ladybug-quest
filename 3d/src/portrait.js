// Dialog portraits, Hades-style: the speaking character's actual 3D model,
// re-rendered with toon shading and ink outlines onto the dialog box's
// portrait canvas — an illustrated bust that pulls you into the dialog,
// rather than an emoji or a sprite. Everything stays procedural.

import * as THREE from 'three';
import { buildGirl, buildBoy, buildLadybug, NPC_BUILDERS } from './characters.js';

let renderer = null;
let scene = null;
let camera = null;
let currentModel = null;
const cache = {};

// Per-character bust framing: [lookAt], [camera position]
const FRAMING = {
  girl: { look: [0, 1.02, 0], cam: [0.32, 1.12, 0.95] },
  boy: { look: [0, 1.02, 0], cam: [-0.32, 1.12, 0.95] },
  fisherman: { look: [0.05, 1.02, 0], cam: [0.38, 1.15, 1.05] },
  hippie: { look: [0, 1.0, 0.1], cam: [0.3, 1.1, 1.0] },
  kid: { look: [0, 0.62, 0], cam: [0.2, 0.72, 0.68] },
  parent: { look: [0, 1.02, 0.05], cam: [0.32, 1.15, 1.0] },
  dog: { look: [0, 0.52, 0.18], cam: [0.42, 0.72, 0.95] },
  squirrel: { look: [0, 0.28, 0.02], cam: [0.22, 0.42, 0.58] },
  bird: { look: [0, 0.04, 0.02], cam: [0.2, 0.16, 0.42] },
  coffeeCart: { look: [0.08, 1.0, 0], cam: [0.45, 1.15, 1.5] },
  ladybug: { look: [0, 0.05, 0], cam: [0.16, 0.3, 0.42] }
};

const BUILDERS = { girl: buildGirl, boy: buildBoy, ladybug: buildLadybug, ...NPC_BUILDERS };

// Replace lambert materials with flat toon shading and add ink outlines
// (inverted-hull: a slightly scaled back-face copy of each mesh)
function stylize(model) {
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x2a2018, side: THREE.BackSide });
  const toReplace = [];
  model.traverse((obj) => {
    if (obj.isMesh) toReplace.push(obj);
  });
  for (const mesh of toReplace) {
    const convert = (m) => {
      if (!m || !m.isMeshLambertMaterial) return m;
      return new THREE.MeshToonMaterial({
        color: m.color, map: m.map ?? null, side: m.side, transparent: m.transparent, opacity: m.opacity
      });
    };
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(convert)
      : convert(mesh.material);

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
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.width, canvas.height, false);
  renderer.setClearColor(0xf0e6cf); // warm paper backdrop

  scene = new THREE.Scene();
  // Strong key light + cool fill reads as illustration lighting
  const key = new THREE.DirectionalLight(0xfff4e0, 2.6);
  key.position.set(1.5, 2.5, 2);
  const fill = new THREE.DirectionalLight(0xbcd8ff, 0.9);
  fill.position.set(-2, 1, 1);
  scene.add(key, fill, new THREE.AmbientLight(0xffffff, 0.55));

  camera = new THREE.PerspectiveCamera(38, canvas.width / canvas.height, 0.05, 20);
}

export function renderPortrait(speaker) {
  if (!renderer) return;
  const model = getModel(FRAMING[speaker] ? speaker : 'girl');
  if (currentModel && currentModel !== model) scene.remove(currentModel);
  scene.add(model);
  currentModel = model;

  // Three-quarter pose toward the reader
  model.rotation.y = speaker === 'boy' ? -0.5 : 0.5;

  const f = FRAMING[speaker] ?? FRAMING.girl;
  camera.position.set(...f.cam);
  camera.lookAt(...f.look);
  renderer.render(scene, camera);
}
