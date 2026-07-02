// Low-poly character mesh builders (primitives only, no external assets)

import * as THREE from 'three';

function mat(color) {
  return new THREE.MeshLambertMaterial({ color });
}

function addShadowless(mesh) {
  mesh.castShadow = true;
  return mesh;
}

// Simple humanoid: legs, torso (or dress), head, hair/hat
function buildHumanoid({ skin = 0xffd7b0, torso = 0x4477cc, legs = 0x333355,
                          hair = 0x442200, dress = false, hat = null, scale = 1 }) {
  const g = new THREE.Group();

  if (dress) {
    const dressMesh = addShadowless(new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.75, 8), mat(torso)));
    dressMesh.position.y = 0.5;
    g.add(dressMesh);
  } else {
    const legL = addShadowless(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.42, 6), mat(legs)));
    legL.position.set(-0.11, 0.21, 0);
    const legR = legL.clone();
    legR.position.x = 0.11;
    const body = addShadowless(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.5, 8), mat(torso)));
    body.position.y = 0.65;
    g.add(legL, legR, body);
  }

  const armL = addShadowless(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.42, 6), mat(torso)));
  armL.position.set(-0.28, 0.68, 0);
  armL.rotation.z = 0.25;
  const armR = armL.clone();
  armR.position.x = 0.28;
  armR.rotation.z = -0.25;
  g.add(armL, armR);

  const head = addShadowless(new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), mat(skin)));
  head.position.y = 1.12;
  g.add(head);

  if (hair) {
    const hairMesh = addShadowless(new THREE.Mesh(
      new THREE.SphereGeometry(0.215, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(hair)));
    hairMesh.position.y = 1.15;
    g.add(hairMesh);
  }

  if (hat === 'bucket') {
    const brim = addShadowless(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 10), mat(0x667744)));
    brim.position.y = 1.26;
    const top = addShadowless(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.16, 10), mat(0x667744)));
    top.position.y = 1.34;
    g.add(brim, top);
  } else if (hat === 'headband') {
    const band = addShadowless(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 6, 12), mat(0xcc3333)));
    band.position.y = 1.2;
    band.rotation.x = Math.PI / 2;
    g.add(band);
  }

  g.scale.setScalar(scale);
  return g;
}

export function buildGirl() {
  const g = buildHumanoid({ torso: 0xd84a6a, dress: true, hair: 0x5a3a1a });
  // Pigtails
  const pig = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), mat(0x5a3a1a));
  pig.position.set(-0.24, 1.1, -0.02);
  const pig2 = pig.clone();
  pig2.position.x = 0.24;
  g.add(pig, pig2);
  return g;
}

export function buildBoy() {
  return buildHumanoid({ torso: 0x3a6ea5, legs: 0x44403a, hair: 0x2a1a0a });
}

export function buildFisherman() {
  const g = buildHumanoid({ torso: 0x7a6a4a, legs: 0x3a4a3a, hair: 0x888888, hat: 'bucket' });
  // Fishing rod
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 1.5, 5), mat(0x664422));
  rod.position.set(0.38, 0.9, 0.1);
  rod.rotation.z = -0.5;
  g.add(rod);
  return g;
}

export function buildHippie() {
  return buildHumanoid({ torso: 0x9955bb, legs: 0x3388aa, hair: 0x774411, hat: 'headband' });
}

export function buildKid() {
  return buildHumanoid({ torso: 0xffaa33, legs: 0x3355aa, hair: 0x442200, scale: 0.65 });
}

export function buildParent() {
  return buildHumanoid({ torso: 0x559966, legs: 0x555566, hair: 0x221100 });
}

export function buildDog() {
  const g = new THREE.Group();
  const body = addShadowless(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.32, 0.32), mat(0xb8823f)));
  body.position.y = 0.34;
  const head = addShadowless(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.28), mat(0xb8823f)));
  head.position.set(0.38, 0.52, 0);
  const snout = addShadowless(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.14), mat(0x8a5f2a)));
  snout.position.set(0.55, 0.46, 0);
  const earL = addShadowless(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.1), mat(0x8a5f2a)));
  earL.position.set(0.34, 0.7, -0.1);
  const earR = earL.clone();
  earR.position.z = 0.1;
  const tail = addShadowless(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.3, 5), mat(0xb8823f)));
  tail.position.set(-0.34, 0.5, 0);
  tail.rotation.z = 0.7;
  tail.name = 'tail';
  const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.22, 5);
  for (const [x, z] of [[-0.2, -0.1], [-0.2, 0.1], [0.2, -0.1], [0.2, 0.1]]) {
    const leg = addShadowless(new THREE.Mesh(legGeo, mat(0x8a5f2a)));
    leg.position.set(x, 0.11, z);
    g.add(leg);
  }
  g.add(body, head, snout, earL, earR, tail);
  return g;
}

export function buildSquirrel() {
  const g = new THREE.Group();
  const body = addShadowless(new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), mat(0x9a5a2a)));
  body.position.y = 0.16;
  const head = addShadowless(new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), mat(0x9a5a2a)));
  head.position.set(0.16, 0.32, 0);
  const tail = addShadowless(new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), mat(0xb5723a)));
  tail.scale.set(0.6, 1.6, 0.6);
  tail.position.set(-0.18, 0.32, 0);
  tail.rotation.z = 0.4;
  g.add(body, head, tail);
  return g;
}

export function buildBird() {
  const g = new THREE.Group();
  const body = addShadowless(new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), mat(0x4488dd)));
  const head = addShadowless(new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), mat(0x4488dd)));
  head.position.set(0.12, 0.08, 0);
  const beak = addShadowless(new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 5), mat(0xffaa22)));
  beak.position.set(0.22, 0.08, 0);
  beak.rotation.z = -Math.PI / 2;
  const wingL = addShadowless(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.2), mat(0x3366bb)));
  wingL.position.set(-0.02, 0.05, -0.13);
  wingL.name = 'wingL';
  const wingR = wingL.clone();
  wingR.position.z = 0.13;
  wingR.name = 'wingR';
  g.add(body, head, beak, wingL, wingR);
  return g;
}

export function buildCoffeeCart() {
  const g = new THREE.Group();
  const cart = addShadowless(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.7), mat(0x8a4a2a)));
  cart.position.y = 0.6;
  const counter = addShadowless(new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.8), mat(0xd8c8a8)));
  counter.position.y = 1.02;
  const pole = addShadowless(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 6), mat(0x888888)));
  pole.position.y = 1.6;
  const umbrella = addShadowless(new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.4, 8), mat(0xcc4444)));
  umbrella.position.y = 2.3;
  const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.06, 10);
  for (const x of [-0.45, 0.45]) {
    const wheel = addShadowless(new THREE.Mesh(wheelGeo, mat(0x333333)));
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.2, 0.38);
    g.add(wheel);
  }
  // Barista
  const barista = buildHumanoid({ torso: 0x664422, legs: 0x333333, hair: 0x111111, scale: 0.9 });
  barista.position.set(0, 0, -0.6);
  g.add(cart, counter, pole, umbrella, barista);
  return g;
}

export function buildLadybug() {
  const g = new THREE.Group();
  // Leaf
  const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.35, 8), mat(0x55aa44));
  leaf.rotation.x = -Math.PI / 2;
  leaf.position.y = 0.02;
  leaf.scale.set(1, 1.4, 1);
  // Body
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(0xdd2222));
  body.position.y = 0.03;
  const headB = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), mat(0x111111));
  headB.position.set(0.12, 0.06, 0);
  const dotGeo = new THREE.SphereGeometry(0.025, 6, 4);
  for (const [x, z] of [[-0.04, -0.07], [-0.04, 0.07], [0.04, -0.05], [0.04, 0.05], [-0.09, 0]]) {
    const dot = new THREE.Mesh(dotGeo, mat(0x111111));
    dot.position.set(x, 0.13, z);
    g.add(dot);
  }
  g.add(leaf, body, headB);
  g.name = 'ladybug';
  g.scale.setScalar(1.6);
  return g;
}

export const NPC_BUILDERS = {
  fisherman: buildFisherman,
  dog: buildDog,
  kid: buildKid,
  hippie: buildHippie,
  squirrel: buildSquirrel,
  bird: buildBird,
  coffeeCart: buildCoffeeCart,
  parent: buildParent
};
