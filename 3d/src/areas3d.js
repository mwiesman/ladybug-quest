// 3D area builders — one Group per area, laid out on the same 640x480
// logical grid as the 8-bit game (positions map through toX/toZ).
// Each builder returns { group, obstacles } where obstacles are circles
// in logical coordinates used for player collision.

import * as THREE from 'three';
import { toX, toZ, HALF_W, HALF_D, WORLD_SCALE } from './state.js';
import { buildLadybug } from './characters.js';
import { AREA_DATA } from '../../src/data/areas.js';

function mat(color) {
  return new THREE.MeshLambertMaterial({ color });
}

function ground(color) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(HALF_W * 2, HALF_D * 2), mat(color));
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
}

// Tree at logical (x, y). kind: 'oak' | 'pine' | 'round'
function tree(x, y, kind = 'round', scale = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 1.2 * scale, 7), mat(0x6a4a2a));
  trunk.position.y = 0.6 * scale;
  trunk.castShadow = true;
  g.add(trunk);
  if (kind === 'pine') {
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry((0.8 - i * 0.2) * scale, 0.9 * scale, 8), mat(0x2a6a3a));
      cone.position.y = (1.1 + i * 0.55) * scale;
      cone.castShadow = true;
      g.add(cone);
    }
  } else {
    const blob = new THREE.Mesh(new THREE.SphereGeometry(0.75 * scale, 9, 7), mat(kind === 'oak' ? 0x3a7a2a : 0x4a8a3a));
    blob.position.y = 1.6 * scale;
    blob.castShadow = true;
    g.add(blob);
    if (kind === 'oak') {
      const blob2 = new THREE.Mesh(new THREE.SphereGeometry(0.55 * scale, 9, 7), mat(0x347026));
      blob2.position.set(0.5 * scale, 1.3 * scale, 0.2 * scale);
      blob2.castShadow = true;
      g.add(blob2);
    }
  }
  g.position.set(toX(x), 0, toZ(y));
  return g;
}

function bush(x, y, scale = 1) {
  const g = new THREE.Group();
  for (const [dx, dz, r] of [[0, 0, 0.32], [0.22, 0.08, 0.24], [-0.2, -0.06, 0.22]]) {
    const blob = new THREE.Mesh(new THREE.SphereGeometry(r * scale, 8, 6), mat(0x2e6e30));
    blob.position.set(dx * scale, r * scale * 0.75, dz * scale);
    blob.castShadow = true;
    g.add(blob);
  }
  g.position.set(toX(x), 0, toZ(y));
  return g;
}

function rock(x, y, scale = 1, rotY = 0) {
  const g = new THREE.Group();
  const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.35 * scale, 0), mat(0x8a8a86));
  boulder.position.y = 0.22 * scale;
  boulder.scale.set(1.2, 0.75, 1);
  boulder.castShadow = true;
  const pebble = new THREE.Mesh(new THREE.DodecahedronGeometry(0.16 * scale, 0), mat(0x77776f));
  pebble.position.set(0.35 * scale, 0.1 * scale, 0.15 * scale);
  pebble.castShadow = true;
  g.add(boulder, pebble);
  g.position.set(toX(x), 0, toZ(y));
  g.rotation.y = rotY;
  return g;
}

// Grassy mound (Long Meadow rolling-hill feel) — pair with an obstacle
function mound(x, y, radius = 60, height = 0.9) {
  const m = new THREE.Mesh(
    new THREE.SphereGeometry(radius * WORLD_SCALE, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(0x549a48));
  m.scale.y = height / (radius * WORLD_SCALE);
  m.position.set(toX(x), 0, toZ(y));
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// Wooden sign post with painted text
function signPost(x, y, text, rotY = 0) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.9, 6), mat(0x6a4a2a));
  post.position.y = 0.45;
  post.castShadow = true;
  const c = document.createElement('canvas');
  c.width = 128; c.height = 32;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#8a6a3a';
  ctx.fillRect(0, 0, 128, 32);
  ctx.fillStyle = '#f5ead0';
  ctx.font = 'bold 15px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 64, 17);
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.22, 0.04),
    [mat(0x8a6a3a), mat(0x8a6a3a), mat(0x8a6a3a), mat(0x8a6a3a),
     new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(c) }), mat(0x8a6a3a)]);
  board.position.y = 0.82;
  board.castShadow = true;
  g.add(post, board);
  g.position.set(toX(x), 0, toZ(y));
  g.rotation.y = rotY;
  return g;
}

// Cattail reeds at a water's edge
function reeds(x, y) {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.55, 4), mat(0x4a7a3a));
    stalk.position.set((i - 2) * 0.09 + (i % 2) * 0.04, 0.27, (i % 3) * 0.06);
    stalk.rotation.z = (i - 2) * 0.06;
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.14, 5), mat(0x6a4a2a));
    tip.position.set(stalk.position.x + (i - 2) * 0.03, 0.58, stalk.position.z);
    g.add(stalk, tip);
  }
  g.position.set(toX(x), 0, toZ(y));
  return g;
}

// Winding dirt path made of overlapping angled segments
function windingPath(points, width = 1.4) {
  const g = new THREE.Group();
  for (let i = 0; i < points.length - 1; i++) {
    const ax = toX(points[i][0]), az = toZ(points[i][1]);
    const bx = toX(points[i + 1][0]), bz = toZ(points[i + 1][1]);
    const len = Math.hypot(bx - ax, bz - az);
    const seg = new THREE.Mesh(new THREE.PlaneGeometry(len + width * 0.5, width), mat(0xc2a875));
    seg.rotation.x = -Math.PI / 2;
    seg.rotation.z = -Math.atan2(bz - az, bx - ax);
    seg.position.set((ax + bx) / 2, 0.012, (az + bz) / 2);
    g.add(seg);
  }
  return g;
}

function flower(x, y, color) {
  const g = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 5), mat(0x3a8a3a));
  stem.position.y = 0.12;
  const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.06, 7, 5), mat(color));
  bloom.position.y = 0.27;
  g.add(stem, bloom);
  g.position.set(toX(x), 0, toZ(y));
  return g;
}

function bench(x, y, rotY = 0) {
  const g = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.32), mat(0x8a6a3a));
  seat.position.y = 0.32;
  seat.castShadow = true;
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 0.05), mat(0x8a6a3a));
  back.position.set(0, 0.55, -0.15);
  back.castShadow = true;
  const legGeo = new THREE.BoxGeometry(0.06, 0.32, 0.28);
  for (const lx of [-0.42, 0.42]) {
    const leg = new THREE.Mesh(legGeo, mat(0x444444));
    leg.position.set(lx, 0.16, 0);
    g.add(leg);
  }
  g.add(seat, back);
  g.position.set(toX(x), 0, toZ(y));
  g.rotation.y = rotY;
  return g;
}

function lamp(x, y) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 1.8, 6), mat(0x2a2a3a));
  pole.position.y = 0.9;
  pole.castShadow = true;
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xffeeaa }));
  bulb.position.y = 1.85;
  g.add(pole, bulb);
  g.position.set(toX(x), 0, toZ(y));
  return g;
}

// Glowing exit pad at an area edge (visual hint for transitions)
function exitPad(dir) {
  const geo = new THREE.PlaneGeometry(3, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0xfff2b0, transparent: true, opacity: 0.28, side: THREE.DoubleSide
  });
  const pad = new THREE.Mesh(geo, material);
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = 0.015;
  if (dir === 'right') { pad.position.x = HALF_W - 0.5; pad.rotation.z = Math.PI / 2; }
  if (dir === 'left') { pad.position.x = -HALF_W + 0.5; pad.rotation.z = Math.PI / 2; }
  if (dir === 'up') { pad.position.z = -HALF_D + 0.5; }
  if (dir === 'down') { pad.position.z = HALF_D - 0.5; }
  return pad;
}

function addExitPads(group, areaId) {
  for (const dir of Object.keys(AREA_DATA[areaId].exits)) {
    group.add(exitPad(dir));
  }
}

function fenceSegment(x1, y1, x2, y2) {
  const g = new THREE.Group();
  const ax = toX(x1), az = toZ(y1), bx = toX(x2), bz = toZ(y2);
  const len = Math.hypot(bx - ax, bz - az);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.06, 0.06), mat(0x7a6a5a));
  rail.position.y = 0.55;
  const rail2 = rail.clone();
  rail2.position.y = 0.3;
  g.add(rail, rail2);
  const posts = Math.max(2, Math.round(len / 0.9));
  for (let i = 0; i <= posts; i++) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 5), mat(0x6a5a4a));
    post.position.set(-len / 2 + (len * i) / posts, 0.35, 0);
    g.add(post);
  }
  g.position.set((ax + bx) / 2, 0, (az + bz) / 2);
  g.rotation.y = -Math.atan2(bz - az, bx - ax);
  return g;
}

// ---------------------------------------------------------------- areas

function buildMeadow(state) {
  const group = new THREE.Group();
  group.add(ground(0x679a55));

  // The big old oak tree — heart of the story
  group.add(tree(295, 150, 'oak', 1.8));

  // Ladybug on a leaf near the oak (visible once you have the Net; toggled in main)
  const ladybug = buildLadybug();
  ladybug.position.set(toX(state.ladybug.x), 0, toZ(state.ladybug.y));
  ladybug.visible = false;
  group.add(ladybug);

  // Scattered flowers, thick like early summer
  const colors = [0xffe066, 0xff7799, 0xffffff, 0xcc88ff];
  for (let i = 0; i < 34; i++) {
    group.add(flower(60 + ((i * 97) % 520), 80 + ((i * 173) % 360), colors[i % colors.length]));
  }

  // Rolling edges, brush, and stone
  group.add(mound(585, 75, 45, 0.6), mound(58, 62, 38, 0.5));
  group.add(bush(500, 105), bush(92, 330), bush(510, 430));
  group.add(rock(450, 420, 0.8, 1.7));
  group.add(tree(170, 62, 'round', 0.9), tree(618, 315, 'pine', 1.0));

  // Faithful-to-real-life engagement horse poop (easter egg)
  const poop = new THREE.Group();
  for (const [dx, dz, s] of [[0, 0, 0.09], [0.1, 0.05, 0.07], [-0.08, 0.06, 0.06]]) {
    const blob = new THREE.Mesh(new THREE.SphereGeometry(s, 7, 5), mat(0x5a4020));
    blob.position.set(dx, s * 0.7, dz);
    poop.add(blob);
  }
  poop.position.set(toX(69), 0, toZ(451));
  group.add(poop);

  group.add(tree(80, 120, 'round', 1.1), tree(560, 380, 'round', 1.0));
  addExitPads(group, 'meadow');

  return {
    group,
    obstacles: [
      { x: 295, y: 150, r: 28 }, { x: 80, y: 120, r: 18 }, { x: 560, y: 380, r: 18 },
      { x: 585, y: 75, r: 38 }, { x: 58, y: 62, r: 32 },
      { x: 170, y: 62, r: 16 }, { x: 618, y: 315, r: 16 }, { x: 450, y: 420, r: 9 }
    ],
    refs: { ladybug }
  };
}

function buildPark(state) {
  // Prospect Park energy: the Long Meadow's rolling mounds, a pond with
  // reeds, winding side paths, mixed trees, benches, and trail signs
  const group = new THREE.Group();
  group.add(ground(0x6a9c5c));

  // Lighter grass patches break up the flat green
  for (const [px, py, r] of [[420, 180, 3.2], [180, 380, 2.6], [520, 300, 2.2]]) {
    const patch = new THREE.Mesh(new THREE.CircleGeometry(r, 12), mat(0x6fb35d));
    patch.rotation.x = -Math.PI / 2;
    patch.position.set(toX(px), 0.008, toZ(py));
    group.add(patch);
  }

  // Winding park paths (no straight Union Jack lines): a meandering
  // east–west walk, a wandering north–south one, and spurs to the pond
  // and the coffee shack
  group.add(windingPath(
    [[0, 240], [90, 258], [180, 232], [270, 250], [340, 242], [430, 262], [530, 238], [640, 244]], 2.0));
  group.add(windingPath(
    [[320, 0], [302, 80], [332, 160], [318, 245], [296, 330], [322, 410], [320, 480]], 1.8));
  group.add(windingPath([[340, 260], [420, 310], [480, 360], [520, 395]], 1.2));
  group.add(windingPath([[250, 245], [180, 195], [125, 145]], 1.1));

  // The pond, bottom-right, ringed with reeds
  const pond = new THREE.Mesh(new THREE.CircleGeometry(3.4, 18),
    new THREE.MeshLambertMaterial({ color: 0x3a7ac8, transparent: true, opacity: 0.92 }));
  pond.rotation.x = -Math.PI / 2;
  pond.scale.y = 0.62; // squash into an ellipse (pre-rotation y = world z)
  pond.position.set(toX(545), 0.015, toZ(415));
  pond.name = 'pond';
  const pondEdge = new THREE.Mesh(new THREE.RingGeometry(3.4, 3.65, 18),
    mat(0xb8a878));
  pondEdge.rotation.x = -Math.PI / 2;
  pondEdge.scale.y = 0.62;
  pondEdge.position.set(toX(545), 0.012, toZ(415));
  group.add(pond, pondEdge);
  group.add(reeds(478, 390), reeds(600, 375), reeds(505, 448));

  // Long Meadow mounds
  group.add(mound(520, 60, 55, 0.75), mound(55, 335, 42, 0.6));

  // Benches, lamps, signs
  group.add(bench(480, 200, Math.PI), bench(160, 330), bench(465, 425, -1.1));
  group.add(lamp(250, 180), lamp(420, 300), lamp(150, 260));
  group.add(signPost(345, 218, 'LONG MEADOW', 0.4), signPost(462, 340, 'THE POND', -0.5));

  // Mixed trees around the edges
  group.add(
    tree(550, 100, 'oak', 1.4), tree(60, 400, 'round', 1.1), tree(615, 420, 'pine', 1.0),
    tree(60, 60, 'pine', 1.1), tree(620, 180, 'round', 1.3), tree(450, 60, 'round', 1.0),
    tree(40, 180, 'round', 0.9), tree(255, 430, 'round', 1.2), tree(620, 300, 'pine', 0.9)
  );
  group.add(bush(300, 100), bush(420, 150), bush(95, 380), bush(270, 330), bush(500, 180), bush(610, 250));
  group.add(rock(380, 80, 1, 0.6), rock(60, 445, 0.8, 2.1), rock(470, 250, 0.7, 1.2));

  const colors = [0xffe066, 0xff7799, 0xffffff];
  for (let i = 0; i < 10; i++) {
    group.add(flower(70 + ((i * 131) % 500), 100 + ((i * 211) % 320), colors[i % 3]));
  }

  // Bird feeder with birdseed (pickup)
  const feeder = new THREE.Group();
  const fPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6), mat(0x6a4a2a));
  fPole.position.y = 0.6;
  const tray = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.06, 8), mat(0x8a6a3a));
  tray.position.y = 1.2;
  const seeds = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 8), mat(0xd8c060));
  seeds.position.y = 1.25;
  seeds.name = 'seeds';
  feeder.add(fPole, tray, seeds);
  feeder.position.set(toX(state.worldItems.birdseed.x), 0, toZ(state.worldItems.birdseed.y));
  group.add(feeder);

  addExitPads(group, 'park');

  return {
    group,
    obstacles: [
      // trees
      { x: 550, y: 100, r: 22 }, { x: 60, y: 400, r: 18 }, { x: 615, y: 420, r: 18 },
      { x: 60, y: 60, r: 18 }, { x: 620, y: 180, r: 20 }, { x: 450, y: 60, r: 18 },
      { x: 40, y: 180, r: 16 }, { x: 255, y: 430, r: 20 }, { x: 620, y: 300, r: 16 },
      // benches
      { x: 480, y: 200, r: 16 }, { x: 160, y: 330, r: 16 }, { x: 465, y: 425, r: 16 },
      // mounds, pond (three circles approximate the ellipse), rocks
      { x: 520, y: 60, r: 48 }, { x: 55, y: 335, r: 36 },
      { x: 545, y: 415, r: 42 }, { x: 495, y: 405, r: 26 }, { x: 600, y: 425, r: 26 },
      { x: 380, y: 80, r: 10 }, { x: 470, y: 250, r: 9 },
      { x: 100, y: 100, r: 26 } // coffee shack
    ],
    refs: { birdseedMesh: seeds }
  };
}

function buildPlayground() {
  const group = new THREE.Group();
  group.add(ground(0x71a061));

  // Sandbox
  const sand = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.08, 16), mat(0xe0cc90));
  sand.position.set(toX(450), 0.04, toZ(180));
  group.add(sand);

  // Slide
  const slide = new THREE.Group();
  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.2, 0.7), mat(0xdd6633));
  tower.position.y = 0.6;
  tower.castShadow = true;
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 1.6), mat(0xffcc44));
  ramp.position.set(0, 0.72, 1.05);
  ramp.rotation.x = 0.62;
  ramp.castShadow = true;
  slide.add(tower, ramp);
  slide.position.set(toX(150), 0, toZ(150));
  group.add(slide);

  // Swing set
  const swing = new THREE.Group();
  const barMat = mat(0x3366aa);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6), barMat);
  top.rotation.z = Math.PI / 2;
  top.position.y = 1.7;
  swing.add(top);
  for (const x of [-1.15, 1.15]) {
    const legA = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 6), barMat);
    legA.position.set(x, 0.85, 0.35);
    legA.rotation.x = 0.2;
    const legB = legA.clone();
    legB.position.z = -0.35;
    legB.rotation.x = -0.2;
    swing.add(legA, legB);
  }
  for (const x of [-0.5, 0.5]) {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.15), mat(0x222222));
    seat.position.set(x, 0.5, 0);
    const ropeL = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.2, 4), mat(0x999999));
    ropeL.position.set(x - 0.14, 1.1, 0);
    const ropeR = ropeL.clone();
    ropeR.position.x = x + 0.14;
    swing.add(seat, ropeL, ropeR);
  }
  swing.position.set(toX(420), 0, toZ(360));
  group.add(swing);

  group.add(tree(60, 80, 'round', 1.0), tree(590, 420, 'round', 1.1), tree(240, 70, 'round', 0.9));
  group.add(bench(300, 290, Math.PI), bush(555, 200), bush(80, 300), rock(520, 80, 0.8, 0.9));

  // Toys left in the sandbox
  for (const [dx, dz, color] of [[0.4, 0.2, 0xdd4444], [-0.3, -0.3, 0x4477dd], [0.1, -0.45, 0xffcc33]]) {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), mat(color));
    ball.position.set(toX(450) + dx, 0.12, toZ(180) + dz);
    ball.castShadow = true;
    group.add(ball);
  }

  addExitPads(group, 'playground');

  return {
    group,
    obstacles: [
      { x: 150, y: 150, r: 24 }, { x: 420, y: 360, r: 30 },
      { x: 60, y: 80, r: 18 }, { x: 590, y: 420, r: 18 }, { x: 240, y: 70, r: 16 },
      { x: 300, y: 290, r: 14 }, { x: 520, y: 80, r: 9 }
    ],
    refs: {}
  };
}

function buildBoathouse() {
  // Faithful to the 8-bit layout: land on top, the lake across the bottom,
  // a railed footbridge in from the park, the waterfall spilling in on the
  // far left, ducks, the turtle on its floating log, and the grand white
  // Prospect Park boathouse (arched, terracotta-roofed) on the right with
  // its dock — the Camperdown Elm up on the hill.
  const group = new THREE.Group();
  group.add(ground(0x6c9c5e));

  // The lake: everything below y=290
  const water = new THREE.Mesh(new THREE.PlaneGeometry(HALF_W * 2, 190 * WORLD_SCALE),
    new THREE.MeshLambertMaterial({ color: 0x4682b4, transparent: true, opacity: 0.94 }));
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0.02, toZ(385));
  water.name = 'water';
  const shoreline = new THREE.Mesh(new THREE.PlaneGeometry(HALF_W * 2, 0.3), mat(0xb8a878));
  shoreline.rotation.x = -Math.PI / 2;
  shoreline.position.set(0, 0.016, toZ(288));
  group.add(water, shoreline);

  // Footbridge from the park entrance (bottom edge) onto the land
  const bridge = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.1, 10.2), mat(0x8b5a2b));
  deck.position.set(0, 0.08, 0);
  deck.castShadow = true;
  bridge.add(deck);
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 10.2), mat(0x654321));
    rail.position.set(side * 1.45, 0.62, 0);
    bridge.add(rail);
    for (let i = 0; i < 6; i++) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.55, 0.07), mat(0x654321));
      post.position.set(side * 1.45, 0.35, -4.6 + i * 1.85);
      bridge.add(post);
    }
  }
  bridge.position.set(toX(325), 0, toZ(382));
  group.add(bridge);

  // Waterfall on the far left, tumbling over rock into the lake
  const falls = new THREE.Group();
  const cliff = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.5, 1.6), mat(0x777772));
  cliff.position.set(0, 0.75, 0);
  cliff.castShadow = true;
  const cliffTop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 1.2), mat(0x8a8a84));
  cliffTop.position.set(-0.2, 1.55, 0);
  cliffTop.castShadow = true;
  falls.add(cliff, cliffTop);
  const waterfallStreams = [];
  for (let i = 0; i < 3; i++) {
    const stream = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 1.5),
      new THREE.MeshLambertMaterial({ color: 0xa8d8f0, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
    stream.position.set(-0.6 + i * 0.55, 0.75, 0.82);
    falls.add(stream);
    waterfallStreams.push(stream);
  }
  const splash = new THREE.Mesh(new THREE.CircleGeometry(1.1, 10),
    new THREE.MeshLambertMaterial({ color: 0xd8eefa, transparent: true, opacity: 0.6 }));
  splash.rotation.x = -Math.PI / 2;
  splash.position.set(0, 0.03, 1.4);
  splash.name = 'splash';
  falls.add(splash);
  falls.position.set(toX(22), 0, toZ(255));
  group.add(falls);

  // Ducks drifting on the lake (animated in main.js)
  const ducks = [];
  for (let i = 0; i < 3; i++) {
    const duck = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), mat(i === 2 ? 0xd3d3d3 : 0xf5f5f0));
    body.scale.set(1, 0.8, 1.3);
    const headD = new THREE.Mesh(new THREE.SphereGeometry(0.06, 7, 5), mat(i === 2 ? 0x2c2c2c : 0xf5f5f0));
    headD.position.set(0, 0.13, 0.12);
    const bill = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 4), mat(0xffa500));
    bill.position.set(0, 0.12, 0.19);
    bill.rotation.x = Math.PI / 2;
    duck.add(body, headD, bill);
    duck.position.set(toX(150 + i * 60), 0.08, toZ(340 + i * 30));
    duck.userData.phase = i * 2.1;
    group.add(duck);
    ducks.push(duck);
  }

  // The turtle on its floating log (bobs gently)
  const turtleLog = new THREE.Group();
  const log = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.6, 7), mat(0x654321));
  log.rotation.z = Math.PI / 2;
  log.position.y = 0.06;
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 9, 7, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x556b2f));
  shell.scale.set(1, 0.7, 1.2);
  shell.position.set(0.2, 0.14, 0);
  const shellRim = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.14, 0.035, 9), mat(0x4a5c20));
  shellRim.position.set(0.2, 0.14, 0);
  const tHead = new THREE.Mesh(new THREE.SphereGeometry(0.05, 7, 5), mat(0x6b8e23));
  tHead.position.set(0.2, 0.16, 0.2);
  turtleLog.add(log, shell, shellRim, tHead);
  turtleLog.position.set(toX(400), 0.02, toZ(345));
  group.add(turtleLog);

  // The grand boathouse: white beaux-arts facade with three arches,
  // cornice, and terracotta roof, up on a stone terrace
  const house = new THREE.Group();
  const terrace = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.18, 3.2), mat(0xcfc8b8));
  terrace.position.y = 0.09;
  const body = new THREE.Mesh(new THREE.BoxGeometry(6.0, 2.1, 2.6), mat(0xf2f0ea));
  body.position.y = 1.14;
  body.castShadow = true;
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.16, 2.9), mat(0xe4e0d4));
  cornice.position.y = 2.24;
  cornice.castShadow = true;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(6.1, 0.5, 2.7), mat(0xb06040));
  roof.position.y = 2.55;
  roof.scale.set(1, 1, 1);
  roof.castShadow = true;
  const roofTop = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.35, 2.1), mat(0xa05838));
  roofTop.position.y = 2.95;
  roofTop.castShadow = true;
  house.add(terrace, body, cornice, roof, roofTop);
  // Three arched openings along the front
  for (let i = -1; i <= 1; i++) {
    const archBox = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.1), mat(0x3a4a52));
    archBox.position.set(i * 1.7, 0.75, 1.28);
    const archTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 0.1, 12, 1, false, 0, Math.PI),
      mat(0x3a4a52));
    archTop.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    archTop.position.set(i * 1.7, 1.3, 1.28);
    // White column between arches
    if (i < 1) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 1.9, 8), mat(0xfaf8f2));
      col.position.set(i * 1.7 + 0.85, 1.05, 1.32);
      col.castShadow = true;
      house.add(col);
    }
    house.add(archBox, archTop);
  }
  house.position.set(toX(540), 0, toZ(212));
  group.add(house);

  // Dock in front of the boathouse, over the water
  const dock = new THREE.Mesh(new THREE.BoxGeometry(9, 0.12, 1.4), mat(0x8b5a2b));
  dock.position.set(toX(510), 0.1, toZ(287));
  dock.castShadow = true;
  const dockPosts = new THREE.Group();
  for (const px of [430, 470, 510, 550, 590]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 5), mat(0x654321));
    post.position.set(toX(px), 0.12, toZ(300));
    dockPosts.add(post);
  }
  group.add(dock, dockPosts);

  // Camperdown Elm — the rare weeping tree, up on the hill, with its plaque
  const elm = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 1.0, 7), mat(0x5a4a3a));
  trunk.position.y = 0.5;
  trunk.rotation.z = 0.18;
  trunk.castShadow = true;
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.0, 9, 7), mat(0x3a6a2a));
  canopy.position.y = 1.2;
  canopy.scale.set(1.35, 0.7, 1.35);
  canopy.castShadow = true;
  const droop = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 0.8, 10, 1, true),
    new THREE.MeshLambertMaterial({ color: 0x356226, side: THREE.DoubleSide }));
  droop.position.y = 0.72;
  elm.add(trunk, canopy, droop);
  elm.position.set(toX(400), 0, toZ(60));
  group.add(elm);

  const plaque = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5), mat(0x555555));
  post.position.y = 0.25;
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.03), mat(0xc8a838));
  sign.position.y = 0.55;
  sign.rotation.x = -0.3;
  plaque.add(post, sign);
  plaque.position.set(toX(418), 0, toZ(90));
  group.add(plaque);

  // Paths: bridge head up to the elm, and along the shore to the boathouse
  group.add(windingPath([[322, 282], [345, 210], [382, 130], [400, 82]], 1.1));
  group.add(windingPath([[330, 262], [420, 248], [482, 238]], 1.1));

  // Trees, reeds, greenery — as placed in the original
  group.add(tree(100, 80, 'round', 1.1), tree(300, 100, 'round', 1.0), tree(50, 200, 'round', 0.9));
  group.add(reeds(160, 282), reeds(250, 280), reeds(80, 284));
  group.add(bush(180, 150), bush(560, 110));
  group.add(signPost(270, 240, 'BOATHOUSE →', 0.25));
  addExitPads(group, 'boathouse');

  return {
    group,
    obstacles: [
      { x: 510, y: 205, r: 40 }, { x: 572, y: 205, r: 40 }, // the boathouse

      { x: 22, y: 255, r: 34 }, // waterfall rocks
      { x: 400, y: 60, r: 20 }, // the elm
      { x: 100, y: 80, r: 16 }, { x: 300, y: 100, r: 16 }, { x: 50, y: 200, r: 14 }
    ],
    refs: { water, waterfallStreams, splash, ducks, turtleLog }
  };
}

function buildGateArea(state) {
  const group = new THREE.Group();
  group.add(ground(0x639252));

  // Fenced corner (x > 380, y < 215) with the acorn tree inside.
  // Vertical run along x=380, horizontal run along y=215 with a gate at x~400-440.
  group.add(fenceSegment(380, 0, 380, 215));
  group.add(fenceSegment(440, 215, 640, 215));
  group.add(fenceSegment(380, 215, 390, 215));

  // Gate door (rotates open when unlocked)
  const gate = new THREE.Group();
  const door = new THREE.Mesh(new THREE.BoxGeometry(50 * WORLD_SCALE, 0.7, 0.06), mat(0x9a8a6a));
  door.position.set(25 * WORLD_SCALE, 0.35, 0); // hinge at left edge
  gate.add(door);
  gate.position.set(toX(390), 0, toZ(215));
  group.add(gate);

  // Acorn tree + acorn pile inside the fence
  group.add(tree(500, 80, 'oak', 1.3));
  const acorns = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const acorn = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), mat(0x8a5a2a));
    acorn.position.set((i % 3) * 0.12 - 0.12, 0.05, Math.floor(i / 3) * 0.12);
    acorns.add(acorn);
  }
  acorns.position.set(toX(500), 0, toZ(120));
  group.add(acorns);

  // Log pile blocking the north exit to the woods
  const logs = new THREE.Group();
  const logGeo = new THREE.CylinderGeometry(0.16, 0.16, 2.6, 8);
  for (let i = 0; i < 3; i++) {
    const log = new THREE.Mesh(logGeo, mat(i % 2 ? 0x7a5a3a : 0x6a4a2a));
    log.rotation.z = Math.PI / 2;
    log.position.set(0, 0.16 + i * 0.24, (i % 2) * 0.1);
    log.castShadow = true;
    logs.add(log);
  }
  logs.position.set(toX(300), 0, toZ(35));
  group.add(logs);

  group.add(tree(80, 100, 'pine', 1.2), tree(150, 400, 'round', 1.0), tree(560, 400, 'round', 1.1),
    tree(60, 330, 'pine', 0.9));
  group.add(bush(200, 180), bush(560, 300), bush(300, 420));
  group.add(rock(90, 445, 0.9, 1.3), rock(250, 120, 0.7, 2.4));
  group.add(signPost(180, 260, 'THE WOODS ↑', -0.3));
  addExitPads(group, 'gate_area');

  return {
    group,
    obstacles: [
      { x: 500, y: 80, r: 22 }, { x: 80, y: 100, r: 18 },
      { x: 150, y: 400, r: 18 }, { x: 560, y: 400, r: 18 }, { x: 60, y: 330, r: 16 },
      { x: 90, y: 445, r: 9 }, { x: 250, y: 120, r: 8 }
    ],
    refs: { gate, logs }
  };
}

function buildWoods(state) {
  const group = new THREE.Group();
  group.add(ground(0x45703f));

  // Dense trees — leave a wandering path clear
  const clearings = [
    { x: 320, y: 440, r: 70 }, { x: 320, y: 300, r: 70 },
    { x: 450, y: 300, r: 60 }, { x: 250, y: 180, r: 70 }
  ];
  const obstacles = [];
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 26; i++) {
    const x = 40 + rand() * 560;
    const y = 40 + rand() * 400;
    if (clearings.some((c) => Math.hypot(c.x - x, c.y - y) < c.r)) continue;
    group.add(tree(x, y, rand() > 0.5 ? 'pine' : 'round', 0.9 + rand() * 0.6));
    obstacles.push({ x, y, r: 16 });
  }

  // Leaf pile hiding the gold doubloons
  const leaves = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.12, 6), mat(0xa8842a));
    leaf.rotation.x = -Math.PI / 2 + (rand() - 0.5) * 0.4;
    leaf.position.set((rand() - 0.5) * 0.5, 0.02 + i * 0.008, (rand() - 0.5) * 0.5);
    leaves.add(leaf);
  }
  leaves.position.set(toX(450), 0, toZ(300));
  group.add(leaves);

  // Mushrooms and mossy rocks on the forest floor
  for (const [mx, my] of [[290, 350], [355, 225], [500, 250], [230, 260]]) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.12, 6), mat(0xe8e0d0));
    stem.position.set(toX(mx), 0.06, toZ(my));
    const capM = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xbb3333));
    capM.position.set(toX(mx), 0.11, toZ(my));
    capM.scale.y = 0.6;
    group.add(stem, capM);
  }
  group.add(rock(280, 245, 0.8, 0.8), rock(390, 415, 1.0, 2.0));
  obstacles.push({ x: 280, y: 245, r: 9 }, { x: 390, y: 415, r: 10 });

  addExitPads(group, 'woods');
  return { group, obstacles, refs: { doubloonsMesh: leaves } };
}

export function buildAllAreas(state) {
  const areas = {
    meadow: buildMeadow(state),
    park: buildPark(state),
    playground: buildPlayground(),
    boathouse: buildBoathouse(),
    gate_area: buildGateArea(state),
    woods: buildWoods(state)
  };
  for (const area of Object.values(areas)) {
    area.group.visible = false;
  }
  return areas;
}
