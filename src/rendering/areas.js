// Area/environment rendering - drawCompleteArea and all 6 area renderers

import { state } from '../game/state.js';
import {
  drawGroundTexture, drawTree, drawFlowers, drawRock, drawNPC,
  drawBoy, drawGate, drawLogs, drawLeafPile, drawLadybug,
  drawNavigationIndicator
} from './sprites.js';

let ctx;
let canvasWidth, canvasHeight;

export function setContext(canvasCtx, w, h) {
  ctx = canvasCtx;
  canvasWidth = w;
  canvasHeight = h;
}

export function drawCompleteArea(area) {
  const npcs = state.npcs;
  const worldItems = state.worldItems;

  drawGroundTexture(canvasWidth, canvasHeight);

  if (area === 'meadow') {
    drawTree(270, 170);
    drawTree(80, 100);
    drawTree(480, 120);
    drawTree(50, 380);
    drawBoy(state.boy.x, state.boy.y);

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

    drawNPC(npcs.coffeeCart, npcs.coffeeCart.x, npcs.coffeeCart.y);
    drawNPC(npcs.hippie, npcs.hippie.x, npcs.hippie.y);

    if (!worldItems.birdseed.collected) {
      ctx.fillStyle = '#d2691e';
      for (let i = 0; i < 6; i++) {
        ctx.fillRect(
          worldItems.birdseed.x + (i % 3) * 3,
          worldItems.birdseed.y + Math.floor(i / 3) * 3,
          2, 2
        );
      }
    }

    drawNavigationIndicator(30, 240, 'left', 'Meadow');
    drawNavigationIndicator(320, 30, 'up', 'Gate');
    drawNavigationIndicator(320, canvasHeight - 30, 'down', 'Play');

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
    drawTree(100, 100);
    drawTree(450, 120);
    drawTree(200, 320);
    drawTree(500, 350);

    ctx.fillStyle = '#808080';
    for (let x = 300; x < 400; x += 16) {
      for (let y = 80; y < 160; y += 16) {
        ctx.fillRect(x + Math.random() * 4, y + Math.random() * 4, 12, 12);
      }
    }

    drawGate(360, 120);
    drawLeafPile(worldItems.doubloons.x, worldItems.doubloons.y);

    drawLeafPile(150, 250);
    drawLeafPile(450, 280);
    drawLeafPile(220, 380);

    drawNPC(npcs.bird, npcs.bird.x, npcs.bird.y);

    if (!state.gateUnlocked || !npcs.squirrel.behindGate) {
      drawNPC(npcs.squirrel, npcs.squirrel.x, npcs.squirrel.y);
    }

    if (!state.gateUnlocked) {
      ctx.fillStyle = '#8b4513';
      for (let i = 0; i < 5; i++) {
        const ax = 360 + 40 + i * 8;
        const ay = 120 + 10 + Math.sin(i) * 5;
        ctx.fillRect(ax, ay, 4, 5);
        ctx.fillStyle = '#654321';
        ctx.fillRect(ax + 1, ay + 1, 2, 2);
        ctx.fillStyle = '#8b4513';
      }
    }

    drawNavigationIndicator(320, canvasHeight - 30, 'down', 'Park');
    if (state.gateUnlocked) {
      drawNavigationIndicator(canvasWidth - 30, 240, 'right', 'Woods');
    }

  } else if (area === 'woods') {
    ctx.fillStyle = '#6b8e23';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    drawTree(80, 80);
    drawTree(200, 100);
    drawTree(150, 300);
    drawTree(500, 250);
    drawTree(550, 100);
    drawTree(320, 180);
    drawTree(420, 360);

    for (let i = 0; i < 20; i++) {
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      ctx.fillStyle = '#5a7c1f';
      ctx.fillRect(x, y, 4, 4);
    }

    ctx.fillStyle = '#8b0000';
    ctx.fillRect(180, 220, 6, 4);
    ctx.fillRect(185, 216, 2, 4);
    ctx.fillRect(340, 300, 6, 4);
    ctx.fillRect(345, 296, 2, 4);

    drawLogs(450, 200);
    drawNPC(npcs.dog, npcs.dog.x, npcs.dog.y);

    drawRock(100, 350);
    drawRock(400, 380);
    drawRock(250, 160);

    drawNavigationIndicator(30, 240, 'left', 'Gate');
    if (state.logsCleared) {
      drawNavigationIndicator(320, 30, 'up', 'Water');
    }

  } else if (area === 'boathouse') {
    ctx.fillStyle = '#4682b4';
    ctx.fillRect(0, 300, canvasWidth, canvasHeight - 300);

    ctx.fillStyle = '#5a9bd4';
    for (let x = 0; x < canvasWidth; x += 40) {
      ctx.fillRect(x, 320 + Math.sin(x * 0.1) * 10, 30, 3);
      ctx.fillRect(x + 10, 360 + Math.cos(x * 0.1) * 10, 25, 3);
      ctx.fillRect(x + 5, 400 + Math.sin(x * 0.15) * 8, 28, 3);
    }

    ctx.fillStyle = '#8b4513';
    ctx.fillRect(480, 200, 120, 100);
    ctx.fillStyle = '#654321';
    ctx.fillRect(490, 220, 100, 60);

    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(500, 230, 30, 20);
    ctx.fillRect(550, 230, 30, 20);

    ctx.fillStyle = '#a0522d';
    ctx.beginPath();
    ctx.moveTo(470, 200);
    ctx.lineTo(540, 170);
    ctx.lineTo(610, 200);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#8b4513';
    ctx.fillRect(420, 280, 180, 20);
    ctx.fillRect(500, 270, 4, 30);
    ctx.fillRect(540, 270, 4, 30);

    drawTree(100, 80);
    drawTree(300, 100);
    drawTree(50, 200);

    ctx.fillStyle = '#8b4513';
    ctx.fillRect(160, 290, 3, 20);
    ctx.fillRect(180, 285, 3, 25);
    ctx.fillStyle = '#654321';
    ctx.fillRect(159, 285, 5, 6);
    ctx.fillRect(179, 280, 5, 6);

    drawNPC(npcs.fisherman, npcs.fisherman.x, npcs.fisherman.y);

    if (!state.ladybug.found) {
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

    drawNavigationIndicator(320, canvasHeight - 30, 'down', 'Woods');
  }
}
