// Low-poly character mesh builders (primitives only, no external assets).
// Colors, outfits, and face coverings match each character's 8-bit sprite
// (src/rendering/sprites.js) — the story takes place during covid, so the
// humans all wear masks: the girl's crimson with white dots, the boy's
// tie-dye, the fisherman's gray, exactly like their sprites.

import * as THREE from 'three';

function mat(color) {
  return new THREE.MeshLambertMaterial({ color });
}

function shadow(mesh) {
  mesh.castShadow = true;
  return mesh;
}

// Characters face +z when rotation.y === 0 (the game rotates them with
// atan2(dx, dz) toward the player), so faces go on the +z side.

function addEyes(head, { y = 0.05, spread = 0.075, size = 0.032, forward = 0.17 } = {}) {
  const geo = new THREE.SphereGeometry(size, 6, 5);
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(geo, mat(0x1a1a1a));
    eye.position.set(side * spread, y, forward);
    head.add(eye);
  }
}

// Face mask over the lower half of the face, with ear straps.
function addMask(head, color, { dots = null } = {}) {
  const mask = new THREE.Mesh(new THREE.SphereGeometry(0.145, 10, 8), mat(color));
  mask.scale.set(0.95, 0.6, 0.56);
  mask.position.set(0, -0.075, 0.11);
  head.add(mask);

  // Straps back to the ears
  for (const side of [-1, 1]) {
    const strap = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.16, 4), mat(color));
    strap.position.set(side * 0.185, -0.03, 0.02);
    strap.rotation.set(1.35, 0, side * 0.35);
    head.add(strap);
  }

  // Polka dots (the girl's ladybug-style mask)
  if (dots) {
    const dotGeo = new THREE.SphereGeometry(0.009, 5, 4);
    for (const [dx, dy] of [[-0.055, -0.06], [0, -0.05], [0.055, -0.06], [-0.028, -0.1], [0.028, -0.1]]) {
      const dot = new THREE.Mesh(dotGeo, mat(dots));
      dot.position.set(dx, dy, 0.19);
      head.add(dot);
    }
  }
  return mask;
}

// --- Shared humanoid rig ------------------------------------------------

function buildHumanoid({ skin = 0xffd1a3, torso = 0x4477cc, sleeves = null,
                          legs = 0x2c5aa0, shoes = 0x654321, hair = 0x442200,
                          dress = false, scale = 1 } = {}) {
  const g = new THREE.Group();
  const parts = {};
  const armColor = sleeves ?? torso;

  if (dress) {
    const dressMesh = shadow(new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.78, 8), mat(torso)));
    dressMesh.position.y = 0.5;
    g.add(dressMesh);
    parts.torso = dressMesh;
    for (const side of [-1, 1]) {
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.08, 0.16), mat(shoes));
      shoe.position.set(side * 0.1, 0.04, 0.03);
      g.add(shoe);
    }
  } else {
    for (const side of [-1, 1]) {
      const leg = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.4, 6), mat(legs)));
      leg.position.set(side * 0.11, 0.2, 0);
      g.add(leg);
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.2), mat(shoes));
      shoe.position.set(side * 0.11, 0.045, 0.04);
      g.add(shoe);
    }
    const body = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.26), mat(torso)));
    body.position.y = 0.64;
    g.add(body);
    parts.torso = body;
  }

  for (const side of [-1, 1]) {
    const arm = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.4, 6), mat(armColor)));
    arm.position.set(side * (dress ? 0.24 : 0.27), 0.68, 0);
    arm.rotation.z = side * -0.22;
    g.add(arm);
    parts[side === -1 ? 'armL' : 'armR'] = arm;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), mat(skin));
    hand.position.set(side * (dress ? 0.29 : 0.32), 0.47, 0);
    g.add(hand);
    parts[side === -1 ? 'handL' : 'handR'] = hand;
  }

  const head = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 9), mat(skin)));
  head.position.y = 1.12;
  addEyes(head);
  g.add(head);
  parts.head = head;

  if (hair) {
    const hairMesh = shadow(new THREE.Mesh(
      new THREE.SphereGeometry(0.215, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.52), mat(hair)));
    hairMesh.position.y = 0.02;
    head.add(hairMesh);
    parts.hair = hairMesh;
  }

  g.scale.setScalar(scale);
  g.userData.parts = parts;
  return g;
}

// --- The couple ----------------------------------------------------------

export function buildGirl() {
  // drawPlayer palette: pink dress #ff69b4, lighter #ff8dc7 sleeves, brown
  // hair, blue leggings, crimson mask with white dots
  const g = buildHumanoid({
    torso: 0xff69b4, sleeves: 0xff8dc7, hair: 0x8b4513, dress: true, shoes: 0x654321
  });
  const { head } = g.userData.parts;

  const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.345, 0.09, 8), mat(0xff8dc7));
  hem.position.y = 0.18;
  g.add(hem);

  // Blue leggings peeking under the dress
  for (const side of [-1, 1]) {
    const legging = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 6), mat(0x4169e1));
    legging.position.set(side * 0.1, 0.12, 0.02);
    g.add(legging);
  }

  // Pigtails
  for (const side of [-1, 1]) {
    const a = new THREE.Mesh(new THREE.SphereGeometry(0.095, 8, 6), mat(0x8b4513));
    a.position.set(side * 0.21, -0.05, -0.04);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), mat(0x8b4513));
    b.position.set(side * 0.24, -0.16, -0.05);
    head.add(a, b);
  }

  // Her sprite's mask: crimson with white dots
  addMask(head, 0xdc143c, { dots: 0xffffff });
  return g;
}

export function buildBoy() {
  // drawBoy palette: steel-blue shirt, lighter sleeves, dark hair,
  // navy pants, tie-dye mask (pink/purple/blue)
  const g = buildHumanoid({
    torso: 0x4682b4, sleeves: 0x5a9bd4, legs: 0x2c5aa0, shoes: 0x1a1a1a, hair: 0x2c2c2c
  });
  const { head } = g.userData.parts;

  // Tie-dye mask: violet base with pink and blue swirl patches
  addMask(head, 0x7b68ee);
  const patchGeo = new THREE.SphereGeometry(0.026, 6, 5);
  for (const [dx, dy, color] of [[-0.05, -0.06, 0xff1493], [0.048, -0.07, 0x4169e1],
                                  [0, -0.105, 0x9370db], [0.015, -0.04, 0xff1493]]) {
    const patch = new THREE.Mesh(patchGeo, mat(color));
    patch.scale.z = 0.4;
    patch.position.set(dx, dy, 0.185);
    head.add(patch);
  }
  return g;
}

// --- NPCs ------------------------------------------------------------------

export function buildFisherman() {
  // Slate vest and waders, brown bucket hat, gray mask (like the sprite),
  // rod with line and bobber
  const g = buildHumanoid({ torso: 0x2f4f4f, legs: 0x2f4f4f, shoes: 0x654321, hair: null });
  const { head } = g.userData.parts;

  const bib = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.05), mat(0x3d5f5f));
  bib.position.set(0, 0.86, 0.13);
  g.add(bib);

  addMask(head, 0x696969);

  const brim = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.05, 10), mat(0x8b4513)));
  brim.position.y = 0.12;
  const crown = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.16, 10), mat(0x8b4513)));
  crown.position.y = 0.22;
  head.add(brim, crown);

  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.025, 1.5, 5), mat(0x8b4513));
  rod.position.set(0.42, 1.0, 0.25);
  rod.rotation.set(0.5, 0, -0.5);
  const line = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.7, 3), mat(0xdddddd));
  line.position.set(0.68, 1.15, 0.75);
  const bobber = new THREE.Mesh(new THREE.SphereGeometry(0.045, 7, 5), mat(0xff6347));
  bobber.position.set(0.68, 0.8, 0.75);
  g.add(rod, line, bobber);
  return g;
}

export function buildHippie() {
  // Purple shirt, jeans, long hair, red headband, round glasses,
  // sketchbook — face covered by a matching red-orange bandana
  const g = buildHumanoid({ torso: 0x9370db, legs: 0x4169e1, shoes: 0xc8a878, hair: 0x8b7355 });
  const { head } = g.userData.parts;

  // (theta 0 is +z in CylinderGeometry, so start past the face and wrap
  // around the back, leaving a 0.6PI gap centered on the front)
  const mane = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.26, 0.42, 10, 1, true,
      Math.PI * 0.3, Math.PI * 1.4),
    new THREE.MeshLambertMaterial({ color: 0x8b7355, side: THREE.DoubleSide }));
  mane.position.set(0, -0.12, 0);
  head.add(mane);

  const band = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 6, 14), mat(0xff6347));
  band.position.y = 0.09;
  band.rotation.x = Math.PI / 2;
  head.add(band);

  for (const side of [-1, 1]) {
    const lens = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 5, 10), mat(0x333333));
    lens.position.set(side * 0.075, 0.05, 0.185);
    head.add(lens);
  }

  // Bandana: masked upper part + hanging triangle
  addMask(head, 0xff6347);
  const kerchief = new THREE.Mesh(new THREE.ConeGeometry(0.115, 0.18, 4), mat(0xff6347));
  kerchief.position.set(0, -0.2, 0.1);
  kerchief.rotation.set(Math.PI, Math.PI / 4, 0); // apex down — hanging point
  kerchief.scale.z = 0.5;
  head.add(kerchief);

  const book = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.03, 0.32), mat(0xf5f0dc));
  book.position.set(-0.32, 0.5, 0.12);
  book.rotation.z = 0.3;
  const cover = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.015, 0.33), mat(0x8b5a2b));
  cover.position.set(-0.33, 0.48, 0.12);
  cover.rotation.z = 0.3;
  const pencil = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 5), mat(0xffc832));
  pencil.position.set(0.32, 0.5, 0.1);
  pencil.rotation.x = 0.9;
  g.add(book, cover, pencil);
  return g;
}

export function buildKid() {
  // Orange tee, backwards cap, jeans, arms up — light blue disposable
  // mask, slightly askew (kid energy)
  const g = buildHumanoid({ torso: 0xffa500, legs: 0x4169e1, shoes: 0x654321, hair: 0x654321, scale: 0.65 });
  const { head, armL, armR, handL, handR } = g.userData.parts;

  armL.rotation.z = 2.5;
  armL.position.y = 0.82;
  armR.rotation.z = -2.5;
  armR.position.y = 0.82;
  handL.position.y = 1.0;
  handR.position.y = 1.0;

  const crown = shadow(new THREE.Mesh(
    new THREE.SphereGeometry(0.215, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.45), mat(0xff8c00)));
  crown.position.y = 0.04;
  const brim = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.14), mat(0xff8c00));
  brim.position.set(0, 0.1, -0.22);
  brim.rotation.x = 0.25;
  head.add(crown, brim);

  const mask = addMask(head, 0x87ceeb);
  mask.rotation.z = 0.12; // a little crooked, as kids' masks are
  return g;
}

export function buildParent() {
  // The mother: olive top, jeans, sun hat, shoulder-length hair,
  // coffee in hand, soft white mask
  const g = buildHumanoid({ torso: 0x6b8e23, legs: 0x2c5aa0, shoes: 0x1a1a1a, hair: 0x3b2412 });
  const { head } = g.userData.parts;

  // Shoulder-length hair falling around the back of the head
  const bob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.215, 0.24, 0.34, 10, 1, true,
      Math.PI * 0.35, Math.PI * 1.3),
    new THREE.MeshLambertMaterial({ color: 0x3b2412, side: THREE.DoubleSide }));
  bob.position.y = -0.1;
  head.add(bob);

  // Wide-brim sun hat (her sprite's #4a4a4a hat, made summery)
  const hatBrim = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.035, 12), mat(0x4a4a4a)));
  hatBrim.position.y = 0.12;
  const hatCrown = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.13, 10), mat(0x4a4a4a)));
  hatCrown.position.y = 0.19;
  head.add(hatBrim, hatCrown);

  addMask(head, 0xf5f0e6);

  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.038, 0.1, 8), mat(0xf5f0e6));
  cup.position.set(0.32, 0.52, 0.08);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.02, 8), mat(0x8b4513));
  lid.position.set(0.32, 0.58, 0.08);
  g.add(cup, lid);
  return g;
}

export function buildDog() {
  // Golden retriever: cream belly, floppy ears, red collar with gold tag
  const g = new THREE.Group();
  const coat = 0xdaa520, cream = 0xf0e68c, dark = 0xb8860b;

  const body = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.32, 0.62), mat(coat)));
  body.position.set(0, 0.36, -0.08);
  const belly = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.44), mat(cream));
  belly.position.set(0, 0.24, -0.08);
  g.add(body, belly);

  const head = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.28, 0.26), mat(coat)));
  head.position.set(0, 0.62, 0.24);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.14), mat(cream));
  snout.position.set(0, -0.06, 0.17);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), mat(0x1a1a1a));
  nose.position.set(0, -0.02, 0.25);
  const tongue = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.015, 0.12), mat(0xff8da1));
  tongue.position.set(0.03, -0.125, 0.2);
  tongue.rotation.x = 0.35;
  addEyes(head, { y: 0.06, spread: 0.08, size: 0.035, forward: 0.13 });
  head.add(snout, nose, tongue);

  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.2, 0.12), mat(dark));
    ear.position.set(side * 0.17, 0.02, 0);
    ear.rotation.z = side * 0.25;
    head.add(ear);
  }
  g.add(head);

  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 10), mat(0xdc143c));
  collar.position.set(0, 0.5, 0.22);
  collar.rotation.x = 0.3;
  const tag = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), mat(0xffd700));
  tag.position.set(0, 0.44, 0.32);
  g.add(collar, tag);

  const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.24, 5);
  for (const [x, z] of [[-0.11, 0.12], [0.11, 0.12], [-0.11, -0.28], [0.11, -0.28]]) {
    const leg = shadow(new THREE.Mesh(legGeo, mat(coat)));
    leg.position.set(x, 0.12, z);
    const paw = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.11), mat(dark));
    paw.position.set(x, 0.025, z + 0.02);
    g.add(leg, paw);
  }
  const tail = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.05, 0.34, 5), mat(coat)));
  tail.position.set(0, 0.52, -0.42);
  tail.rotation.x = -0.9;
  tail.name = 'tail';
  g.add(tail);
  return g;
}

export function buildSquirrel() {
  // Sienna coat, cream belly, smooth S-curved tail, ears, acorn in paws
  const g = new THREE.Group();
  const coat = 0xa0522d, cream = 0xd2a679, tailC = 0x8b6914;

  const body = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.15, 9, 7), mat(coat)));
  body.position.set(0, 0.15, 0);
  body.scale.set(1, 1.15, 1.1);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), mat(cream));
  belly.position.set(0, 0.15, 0.08);
  belly.scale.set(0.85, 1.1, 0.7);
  g.add(body, belly);

  const head = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.11, 9, 7), mat(coat)));
  head.position.set(0, 0.36, 0.05);
  addEyes(head, { y: 0.03, spread: 0.055, size: 0.024, forward: 0.09 });
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.05, 7, 5), mat(cream));
  muzzle.position.set(0, -0.02, 0.09);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 5, 4), mat(0x2c1810));
  nose.position.set(0, 0, 0.13);
  head.add(muzzle, nose);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.08, 6), mat(coat));
    ear.position.set(side * 0.07, 0.11, 0);
    head.add(ear);
  }
  g.add(head);

  // Smooth S-curve tail: one tube along a spline, thicker mid-section
  // suggested by a soft sphere, tapered tip
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.06, -0.12),
    new THREE.Vector3(0, 0.18, -0.2),
    new THREE.Vector3(0, 0.32, -0.19),
    new THREE.Vector3(0, 0.44, -0.1),
    new THREE.Vector3(0, 0.5, 0.01)
  ]);
  const tail = new THREE.Group();
  const tube = shadow(new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 16, 0.07, 8, false), mat(tailC)));
  const mid = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.095, 9, 7), mat(tailC)));
  mid.position.set(0, 0.32, -0.19);
  mid.scale.set(0.95, 1.25, 1);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), mat(tailC));
  tip.position.set(0, 0.5, 0.01);
  tail.add(tube, mid, tip);
  tail.name = 'tail';
  g.add(tail);

  const acorn = new THREE.Mesh(new THREE.SphereGeometry(0.04, 7, 5), mat(0xc8a038));
  acorn.position.set(0, 0.24, 0.15);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.042, 0.025, 7), mat(0x654321));
  cap.position.set(0, 0.275, 0.15);
  g.add(acorn, cap);
  return g;
}

export function buildBird() {
  // A robin, like the sprite: brown back, tomato-red breast, orange beak/legs
  const g = new THREE.Group();

  const body = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.12, 9, 7), mat(0x8b4513)));
  body.scale.set(1, 1.05, 1.25);
  const breast = new THREE.Mesh(new THREE.SphereGeometry(0.095, 8, 6), mat(0xff6347));
  breast.position.set(0, -0.03, 0.06);
  breast.scale.set(0.9, 1, 0.9);
  g.add(body, breast);

  const head = shadow(new THREE.Mesh(new THREE.SphereGeometry(0.085, 9, 7), mat(0x8b4513)));
  head.position.set(0, 0.11, 0.09);
  addEyes(head, { y: 0.02, spread: 0.05, size: 0.02, forward: 0.065 });
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.09, 5), mat(0xffa500));
  beak.position.set(0, -0.005, 0.11);
  beak.rotation.x = Math.PI / 2;
  head.add(beak);
  g.add(head);

  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.16), mat(0x654321));
    wing.position.set(side * 0.13, 0.03, -0.02);
    wing.rotation.z = side * 0.15;
    wing.name = side === -1 ? 'wingL' : 'wingR';
    g.add(wing);
  }
  const tailF = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.18), mat(0x654321));
  tailF.position.set(0, 0.02, -0.2);
  tailF.rotation.x = -0.25;
  g.add(tailF);

  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 4), mat(0xff8c00));
    leg.position.set(side * 0.035, -0.13, 0.02);
    g.add(leg);
  }
  return g;
}

export function buildCoffeeCart() {
  // A little coffee shack: wooden kiosk with a service window, striped
  // awning, COFFEE sign — the barista inside is masked and capped, mostly
  // in shadow, but you know he's there.
  const g = new THREE.Group();
  const wood = 0x8b4513, woodDark = 0x6b3410, trim = 0xa0522d;

  // Walls: back, sides, and a front counter wall with a window opening
  // above. Kiosk proportions: wide and squat, not a monolith.
  const back = shadow(new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.5, 0.06), mat(wood)));
  back.position.set(0, 0.75, -0.45);
  const sideL = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.5, 0.9), mat(woodDark)));
  sideL.position.set(-0.77, 0.75, 0);
  const sideR = sideL.clone();
  sideR.position.x = 0.77;
  const front = shadow(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.85, 0.06), mat(wood)));
  front.position.set(0, 0.425, 0.45);
  // Header above the window
  const header = shadow(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.22, 0.06), mat(wood)));
  header.position.set(0, 1.39, 0.45);
  g.add(back, sideL, sideR, front, header);

  // Dark back panel behind the barista (so the window reads as a dim
  // interior without swallowing him)
  const interior = new THREE.Mesh(new THREE.BoxGeometry(1.48, 1.4, 0.03),
    new THREE.MeshBasicMaterial({ color: 0x241408 }));
  interior.position.set(0, 0.72, -0.35);
  g.add(interior);

  // Service counter at the window sill
  const counter = shadow(new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.07, 0.34), mat(0xd8c8a8)));
  counter.position.set(0, 0.88, 0.47);
  g.add(counter);

  // Sloped roof with a slight overhang
  const roof = shadow(new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.07, 1.25), mat(woodDark)));
  roof.position.set(0, 1.56, -0.02);
  roof.rotation.x = -0.1;
  g.add(roof);

  // Striped awning over the window
  for (let i = 0; i < 6; i++) {
    const stripe = shadow(new THREE.Mesh(new THREE.BoxGeometry(0.267, 0.04, 0.5),
      mat(i % 2 ? 0xf5f0e6 : 0xcc4444)));
    stripe.position.set(-0.667 + i * 0.267, 1.3, 0.7);
    stripe.rotation.x = 0.5;
    g.add(stripe);
  }

  // COFFEE sign on the header
  const signCanvas = document.createElement('canvas');
  signCanvas.width = 128; signCanvas.height = 32;
  const sctx = signCanvas.getContext('2d');
  sctx.fillStyle = '#5a3a1a';
  sctx.fillRect(0, 0, 128, 32);
  sctx.fillStyle = '#ffe9b0';
  sctx.font = 'bold 20px monospace';
  sctx.textAlign = 'center';
  sctx.textBaseline = 'middle';
  sctx.fillText('COFFEE', 64, 17);
  // Rooftop sign on two little posts
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.2, 0.04),
    [mat(0x5a3a1a), mat(0x5a3a1a), mat(0x5a3a1a), mat(0x5a3a1a),
     new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(signCanvas) }), mat(0x5a3a1a)]);
  sign.position.set(0, 1.78, 0.3);
  g.add(sign);
  for (const side of [-1, 1]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 5), mat(woodDark));
    post.position.set(side * 0.35, 1.63, 0.3);
    g.add(post);
  }

  // Menu board on the side wall
  const menu = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.38), mat(0x2c2c2c));
  menu.position.set(0.8, 1.0, 0.05);
  g.add(menu);

  // Cups on the counter
  for (const [x, z] of [[-0.6, 0.45], [-0.47, 0.51], [-0.54, 0.39]]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.036, 0.11, 8), mat(0xf5f0e6));
    cup.position.set(x, 0.97, z);
    g.add(cup);
  }

  // The barista, framed in the window: cap pulled low, black mask,
  // eyes catching the light — you know he's there
  const barista = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.5, 0.24), mat(0x5a3a22));
  torso.position.y = 0.85;
  const apron = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.4, 0.03), mat(0xcfc5ae));
  apron.position.set(0, 0.87, 0.13);
  const bHead = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 9), mat(0xc9a175));
  bHead.position.y = 1.08; // framed in the service window (0.88–1.28)
  addEyes(bHead, { y: 0.03, spread: 0.065, size: 0.028, forward: 0.14 });
  const bMask = new THREE.Mesh(new THREE.SphereGeometry(0.125, 10, 8), mat(0x2c2c2c));
  bMask.scale.set(0.95, 0.6, 0.56);
  bMask.position.set(0, -0.065, 0.095);
  bHead.add(bMask);
  const bCap = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.185, 0.09, 10), mat(0x2c2c2c));
  bCap.position.y = 0.1;
  const bBrim = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.12), mat(0x2c2c2c));
  bBrim.position.set(0, 0.06, 0.18);
  bHead.add(bCap, bBrim);
  barista.add(torso, apron, bHead);
  barista.position.set(0.08, 0, 0.02);
  g.add(barista);

  return g;
}

export function buildLadybug() {
  // Small and unmistakably a ladybug: red dome with a black wing seam,
  // black head with white eye-dots, antennae, spots on the shell
  const g = new THREE.Group();

  const leaf = new THREE.Mesh(new THREE.CircleGeometry(0.28, 8), mat(0x55aa44));
  leaf.rotation.x = -Math.PI / 2;
  leaf.position.y = 0.015;
  leaf.scale.set(1, 1.5, 1);
  const stemV = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 4), mat(0x3d7a30));
  stemV.rotation.x = Math.PI / 2;
  stemV.position.set(0, 0.012, -0.44);
  g.add(leaf, stemV);

  // Body: red dome, slightly oval
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 9, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xcc1111));
  dome.scale.set(1, 0.85, 1.25);
  dome.position.y = 0.02;
  g.add(dome);

  // Wing seam down the middle of the shell
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.09, 0.2), mat(0x1a1a1a));
  seam.position.set(0, 0.045, -0.015);
  g.add(seam);

  // Head: black half-sphere tucked at the front, with white eye dots
  const bugHead = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), mat(0x1a1a1a));
  bugHead.position.set(0, 0.035, 0.115);
  bugHead.scale.set(1.15, 0.8, 0.9);
  for (const side of [-1, 1]) {
    const eyeDot = new THREE.Mesh(new THREE.SphereGeometry(0.011, 5, 4), mat(0xffffff));
    eyeDot.position.set(side * 0.026, 0.02, 0.035);
    bugHead.add(eyeDot);
  }
  g.add(bugHead);

  // Antennae
  for (const side of [-1, 1]) {
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 4), mat(0x1a1a1a));
    antenna.position.set(side * 0.025, 0.08, 0.15);
    antenna.rotation.set(0.7, 0, side * -0.5);
    g.add(antenna);
  }

  // Spots sitting on the dome surface, three per side
  const spotGeo = new THREE.SphereGeometry(0.018, 6, 4);
  for (const [x, y, z] of [
    [-0.05, 0.075, 0.04], [0.05, 0.075, 0.04],
    [-0.06, 0.06, -0.05], [0.06, 0.06, -0.05],
    [-0.035, 0.085, -0.01], [0.035, 0.085, -0.01]
  ]) {
    const spot = new THREE.Mesh(spotGeo, mat(0x1a1a1a));
    spot.scale.y = 0.5;
    spot.position.set(x, y, z);
    g.add(spot);
  }

  g.name = 'ladybug';
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
