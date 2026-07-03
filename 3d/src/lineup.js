// Cast viewer — a turntable lineup of every character model, for art
// iteration. Serve at /3d/lineup.html. Not part of the game.

import * as THREE from 'three';
import { buildGirl, buildBoy, buildLadybug, NPC_BUILDERS } from './characters.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fd4f0);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);

const sun = new THREE.DirectionalLight(0xfff2dd, 2.2);
sun.position.set(6, 10, 8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -12;
sun.shadow.camera.right = 12;
sun.shadow.camera.top = 12;
sun.shadow.camera.bottom = -12;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xbde4ff, 0x4a7a3a, 1.1));

const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, 10),
  new THREE.MeshLambertMaterial({ color: 0x5faa4f }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

function nameLabel(text) {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath();
  ctx.roundRect(48, 8, 160, 48, 12);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '26px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 33);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true }));
  sprite.scale.set(1.6, 0.4, 1);
  return sprite;
}

const cast = [
  ['Girl', buildGirl()],
  ['Boy', buildBoy()],
  ['Fisherman', NPC_BUILDERS.fisherman()],
  ['Hippie', NPC_BUILDERS.hippie()],
  ['Kid', NPC_BUILDERS.kid()],
  ['Parent', NPC_BUILDERS.parent()],
  ['Dog', NPC_BUILDERS.dog()],
  ['Squirrel', NPC_BUILDERS.squirrel()],
  ['Bird', NPC_BUILDERS.bird()],
  ['Coffee Cart', NPC_BUILDERS.coffeeCart()],
  ['Ladybug', buildLadybug()]
];

const spacing = 1.7;
const turntables = [];
for (let i = 0; i < cast.length; i++) {
  const [name, mesh] = cast[i];
  const x = (i - (cast.length - 1) / 2) * spacing;
  const pivot = new THREE.Group();
  pivot.position.set(x, 0, 0);
  if (name === 'Bird') mesh.position.y = 0.9;
  pivot.add(mesh);
  scene.add(pivot);
  turntables.push(pivot);
  const label = nameLabel(name);
  label.position.set(x, name === 'Coffee Cart' ? 2.9 : 1.9, 0);
  scene.add(label);
}

camera.position.set(0, 2.6, 9.8);
camera.lookAt(0, 0.9, 0);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
function loop() {
  requestAnimationFrame(loop);
  const t = clock.getElapsedTime();
  for (const p of turntables) p.rotation.y = t * 0.5;
  renderer.render(scene, camera);
}
loop();
