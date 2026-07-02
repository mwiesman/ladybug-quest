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
  group.add(ground(0x5faa4f));

  // The big old oak tree — heart of the story
  group.add(tree(295, 150, 'oak', 1.8));

  // Ladybug on a leaf near the oak (visible once you have the Net; toggled in main)
  const ladybug = buildLadybug();
  ladybug.position.set(toX(state.ladybug.x), 0, toZ(state.ladybug.y));
  ladybug.visible = false;
  group.add(ladybug);

  // Scattered flowers
  const colors = [0xffe066, 0xff7799, 0xffffff, 0xcc88ff];
  for (let i = 0; i < 18; i++) {
    group.add(flower(60 + ((i * 97) % 520), 80 + ((i * 173) % 360), colors[i % colors.length]));
  }

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
    obstacles: [{ x: 295, y: 150, r: 28 }, { x: 80, y: 120, r: 18 }, { x: 560, y: 380, r: 18 }],
    refs: { ladybug }
  };
}

function buildPark(state) {
  const group = new THREE.Group();
  group.add(ground(0x63a653));

  // Dirt path crossing the park
  const path = new THREE.Mesh(new THREE.PlaneGeometry(HALF_W * 2, 2.2), mat(0xc2a875));
  path.rotation.x = -Math.PI / 2;
  path.position.y = 0.01;
  group.add(path);
  const pathV = new THREE.Mesh(new THREE.PlaneGeometry(2.2, HALF_D * 2), mat(0xc2a875));
  pathV.rotation.x = -Math.PI / 2;
  pathV.position.y = 0.01;
  group.add(pathV);

  group.add(bench(480, 200, Math.PI), bench(160, 330));
  group.add(lamp(250, 180), lamp(420, 300));
  group.add(tree(550, 100, 'round', 1.2), tree(60, 400, 'round', 1.1), tree(600, 420, 'pine', 1.0));

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
      { x: 550, y: 100, r: 20 }, { x: 60, y: 400, r: 18 }, { x: 600, y: 420, r: 18 },
      { x: 480, y: 200, r: 16 }, { x: 160, y: 330, r: 16 },
      { x: 100, y: 100, r: 26 } // coffee cart
    ],
    refs: { birdseedMesh: seeds }
  };
}

function buildPlayground() {
  const group = new THREE.Group();
  group.add(ground(0x6fae5c));

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

  group.add(tree(60, 80, 'round', 1.0), tree(590, 420, 'round', 1.1));
  addExitPads(group, 'playground');

  return {
    group,
    obstacles: [
      { x: 150, y: 150, r: 24 }, { x: 420, y: 360, r: 30 },
      { x: 60, y: 80, r: 18 }, { x: 590, y: 420, r: 18 }
    ],
    refs: {}
  };
}

function buildBoathouse() {
  const group = new THREE.Group();
  group.add(ground(0x6aa858));

  // Water along the top edge (y < 80)
  const water = new THREE.Mesh(new THREE.PlaneGeometry(HALF_W * 2, 80 * WORLD_SCALE * 2),
    new THREE.MeshLambertMaterial({ color: 0x3a7ac8, transparent: true, opacity: 0.9 }));
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0.02, toZ(40));
  water.name = 'water';
  group.add(water);

  // Dock reaching into the water
  const dock = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 3.4), mat(0x8a6a4a));
  dock.position.set(toX(320), 0.1, toZ(95));
  dock.castShadow = true;
  group.add(dock);

  // Boathouse building
  const house = new THREE.Group();
  const walls = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.4, 1.8), mat(0xc8b090));
  walls.position.y = 0.7;
  walls.castShadow = true;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 0.9, 4), mat(0x8a3a2a));
  roof.position.y = 1.85;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  house.add(walls, roof);
  house.position.set(toX(120), 0, toZ(140));
  group.add(house);

  // Camperdown Elm — weeping, twisted (drooping foliage) + plaque
  const elm = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 1.0, 7), mat(0x5a4a3a));
  trunk.position.y = 0.5;
  trunk.rotation.z = 0.18;
  trunk.castShadow = true;
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.9, 9, 7), mat(0x3a6a2a));
  canopy.position.y = 1.15;
  canopy.scale.set(1.3, 0.7, 1.3);
  canopy.castShadow = true;
  const droop = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.0, 0.7, 9, 1, true), mat(0x356226));
  droop.position.y = 0.75;
  elm.add(trunk, canopy, droop);
  elm.position.set(toX(440), 0, toZ(105));
  group.add(elm);

  const plaque = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5), mat(0x555555));
  post.position.y = 0.25;
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.25, 0.03), mat(0xc8a838));
  sign.position.y = 0.55;
  sign.rotation.x = -0.3;
  plaque.add(post, sign);
  plaque.position.set(toX(418), 0, toZ(120));
  group.add(plaque);

  group.add(tree(560, 380, 'round', 1.1), tree(60, 400, 'pine', 1.0));
  addExitPads(group, 'boathouse');

  return {
    group,
    obstacles: [
      { x: 120, y: 140, r: 34 }, { x: 440, y: 105, r: 22 },
      { x: 560, y: 380, r: 18 }, { x: 60, y: 400, r: 18 }
    ],
    refs: { water }
  };
}

function buildGateArea(state) {
  const group = new THREE.Group();
  group.add(ground(0x5a9a4a));

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

  group.add(tree(80, 100, 'pine', 1.2), tree(150, 400, 'round', 1.0), tree(560, 400, 'round', 1.1));
  addExitPads(group, 'gate_area');

  return {
    group,
    obstacles: [
      { x: 500, y: 80, r: 22 }, { x: 80, y: 100, r: 18 },
      { x: 150, y: 400, r: 18 }, { x: 560, y: 400, r: 18 }
    ],
    refs: { gate, logs }
  };
}

function buildWoods(state) {
  const group = new THREE.Group();
  group.add(ground(0x3a6a34));

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
