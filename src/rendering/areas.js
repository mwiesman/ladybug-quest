// Area/environment rendering - drawCompleteArea and all 6 area renderers

import { state } from '../game/state.js';
import { inventory } from '../systems/inventory.js';
import { getBirdPosition } from '../systems/interaction.js';
import {
  drawGroundTexture, drawTree, drawFallTree, drawLargeTree, drawCamperdownElm, drawFlowers, drawRock, drawNPC,
  drawBoy, drawGate, drawLogs, drawLeafPile, drawAcorn, drawLadybug,
  drawNavigationIndicator, drawButterfly, drawFirefly
} from './sprites.js';

let ctx;
let canvasWidth, canvasHeight;

// Offscreen canvas cache for woods floor texture (deterministic, rendered once)
let woodsFloorCache = null;

export function setContext(canvasCtx, w, h) {
  ctx = canvasCtx;
  canvasWidth = w;
  canvasHeight = h;
}

/**
 * Draw the full environment for the given area (ground, trees, NPCs, items, nav arrows).
 * @param {string} area - Area ID ('meadow', 'park', 'playground', 'gate_area', 'woods', 'boathouse')
 * @param {boolean} skipBoy - If true, skip drawing the boy (used in intro/ending where boy is drawn manually)
 */
export function drawCompleteArea(area, skipBoy) {
  const npcs = state.npcs;
  const worldItems = state.worldItems;

  drawGroundTexture(canvasWidth, canvasHeight);

  if (area === 'meadow') {
    drawLargeTree(220, 100);
    drawTree(80, 100);
    drawTree(480, 120);
    drawTree(50, 380);
    if (!skipBoy) drawBoy(state.boy.x, state.boy.y);

    drawFlowers(100, 350, '#ff69b4');
    drawFlowers(180, 370, '#ffa500');
    drawFlowers(260, 360, '#ffff00');
    drawFlowers(340, 375, '#ff1493');
    drawFlowers(420, 365, '#ff6347');
    drawFlowers(150, 330, '#ff69b4');
    drawFlowers(500, 380, '#ffa500');
    drawFlowers(140, 200, '#ff6347');
    drawFlowers(400, 260, '#ffff00');

    drawRock(120, 280);
    drawRock(480, 320);

    // Butterflies drifting through the meadow
    drawButterfly(200, 300, state.frameCount);
    drawButterfly(450, 250, state.frameCount);
    drawButterfly(350, 340, state.frameCount);

    // Ladybug resting on a leaf near the tree (only visible when player has Net)
    if (!state.ladybug.found && inventory.hasItem('Net')) {
      // Draw simple green leaf
      ctx.fillStyle = '#228b22';
      ctx.beginPath();
      ctx.ellipse(state.ladybug.x, state.ladybug.y - 5, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1a5012';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(state.ladybug.x, state.ladybug.y - 10);
      ctx.lineTo(state.ladybug.x, state.ladybug.y);
      ctx.stroke();

      drawLadybug(state.ladybug.x, state.ladybug.y);
    }

    ctx.fillStyle = '#d2b48c';
    for (let y = 150; y < 300; y += 20) {
      ctx.fillRect(canvasWidth - 60, y, 30, 10);
    }

    drawNavigationIndicator(canvasWidth - 30, 240, 'right', 'Park');

  } else if (area === 'park') {
    drawTree(50, 50);
    drawTree(400, 80);
    drawTree(500, 300);
    drawTree(150, 380);

    ctx.fillStyle = '#d2b48c';
    ctx.fillRect(0, 140, canvasWidth, 60);
    ctx.fillStyle = '#c9a876';
    for (let x = 0; x < canvasWidth; x += 40) {
      ctx.fillRect(x + 10, 160, 20, 20);
    }

    ctx.fillStyle = '#8b4513';
    ctx.fillRect(250, 90, 40, 8);
    ctx.fillRect(256, 82, 4, 8);
    ctx.fillRect(280, 82, 4, 8);
    ctx.fillRect(450, 250, 40, 8);
    ctx.fillRect(456, 242, 4, 8);
    ctx.fillRect(480, 242, 4, 8);

    drawFlowers(240, 110, '#ff69b4');
    drawFlowers(300, 110, '#ffa500');
    drawFlowers(440, 270, '#ff1493');
    drawFlowers(500, 270, '#ffff00');
    drawFlowers(80, 350, '#ff6347');
    drawFlowers(560, 380, '#ffa500');
    drawFlowers(180, 90, '#ffff00');

    // Butterflies in the park
    drawButterfly(300, 250, state.frameCount);
    drawButterfly(120, 300, state.frameCount);

    drawNPC(npcs.coffeeCart, npcs.coffeeCart.x, npcs.coffeeCart.y);
    drawNPC(npcs.hippie, npcs.hippie.x, npcs.hippie.y);
    drawNPC(npcs.dog, npcs.dog.x, npcs.dog.y);

    // Bird feeder near bench (up and to the right of coffee cart)
    const bfX = 200, bfY = 65;
    // Post
    ctx.fillStyle = '#654321';
    ctx.fillRect(bfX + 8, bfY, 4, 30);
    // Tray
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(bfX - 2, bfY - 4, 24, 5);
    // Tray rim
    ctx.fillStyle = '#654321';
    ctx.fillRect(bfX - 3, bfY - 5, 1, 6);
    ctx.fillRect(bfX + 22, bfY - 5, 1, 6);
    // Roof
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(bfX - 4, bfY - 14, 28, 3);
    ctx.fillRect(bfX, bfY - 17, 20, 3);
    // Roof post
    ctx.fillRect(bfX + 9, bfY - 14, 2, 10);
    // Seeds on tray (with sparkle when available)
    if (!worldItems.birdseed.collected) {
      ctx.fillStyle = '#daa520';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(
          bfX + 1 + (i % 4) * 5,
          bfY - 3 + Math.floor(i / 4) * 3,
          3, 2
        );
      }
      // Sparkle to draw attention
      const sparkle = Math.sin(state.frameCount * 0.1) > 0.3;
      if (sparkle) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(bfX + 2, bfY - 6, 2, 2);
        ctx.fillRect(bfX + 18, bfY - 3, 2, 2);
      }
    }

    drawNavigationIndicator(30, 240, 'left', 'Meadow');
    drawNavigationIndicator(320, 30, 'up', 'Boathouse');
    drawNavigationIndicator(320, canvasHeight - 30, 'down', 'Playground');

  } else if (area === 'playground') {
    ctx.fillStyle = '#ff6347';
    ctx.fillRect(300, 200, 80, 60);
    ctx.fillStyle = '#ffa500';
    ctx.fillRect(310, 210, 20, 40);
    ctx.fillRect(350, 210, 20, 40);

    ctx.fillStyle = '#2c5aa0';
    ctx.fillRect(450, 250, 60, 8);
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(460, 250);
    ctx.lineTo(470, 280);
    ctx.moveTo(490, 250);
    ctx.lineTo(500, 280);
    ctx.stroke();

    ctx.fillStyle = '#f4a460';
    ctx.fillRect(100, 350, 120, 80);
    ctx.fillStyle = '#e6a45f';
    for (let i = 0; i < 10; i++) {
      ctx.fillRect(110 + Math.random() * 100, 360 + Math.random() * 60, 8, 8);
    }

    for (let i = 0; i < 15; i++) {
      drawFlowers(
        50 + Math.random() * 540,
        50 + Math.random() * 130,
        ['#ff69b4', '#ffa500', '#ffff00'][Math.floor(Math.random() * 3)]
      );
    }

    // Kid runs toward player when parent is talked to (interpolates over 40 frames)
    let kidX = npcs.kid.x, kidY = npcs.kid.y;
    if (state.kidRunPhase >= 0 && state.kidRunTargetX > 0) {
      const p = Math.min(state.kidRunPhase / 40, 1);
      kidX = npcs.kid.x + (state.kidRunTargetX - npcs.kid.x) * p;
      kidY = npcs.kid.y + (state.kidRunTargetY - npcs.kid.y) * p;
    }
    drawNPC(npcs.kid, kidX, kidY);
    drawNPC(npcs.parent, npcs.parent.x, npcs.parent.y);

    drawNavigationIndicator(320, 30, 'up', 'Park');

  } else if (area === 'gate_area') {
    // Dense tree line across the top — mix of green and fall colors
    drawTree(20, -10);
    drawFallTree(80, 0);
    drawTree(150, -5);
    drawFallTree(210, 5);
    // Gap at ~270-320 where logs block the path to woods
    drawFallTree(360, -5);
    drawTree(440, 0);
    drawFallTree(500, -10);
    drawFallTree(570, 5);

    // Trees in the open area (left/below fence corner)
    drawFallTree(100, 150);
    drawTree(200, 320);
    drawTree(300, 400);
    drawTree(550, 380);

    // Trees inside the gated corner (x>400, y<300)
    drawFallTree(480, 80);   // Acorn tree — squirrel destination
    drawFallTree(560, 180);

    // L-shaped fence: vertical at x=400 (y=50 to y=300) + horizontal at y=300 (x=400 to right edge)
    // Vertical segment
    for (let fy = 50; fy < 300; fy += 40) {
      if (state.gateUnlocked && fy >= 200 && fy < 260) continue;
      ctx.fillStyle = '#000';
      ctx.fillRect(399, fy, 16, Math.min(42, 300 - fy));
      ctx.fillStyle = '#654321';
      ctx.fillRect(400, fy, 14, Math.min(40, 300 - fy));
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(401, fy + 1, 12, 4);
    }
    for (let fy = 55; fy < 300; fy += 12) {
      if (state.gateUnlocked && fy >= 200 && fy < 260) continue;
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(401, fy, 12, 3);
    }
    // Horizontal segment
    for (let fx = 400; fx < canvasWidth; fx += 40) {
      ctx.fillStyle = '#000';
      ctx.fillRect(fx, 299, Math.min(42, canvasWidth - fx), 16);
      ctx.fillStyle = '#654321';
      ctx.fillRect(fx, 300, Math.min(40, canvasWidth - fx), 14);
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(fx + 1, 301, 4, 12);
    }
    for (let fx = 405; fx < canvasWidth; fx += 12) {
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(fx, 301, 3, 12);
    }

    // Gate in the vertical fence
    drawGate(400, 215);

    // Acorns clustered under the squirrel's tree at (480, 80)
    if (!npcs.squirrel.completed) {
      const acornPositions = [[478, 115], [492, 118], [485, 125], [500, 122], [475, 128], [495, 130]];
      acornPositions.forEach(([ax, ay]) => drawAcorn(ax, ay));
    }

    // Logs blocking north exit to woods (inside the corridor gap)
    drawLogs(290, 20);

    // Leaf piles — open area
    drawLeafPile(120, 250);
    drawLeafPile(250, 380);
    drawLeafPile(80, 420);
    drawLeafPile(180, 130);
    drawLeafPile(350, 430);
    // Leaf piles — inside gated corner
    drawLeafPile(530, 130);
    drawLeafPile(570, 240);
    drawLeafPile(500, 200);

    // Bird NPC (flying back and forth when not stopped, frozen at flight position when stopped)
    const birdPos = getBirdPosition();
    drawNPC(npcs.bird, birdPos.x, birdPos.y);

    // Squirrel — animates running through gate into corner, stays inside after
    {
      let sqX = npcs.squirrel.x, sqY = npcs.squirrel.y;
      if (state.gateUnlocked) {
        const approachX = 390, approachY = 230;  // Just left of gate
        const throughX = 420, throughY = 230;     // Past the gate
        const destX = 500, destY = 120;           // Acorn tree
        if (state.squirrelRunPhase >= 0 && state.squirrelRunPhase <= 60) {
          if (state.squirrelRunPhase <= 20) {
            const p = state.squirrelRunPhase / 20;
            sqX = npcs.squirrel.x + (approachX - npcs.squirrel.x) * p;
            sqY = npcs.squirrel.y + (approachY - npcs.squirrel.y) * p;
          } else if (state.squirrelRunPhase <= 40) {
            const p = (state.squirrelRunPhase - 20) / 20;
            sqX = approachX + (throughX - approachX) * p;
            sqY = approachY + (throughY - approachY) * p;
          } else {
            const p = (state.squirrelRunPhase - 40) / 20;
            sqX = throughX + (destX - throughX) * p;
            sqY = throughY + (destY - throughY) * p;
          }
        } else {
          sqX = 500; sqY = 120;
        }
      }
      drawNPC(npcs.squirrel, sqX, sqY);
    }

    drawNavigationIndicator(30, 240, 'left', 'Boathouse');
    if (state.logsCleared) {
      drawNavigationIndicator(290, 30, 'up', 'Woods');
    }

  } else if (area === 'woods') {
    // Woods background with floor texture (cached to offscreen canvas)
    if (!woodsFloorCache) {
      woodsFloorCache = document.createElement('canvas');
      woodsFloorCache.width = canvasWidth;
      woodsFloorCache.height = canvasHeight;
      const wc = woodsFloorCache.getContext('2d');
      wc.fillStyle = '#6b8e23';
      wc.fillRect(0, 0, canvasWidth, canvasHeight);
      for (let i = 0; i < 40; i++) {
        const x = (i * 137) % canvasWidth;
        const y = (i * 219) % canvasHeight;
        wc.fillStyle = i % 3 === 0 ? '#5a7c1f' : '#6a8e2a';
        wc.fillRect(x, y, 4, 4);
      }
    }
    ctx.drawImage(woodsFloorCache, 0, 0);

    // Scattered leaves of various colors on the forest floor
    const leafColors = ['#b8450a', '#d4651e', '#e8832a', '#8b4513', '#cd5c5c', '#a0522d', '#228b22', '#6b8e23'];
    const leafPositions = [
      [45, 130], [170, 220], [300, 340], [420, 150], [530, 290],
      [90, 310], [240, 60], [380, 440], [560, 370], [150, 440],
      [470, 80], [610, 250], [330, 110], [200, 380], [500, 450],
      [70, 220], [410, 260], [280, 200], [540, 140], [360, 310]
    ];
    leafPositions.forEach(([lx, ly], i) => {
      ctx.fillStyle = leafColors[i % leafColors.length];
      ctx.fillRect(lx, ly, 4, 3);
      ctx.fillRect(lx + 2, ly + 2, 3, 2);
    });

    // Leaf piles scattered through woods
    drawLeafPile(120, 160);
    drawLeafPile(380, 280);
    drawLeafPile(500, 380);
    drawLeafPile(60, 400);
    drawLeafPile(280, 100);
    drawLeafPile(440, 200);
    drawLeafPile(180, 350);

    // Fallen logs
    ctx.fillStyle = '#654321';
    ctx.fillRect(60, 250, 50, 8);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(62, 252, 46, 4);

    ctx.fillStyle = '#654321';
    ctx.fillRect(350, 400, 40, 7);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(352, 402, 36, 3);

    ctx.fillStyle = '#654321';
    ctx.fillRect(480, 170, 45, 8);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(482, 172, 41, 4);

    // Twigs scattered on ground
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    // Twig 1 — near fallen log
    ctx.beginPath(); ctx.moveTo(120, 260); ctx.lineTo(138, 255); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(130, 253); ctx.lineTo(136, 248); ctx.stroke();
    // Twig 2 — upper area
    ctx.beginPath(); ctx.moveTo(310, 90); ctx.lineTo(325, 85); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(318, 83); ctx.lineTo(322, 78); ctx.stroke();
    // Twig 3 — near rocks
    ctx.beginPath(); ctx.moveTo(140, 370); ctx.lineTo(158, 375); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(148, 377); ctx.lineTo(155, 382); ctx.stroke();
    // Twig 4 — right side
    ctx.beginPath(); ctx.moveTo(540, 310); ctx.lineTo(555, 305); ctx.stroke();
    // Twig 5 — center
    ctx.beginPath(); ctx.moveTo(370, 230); ctx.lineTo(385, 225); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(378, 222); ctx.lineTo(383, 218); ctx.stroke();
    // Twig 6 — scattered
    ctx.beginPath(); ctx.moveTo(450, 420); ctx.lineTo(465, 415); ctx.stroke();
    // Twig 7 — near mushrooms
    ctx.beginPath(); ctx.moveTo(80, 270); ctx.lineTo(95, 268); ctx.stroke();
    // Twig 8 — bottom
    ctx.beginPath(); ctx.moveTo(260, 450); ctx.lineTo(278, 445); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(270, 443); ctx.lineTo(276, 438); ctx.stroke();

    // Mushrooms near fallen logs
    ctx.fillStyle = '#cd5c5c';
    ctx.fillRect(55, 245, 4, 4);
    ctx.fillStyle = '#deb887';
    ctx.fillRect(56, 249, 2, 3);
    ctx.fillStyle = '#cd5c5c';
    ctx.fillRect(115, 255, 3, 3);
    ctx.fillStyle = '#deb887';
    ctx.fillRect(116, 258, 1, 2);
    // Extra mushroom cluster
    ctx.fillStyle = '#cd5c5c';
    ctx.fillRect(485, 165, 3, 3);
    ctx.fillStyle = '#deb887';
    ctx.fillRect(486, 168, 1, 2);
    ctx.fillStyle = '#cd853f';
    ctx.fillRect(492, 166, 4, 3);
    ctx.fillStyle = '#deb887';
    ctx.fillRect(493, 169, 2, 2);

    // Dense trees — mix of green and 2 fall trees
    drawTree(80, 80);
    drawFallTree(200, 100);
    drawTree(150, 300);
    drawTree(500, 250);
    drawTree(550, 100);
    drawTree(320, 180);
    drawFallTree(420, 360);
    drawTree(30, 180);
    drawTree(580, 320);
    drawTree(440, 50);
    drawTree(250, 420);
    drawTree(600, 180);

    // Rocks
    drawRock(100, 350);
    drawRock(400, 380);
    drawRock(250, 160);
    drawRock(530, 420);

    // Doubloons hidden under leaves (easter egg)
    if (!worldItems.doubloons.collected) {
      ctx.fillStyle = '#ffd700';
      const dX = worldItems.doubloons.x, dY = worldItems.doubloons.y;
      ctx.fillRect(dX, dY, 5, 5);
      ctx.fillRect(dX + 7, dY + 2, 5, 5);
      ctx.fillRect(dX + 3, dY + 6, 5, 5);
      ctx.fillStyle = '#daa520';
      ctx.fillRect(dX + 1, dY + 1, 3, 3);
      ctx.fillRect(dX + 8, dY + 3, 3, 3);
      ctx.fillRect(dX + 4, dY + 7, 3, 3);
    }

    // Fireflies in the woods
    drawFirefly(130, 200, state.frameCount);
    drawFirefly(280, 280, state.frameCount);
    drawFirefly(470, 320, state.frameCount);
    drawFirefly(350, 130, state.frameCount);
    drawFirefly(550, 200, state.frameCount);
    drawFirefly(80, 350, state.frameCount);
    drawFirefly(400, 100, state.frameCount);

    // Ladybug sighting animation (first entry only)
    // Phase 0-40: ladybug sits still, 40-150: slowly flies away
    if (state.woodsSightingPhase >= 0 && state.woodsSightingPhase < 150) {
      let lbX, lbY;
      if (state.woodsSightingPhase < 40) {
        // Ladybug sits still on a leaf
        lbX = 200;
        lbY = 300;
      } else {
        // Slowly flies away with fluttering path
        const p = (state.woodsSightingPhase - 40) / 110;
        const flutter = Math.sin(state.woodsSightingPhase * 0.12) * 15;
        lbX = 200 + p * 250 + flutter;
        lbY = 300 - p * 350;
      }
      if (lbY > -20) {
        drawLadybug(lbX, lbY);
      }
      // Extra fireflies burst during sighting
      const overallP = state.woodsSightingPhase / 150;
      for (let i = 0; i < 4; i++) {
        const fx = 150 + i * 100 + Math.sin(state.frameCount * 0.03 + i) * 30;
        const fy = 250 - overallP * 200 + Math.cos(state.frameCount * 0.02 + i * 2) * 40;
        if (fy > 0) drawFirefly(fx, fy, state.frameCount + i * 50);
      }
    }

    drawNavigationIndicator(320, canvasHeight - 30, 'down', 'Gate');

  } else if (area === 'boathouse') {
    // Water
    ctx.fillStyle = '#4682b4';
    ctx.fillRect(0, 290, canvasWidth, canvasHeight - 290);

    ctx.fillStyle = '#5a9bd4';
    const wt = state.frameCount * 0.03;
    for (let x = 0; x < canvasWidth; x += 40) {
      ctx.fillRect(x, 310 + Math.sin(x * 0.1 + wt) * 10, 30, 3);
      ctx.fillRect(x + 10, 350 + Math.cos(x * 0.1 + wt * 0.8) * 10, 25, 3);
      ctx.fillRect(x + 5, 390 + Math.sin(x * 0.15 + wt * 1.2) * 8, 28, 3);
    }

    // Waterfall on far left — extends off the left edge
    const wfX = -15, wfY = 230;
    // Rock face (extends off left edge)
    ctx.fillStyle = '#696969';
    ctx.fillRect(wfX, wfY, 55, 60);
    ctx.fillStyle = '#808080';
    ctx.fillRect(wfX + 3, wfY + 3, 49, 54);
    // Rock texture
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(wfX + 8, wfY + 8, 12, 8);
    ctx.fillRect(wfX + 25, wfY + 20, 10, 6);
    ctx.fillRect(wfX + 10, wfY + 38, 14, 7);
    // Falling water streams (animated)
    ctx.fillStyle = '#87ceeb';
    for (let wy = 0; wy < 55; wy += 4) {
      const wobble = Math.sin(state.frameCount * 0.08 + wy * 0.5) * 3;
      ctx.fillRect(wfX + 15 + wobble, wfY + wy, 10, 5);
      ctx.fillRect(wfX + 28 + wobble * 0.7, wfY + wy + 2, 7, 4);
    }
    // White water highlights
    ctx.fillStyle = '#e0f0ff';
    for (let wy = 2; wy < 50; wy += 8) {
      const wobble = Math.sin(state.frameCount * 0.1 + wy * 0.3) * 2;
      ctx.fillRect(wfX + 18 + wobble, wfY + wy, 4, 3);
    }
    // Splash at base
    ctx.fillStyle = '#b0d8f0';
    const splash = Math.sin(state.frameCount * 0.1) * 3;
    ctx.fillRect(wfX + 5 + splash, wfY + 52, 40, 6);
    ctx.fillStyle = '#e0f0ff';
    ctx.fillRect(wfX + 12 - splash, wfY + 54, 20, 3);
    // Mist particles
    ctx.fillStyle = 'rgba(200, 230, 255, 0.25)';
    ctx.fillRect(wfX + 5, wfY + 48, 50, 14);
    ctx.fillStyle = 'rgba(220, 240, 255, 0.15)';
    ctx.fillRect(wfX + 20, wfY + 44, 40, 8);
    // White water runoff spreading into body of water
    ctx.fillStyle = 'rgba(200, 230, 255, 0.4)';
    const runoff1 = Math.sin(state.frameCount * 0.06) * 4;
    const runoff2 = Math.sin(state.frameCount * 0.08 + 1) * 3;
    ctx.fillRect(0, 292, 60 + runoff1, 8);
    ctx.fillRect(0, 300, 45 + runoff2, 6);
    ctx.fillRect(0, 308, 30 + runoff1 * 0.5, 4);
    // Bubbling white water effect near base
    ctx.fillStyle = 'rgba(230, 245, 255, 0.5)';
    for (let i = 0; i < 6; i++) {
      const bx = 10 + Math.sin(state.frameCount * 0.07 + i * 1.5) * 12 + i * 8;
      const by = 295 + Math.sin(state.frameCount * 0.09 + i * 2) * 5;
      ctx.fillRect(bx, by, 4, 3);
    }

    // Ducks on the water (longer, layered movement patterns)
    const t = state.frameCount;
    // Duck 1 — slow drift right-to-left with gentle wobble
    const duckX1 = 150 + Math.sin(t * 0.004) * 50 + Math.sin(t * 0.017) * 8;
    const duckY1 = 340 + Math.sin(t * 0.025) * 3;
    // Duck 2 — slow diagonal drift
    const duckX2 = 220 + Math.sin(t * 0.005 + 2.5) * 45 + Math.cos(t * 0.013) * 10;
    const duckY2 = 375 + Math.sin(t * 0.02 + 1.5) * 4 + Math.sin(t * 0.006) * 12;
    // Duck 3 (goose) — wide lazy arc
    const duckX3 = 110 + Math.sin(t * 0.003 + 4) * 60 + Math.sin(t * 0.015 + 1) * 8;
    const duckY3 = 400 + Math.sin(t * 0.022 + 3) * 3 + Math.cos(t * 0.005 + 2) * 15;
    // Duck 1
    ctx.fillStyle = '#fff';
    ctx.fillRect(duckX1, duckY1, 8, 5);
    ctx.fillStyle = '#ffa500';
    ctx.fillRect(duckX1 + 8, duckY1 + 1, 3, 2);
    ctx.fillStyle = '#000';
    ctx.fillRect(duckX1 + 6, duckY1, 1, 1);
    // Duck 2
    ctx.fillStyle = '#fff';
    ctx.fillRect(duckX2, duckY2, 8, 5);
    ctx.fillStyle = '#ffa500';
    ctx.fillRect(duckX2 + 8, duckY2 + 1, 3, 2);
    ctx.fillStyle = '#000';
    ctx.fillRect(duckX2 + 6, duckY2, 1, 1);
    // Duck 3 (goose — slightly larger, darker)
    ctx.fillStyle = '#d3d3d3';
    ctx.fillRect(duckX3, duckY3, 9, 6);
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(duckX3 + 7, duckY3 - 2, 3, 4);
    ctx.fillStyle = '#ffa500';
    ctx.fillRect(duckX3 + 9, duckY3 - 1, 3, 2);
    ctx.fillStyle = '#000';
    ctx.fillRect(duckX3 + 8, duckY3 - 2, 1, 1);

    // Log with turtle on right side of bridge
    const logX = 370, logY = 340;
    const logBob = Math.sin(t * 0.02) * 2;
    // Floating log
    ctx.fillStyle = '#654321';
    ctx.fillRect(logX, logY + logBob, 40, 8);
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(logX + 2, logY + 2 + logBob, 36, 4);
    // Bark texture
    ctx.fillStyle = '#4a2a0a';
    ctx.fillRect(logX + 8, logY + 1 + logBob, 3, 6);
    ctx.fillRect(logX + 22, logY + 1 + logBob, 3, 6);
    ctx.fillRect(logX + 34, logY + 2 + logBob, 2, 4);
    // Turtle sitting on log
    const turtleX = logX + 14, turtleY = logY - 7 + logBob;
    // Shell
    ctx.fillStyle = '#556b2f';
    ctx.fillRect(turtleX, turtleY, 12, 8);
    ctx.fillStyle = '#6b8e23';
    ctx.fillRect(turtleX + 1, turtleY + 1, 10, 6);
    // Shell pattern
    ctx.fillStyle = '#4a5c20';
    ctx.fillRect(turtleX + 3, turtleY + 2, 3, 3);
    ctx.fillRect(turtleX + 7, turtleY + 2, 3, 3);
    // Head (poking out right)
    ctx.fillStyle = '#556b2f';
    ctx.fillRect(turtleX + 12, turtleY + 2, 4, 4);
    // Eye
    ctx.fillStyle = '#000';
    ctx.fillRect(turtleX + 14, turtleY + 3, 1, 1);
    // Legs
    ctx.fillStyle = '#556b2f';
    ctx.fillRect(turtleX + 1, turtleY + 7, 3, 2);
    ctx.fillRect(turtleX + 8, turtleY + 7, 3, 2);

    // Bridge/dock from bottom edge to land (wider)
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(295, 280, 60, canvasHeight - 280);
    // Planks
    ctx.fillStyle = '#a0522d';
    for (let by = 285; by < canvasHeight; by += 12) {
      ctx.fillRect(297, by, 56, 5);
    }
    // Railings
    ctx.fillStyle = '#654321';
    ctx.fillRect(295, 280, 3, canvasHeight - 280);
    ctx.fillRect(352, 280, 3, canvasHeight - 280);
    // Railing posts
    for (let by = 290; by < canvasHeight; by += 40) {
      ctx.fillRect(293, by, 4, 8);
      ctx.fillRect(353, by, 4, 8);
    }

    // Boathouse building (white with trim)
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(480, 200, 120, 100);
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(490, 220, 100, 60);
    // Trim/outline
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(480, 200, 120, 3);
    ctx.fillRect(480, 297, 120, 3);

    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(500, 230, 30, 20);
    ctx.fillRect(550, 230, 30, 20);

    // Roof
    ctx.fillStyle = '#a0522d';
    ctx.beginPath();
    ctx.moveTo(470, 200);
    ctx.lineTo(540, 170);
    ctx.lineTo(610, 200);
    ctx.closePath();
    ctx.fill();

    // Dock at boathouse
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(420, 280, 180, 20);
    ctx.fillRect(500, 270, 4, 30);
    ctx.fillRect(540, 270, 4, 30);

    drawTree(100, 80);
    drawTree(300, 100);
    drawTree(50, 200);
    drawCamperdownElm(400, 60);

    // Reeds by water edge
    ctx.fillStyle = '#228b22';
    ctx.fillRect(160, 282, 3, 18);
    ctx.fillRect(180, 278, 3, 22);
    ctx.fillRect(80, 284, 3, 16);
    ctx.fillRect(250, 280, 3, 20);

    drawNPC(npcs.fisherman, npcs.fisherman.x, npcs.fisherman.y);

    drawNavigationIndicator(325, canvasHeight - 30, 'down', 'Park');
    drawNavigationIndicator(canvasWidth - 30, 240, 'right', 'Gate');
  }
}
