// Area/environment rendering - drawCompleteArea and all 6 area renderers

import { state } from '../game/state.js';
import { inventory } from '../systems/inventory.js';
import {
  drawGroundTexture, drawTree, drawLargeTree, drawCamperdownElm, drawFlowers, drawRock, drawNPC,
  drawBoy, drawGate, drawLogs, drawLeafPile, drawLadybug,
  drawNavigationIndicator, drawButterfly, drawFirefly
} from './sprites.js';

let ctx;
let canvasWidth, canvasHeight;

export function setContext(canvasCtx, w, h) {
  ctx = canvasCtx;
  canvasWidth = w;
  canvasHeight = h;
}

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

    // Bird feeder near coffee cart
    const bfX = 130, bfY = 75;
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
    // Seeds on tray
    if (!worldItems.birdseed.collected) {
      ctx.fillStyle = '#daa520';
      for (let i = 0; i < 8; i++) {
        ctx.fillRect(
          bfX + 1 + (i % 4) * 5,
          bfY - 3 + Math.floor(i / 4) * 3,
          3, 2
        );
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

    drawNPC(npcs.kid, npcs.kid.x, npcs.kid.y);
    drawNPC(npcs.parent, npcs.parent.x, npcs.parent.y);

    drawNavigationIndicator(320, 30, 'up', 'Park');

  } else if (area === 'gate_area') {
    // Dense tree line across the top (blocking north except log corridor)
    drawTree(20, -10);
    drawTree(80, 0);
    drawTree(150, -5);
    drawTree(210, 5);
    // Gap at ~270-320 where logs block the path to woods
    drawTree(360, -5);
    drawTree(420, 0);
    drawTree(480, -10);
    drawTree(550, 5);

    // Trees in the main area
    drawTree(100, 150);
    drawTree(200, 320);
    drawTree(500, 350);

    // Stone walls forming gated corner (upper-right)
    ctx.fillStyle = '#808080';
    // Vertical wall on right side (extends full height)
    for (let y = 0; y < 240; y += 16) {
      ctx.fillRect(canvasWidth - 60 + ((y * 7) % 8), y + ((y * 13) % 8), 14, 14);
    }
    // Horizontal wall across top-right
    for (let x = 380; x < canvasWidth; x += 16) {
      ctx.fillRect(x + ((x * 11) % 8), 60 + ((x * 5) % 8), 14, 14);
    }
    // Left connecting wall (extends down to gate)
    for (let y = 60; y < 180; y += 16) {
      ctx.fillRect(380 + ((y * 9) % 8), y + ((y * 7) % 8), 14, 14);
    }

    // Acorns scattered in gated area (visible until squirrel completes)
    if (!npcs.squirrel.completed) {
      ctx.fillStyle = '#8b4513';
      const acornPositions = [[500, 100], [550, 120], [520, 150], [480, 130], [560, 160]];
      acornPositions.forEach(([ax, ay]) => {
        ctx.fillRect(ax, ay, 4, 6);
        ctx.fillRect(ax + 1, ay - 2, 2, 2);
      });
    }

    drawGate(380, 140);

    // Logs blocking north exit to woods (inside the corridor gap)
    drawLogs(290, 20);

    drawLeafPile(150, 250);
    drawLeafPile(450, 300);
    drawLeafPile(220, 380);

    // Leaf pile inside gated area (squirrel rummages here)
    drawLeafPile(500, 120);

    // Bird NPC (flying back and forth when not stopped)
    const birdX = state.birdStopped ? npcs.bird.x : npcs.bird.x + Math.sin(state.frameCount * 0.02) * 60;
    const birdY = state.birdStopped ? npcs.bird.y : npcs.bird.y + Math.sin(state.frameCount * 0.03) * 8;
    drawNPC(npcs.bird, birdX, birdY);

    // Squirrel — animates running inside after gate unlock
    if (!npcs.squirrel.completed) {
      let sqX = npcs.squirrel.x, sqY = npcs.squirrel.y;
      if (state.gateUnlocked) {
        if (state.squirrelRunPhase >= 0 && state.squirrelRunPhase <= 60) {
          // Interpolate from start position to inside gated area
          const p = state.squirrelRunPhase / 60;
          sqX = npcs.squirrel.x + (500 - npcs.squirrel.x) * p;
          sqY = npcs.squirrel.y + (140 - npcs.squirrel.y) * p;
        } else {
          // Run complete or loaded from save — already inside
          sqX = 500; sqY = 140;
        }
      }
      drawNPC(npcs.squirrel, sqX, sqY);
    }

    drawNavigationIndicator(30, 240, 'left', 'Boathouse');
    if (state.logsCleared) {
      drawNavigationIndicator(290, 30, 'up', 'Woods');
    }

  } else if (area === 'woods') {
    ctx.fillStyle = '#6b8e23';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Dense forest floor texture
    for (let i = 0; i < 40; i++) {
      const x = (i * 137) % canvasWidth;
      const y = (i * 219) % canvasHeight;
      ctx.fillStyle = i % 3 === 0 ? '#5a7c1f' : '#6a8e2a';
      ctx.fillRect(x, y, 4, 4);
    }

    // Leaf piles scattered through woods
    drawLeafPile(120, 160);
    drawLeafPile(380, 280);
    drawLeafPile(500, 380);
    drawLeafPile(60, 400);
    drawLeafPile(280, 100);

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

    // Mushrooms near fallen logs
    ctx.fillStyle = '#cd5c5c';
    ctx.fillRect(55, 245, 4, 4);
    ctx.fillStyle = '#deb887';
    ctx.fillRect(56, 249, 2, 3);
    ctx.fillStyle = '#cd5c5c';
    ctx.fillRect(115, 255, 3, 3);
    ctx.fillStyle = '#deb887';
    ctx.fillRect(116, 258, 1, 2);

    // Dense trees
    drawTree(80, 80);
    drawTree(200, 100);
    drawTree(150, 300);
    drawTree(500, 250);
    drawTree(550, 100);
    drawTree(320, 180);
    drawTree(420, 360);
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
        // Slowly flies away
        const p = (state.woodsSightingPhase - 40) / 110;
        lbX = 200 + p * 250;
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

    // Bridge/dock from bottom edge to land
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(305, 280, 40, canvasHeight - 280);
    // Planks
    ctx.fillStyle = '#a0522d';
    for (let by = 285; by < canvasHeight; by += 12) {
      ctx.fillRect(307, by, 36, 5);
    }
    // Railings
    ctx.fillStyle = '#654321';
    ctx.fillRect(305, 280, 3, canvasHeight - 280);
    ctx.fillRect(342, 280, 3, canvasHeight - 280);
    // Railing posts
    for (let by = 290; by < canvasHeight; by += 40) {
      ctx.fillRect(303, by, 4, 8);
      ctx.fillRect(343, by, 4, 8);
    }

    // Boathouse building
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(480, 200, 120, 100);
    ctx.fillStyle = '#654321';
    ctx.fillRect(490, 220, 100, 60);

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
