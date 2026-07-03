// Low-poly character mesh builders (primitives only, no external assets).
// Colors match each character's 8-bit sprite palette (src/rendering/sprites.js)
// so the cast reads as the same people, one dimension up.

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

function addEyes(head, { y = 0.04, spread = 0.075, size = 0.032, forward = 0.17 } = {}) {
  const geo = new THREE.SphereGeometry(size, 6, 5);
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(geo, mat(0x1a1a1a));
    eye.position.set(side * spread, y, forward);
    head.add(eye);
  }
}

// --- Shared humanoid rig ------------------------------------------------

function buildHumanoid({ skin = 0xffd1a3, torso = 0x4477cc, legs = 0x2c5aa0,
                          shoes = 0x654321, hair = 0x442200, dress = false,
                          scale = 1 } = {}) {
  const g = new THREE.Group();
  const parts = {};

  if (dress) {
    const dressMesh = shadow(new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.78, 8), mat(torso)));
    dressMesh.position.y = 0.5;
    g.add(dressMesh);
    parts.torso = dressMesh;
    // Little shoes peeking out
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
    const arm = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.4, 6), mat(torso)));
    arm.position.set(side * (dress ? 0.24 : 0.27), 0.68, 0);
    arm.rotation.z = side * -0.22;
    g.add(arm);
    parts[side === -1 ? 'armL' : 'armR'] = arm;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), mat(skin));
    hand.position.set(side * (dress ? 0.29 : 0.32), 0.47, 0);
    g.add(hand);
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
  // Pink dress, brown pigtails, ladybug-red bow — palette from drawPlayer
  const g = buildHumanoid({ torso: 0xff69b4, hair: 0x8b4513, dress: true, shoes: 0x654321 });
  const { head } = g.userData.parts;

  // Dress highlight stripe
  const hem = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.345, 0.09, 8), mat(0xff8dc7));
  hem.position.y = 0.18;
  g.add(hem);

  // Pigtails: two-sphere bunches low on the head
  for (const side of [-1, 1]) {
    const a = new THREE.Mesh(new THREE.SphereGeometry(0.095, 8, 6), mat(0x8b4513));
    a.position.set(side * 0.21, -0.05, -0.04);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), mat(0x8b4513));
    b.position.set(side * 0.24, -0.16, -0.05);
    head.add(a, b);
  }

  // Ladybug bow: red sphere pair with black dot
  const bow = new THREE.Group();
  for (const side of [-1, 1]) {
    const loop = new THREE.Mesh(new THREE.SphereGeometry(0.055, 7, 5), mat(0xdc143c));
    loop.scale.set(1.3, 0.8, 0.7);
    loop.position.x = side * 0.055;
    bow.add(loop);
  }
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 5), mat(0x1a1a1a));
  bow.add(knot);
  bow.position.set(0.09, 0.17, 0.06);
  bow.rotation.z = -0.4;
  head.add(bow);
  return g;
}

export function buildBoy() {
  // Steel-blue shirt, dark hair — palette from drawBoy
  const g = buildHumanoid({ torso: 0x4682b4, legs: 0x2c5aa0, shoes: 0x1a1a1a, hair: 0x2c2c2c });
  // Shirt highlight
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.12, 0.27), mat(0x5a9bd4));
  stripe.position.y = 0.76;
  g.add(stripe);
  return g;
}

// --- NPCs ------------------------------------------------------------------

export function buildFisherman() {
  // Slate vest and waders, gray beard, brown bucket hat, rod with bobber
  const g = buildHumanoid({ torso: 0x2f4f4f, legs: 0x2f4f4f, shoes: 0x654321, hair: null });
  const { head } = g.userData.parts;

  // Waders bib
  const bib = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.05), mat(0x3d5f5f));
  bib.position.set(0, 0.86, 0.13);
  g.add(bib);

  // Gray beard: flattened box hanging from the face
  const beard = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.18, 0.1), mat(0x696969));
  beard.position.set(0, -0.12, 0.13);
  head.add(beard);

  // Bucket hat
  const brim = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.05, 10), mat(0x8b4513)));
  brim.position.y = 0.12;
  const crown = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.16, 10), mat(0x8b4513)));
  crown.position.y = 0.22;
  head.add(brim, crown);

  // Fishing rod with line and bobber
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
  // Purple shirt, long brown hair, red headband, round glasses, sketchbook
  const g = buildHumanoid({ torso: 0x9370db, legs: 0x4169e1, shoes: 0xc8a878, hair: 0x8b7355 });
  const { head } = g.userData.parts;

  // Long hair: open cylinder draped around the head down to the shoulders
  // (theta 0 is +z in CylinderGeometry, so start past the face and wrap
  // around the back, leaving a 0.6PI gap centered on the front)
  const mane = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.26, 0.42, 10, 1, true,
      Math.PI * 0.3, Math.PI * 1.4),
    new THREE.MeshLambertMaterial({ color: 0x8b7355, side: THREE.DoubleSide }));
  mane.position.set(0, -0.12, 0);
  head.add(mane);

  // Red headband
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 6, 14), mat(0xff6347));
  band.position.y = 0.09;
  band.rotation.x = Math.PI / 2;
  head.add(band);

  // Round glasses
  for (const side of [-1, 1]) {
    const lens = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 5, 10), mat(0x333333));
    lens.position.set(side * 0.075, 0.04, 0.185);
    head.add(lens);
  }

  // Sketchbook in the left hand, pencil in the right
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
  // Orange tee, backwards cap, jeans — two-thirds size, arms up with joy
  const g = buildHumanoid({ torso: 0xffa500, legs: 0x4169e1, shoes: 0x654321, hair: 0x654321, scale: 0.65 });
  const { head, armL, armR } = g.userData.parts;

  // Arms thrown up
  armL.rotation.z = 2.5;
  armL.position.y = 0.82;
  armR.rotation.z = -2.5;
  armR.position.y = 0.82;
  // Move hands up with the arms
  g.children.forEach((c) => {
    if (c.geometry?.type === 'SphereGeometry' && c.position.y === 0.47 && Math.abs(c.position.x) > 0.25) {
      c.position.y = 1.0;
    }
  });

  // Backwards cap: crown + brim at the back
  const crown = shadow(new THREE.Mesh(
    new THREE.SphereGeometry(0.215, 10, 7, 0, Math.PI * 2, 0, Math.PI * 0.45), mat(0xff8c00)));
  crown.position.y = 0.04;
  const brim = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.14), mat(0xff8c00));
  brim.position.set(0, 0.1, -0.22);
  brim.rotation.x = 0.25;
  head.add(crown, brim);

  // Freckle cheeks
  for (const side of [-1, 1]) {
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), mat(0xc97a5f));
    cheek.position.set(side * 0.11, -0.03, 0.155);
    head.add(cheek);
  }
  return g;
}

export function buildParent() {
  // Olive shirt, flat cap, coffee in hand — relaxed park-watching energy
  const g = buildHumanoid({ torso: 0x6b8e23, legs: 0x2c5aa0, shoes: 0x1a1a1a, hair: 0x221100 });
  const { head } = g.userData.parts;

  // Flat cap
  const cap = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.23, 0.07, 10), mat(0x4a4a4a)));
  cap.position.y = 0.13;
  const capBrim = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.025, 0.12), mat(0x4a4a4a));
  capBrim.position.set(0, 0.1, 0.22);
  head.add(cap, capBrim);

  // Coffee cup in the right hand
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.038, 0.1, 8), mat(0xf5f0e6));
  cup.position.set(0.32, 0.52, 0.08);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.02, 8), mat(0x8b4513));
  lid.position.set(0.32, 0.58, 0.08);
  g.add(cup, lid);
  return g;
}

export function buildDog() {
  // Golden retriever palette: #daa520 coat, cream belly, floppy ears,
  // red collar with gold tag, pink tongue. Faces +z.
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

  // Floppy ears
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.2, 0.12), mat(dark));
    ear.position.set(side * 0.17, 0.02, 0);
    ear.rotation.z = side * 0.25;
    head.add(ear);
  }
  g.add(head);

  // Red collar with gold tag
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 10), mat(0xdc143c));
  collar.position.set(0, 0.5, 0.22);
  collar.rotation.x = 0.3;
  const tag = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), mat(0xffd700));
  tag.position.set(0, 0.44, 0.32);
  g.add(collar, tag);

  // Legs + tail
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
  // Sienna coat, cream belly, big S-curved tail, ears, acorn in paws
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

  // Big S-curve tail: arc of shrinking spheres behind the body
  const tail = new THREE.Group();
  const arc = [
    [0, 0.06, -0.14, 0.075], [0, 0.16, -0.2, 0.09], [0, 0.28, -0.21, 0.1],
    [0, 0.39, -0.16, 0.09], [0, 0.46, -0.07, 0.075], [0, 0.49, 0.02, 0.055]
  ];
  for (const [x, y, z, r] of arc) {
    const seg = shadow(new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), mat(tailC)));
    seg.position.set(x, y, z);
    tail.add(seg);
  }
  tail.name = 'tail';
  g.add(tail);

  // Little acorn held at the chest
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

  // Wings (named for the flap animation) + fanned tail feathers
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

  // Legs tucked for flight (visible when landed)
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 4), mat(0xff8c00));
    leg.position.set(side * 0.035, -0.13, 0.02);
    g.add(leg);
  }
  return g;
}

export function buildCoffeeCart() {
  // Brown cart, striped awning, COFFEE sign, cups, aproned barista
  const g = new THREE.Group();

  const cart = shadow(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.7), mat(0x8b4513)));
  cart.position.y = 0.6;
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.03), mat(0x87ceeb));
  panel.position.set(0, 0.62, 0.36);
  const counter = shadow(new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.06, 0.84), mat(0xd8c8a8)));
  counter.position.y = 1.03;
  g.add(cart, panel, counter);

  // COFFEE sign (canvas texture keeps it asset-free)
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
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.04),
    [mat(0x5a3a1a), mat(0x5a3a1a), mat(0x5a3a1a), mat(0x5a3a1a),
     new THREE.MeshLambertMaterial({ map: new THREE.CanvasTexture(signCanvas) }), mat(0x5a3a1a)]);
  sign.position.set(0, 1.28, 0.34);
  g.add(sign);

  // Umbrella pole + striped awning cone (alternating wedges)
  const pole = shadow(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6), mat(0x888888)));
  pole.position.y = 1.7;
  g.add(pole);
  const WEDGES = 8;
  for (let i = 0; i < WEDGES; i++) {
    const wedge = shadow(new THREE.Mesh(
      new THREE.ConeGeometry(1.05, 0.42, 8, 1, true, (i * Math.PI * 2) / WEDGES, (Math.PI * 2) / WEDGES),
      new THREE.MeshLambertMaterial({ color: i % 2 ? 0xf5f0e6 : 0xcc4444, side: THREE.DoubleSide })));
    wedge.position.y = 2.3;
    g.add(wedge);
  }

  // Cups on the counter
  for (const [x, z] of [[-0.45, 0.2], [-0.33, 0.28], [-0.39, 0.1]]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.036, 0.11, 8), mat(0xf5f0e6));
    cup.position.set(x, 1.11, z);
    g.add(cup);
  }

  // Barista: warm brown shirt + cream apron, behind the cart
  const barista = buildHumanoid({ torso: 0x8b5a2b, legs: 0x333333, shoes: 0x1a1a1a, hair: 0x111111, scale: 0.92 });
  const apron = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.04), mat(0xf5f0dc));
  apron.position.set(0, 0.62, 0.15);
  barista.add(apron);
  barista.position.set(0.1, 0, -0.62);
  g.add(barista);
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
