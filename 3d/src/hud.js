// HTML overlay HUD: inventory panel, item notifications, prompts, fade, cutscenes

import { state, onInventoryChange } from './state.js';
import { AREA_DATA } from '../../src/data/areas.js';

const inventoryItemsEl = document.getElementById('inventoryItems');
const inventoryEl = document.getElementById('inventory');
const notificationEl = document.getElementById('notification');
const interactPromptEl = document.getElementById('interactPrompt');
const areaLabelEl = document.getElementById('areaLabel');
const fadeEl = document.getElementById('fade');
const cutsceneEl = document.getElementById('cutscene');
const cutsceneTextEl = document.getElementById('cutsceneText');

export function updateInventoryDisplay(items = state.inventory) {
  inventoryItemsEl.innerHTML = items.length === 0
    ? '<div class="inventory-item">Empty</div>'
    : items.map((i) => `<div class="inventory-item">• ${i}</div>`).join('');
}

export function toggleInventory() {
  inventoryEl.style.display = inventoryEl.style.display === 'none' ? '' : 'none';
}

let notifTimer = null;
export function showItemNotification(text, kind = 'item') {
  notificationEl.textContent = kind === 'item' ? `Got ${text}!` : text;
  notificationEl.classList.add('visible');
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => notificationEl.classList.remove('visible'), 2200);
}

export function setInteractPrompt(visible) {
  interactPromptEl.classList.toggle('visible', visible);
}

let areaLabelTimer = null;
export function showAreaLabel(areaId) {
  areaLabelEl.textContent = AREA_DATA[areaId]?.name ?? areaId;
  areaLabelEl.classList.add('visible');
  clearTimeout(areaLabelTimer);
  areaLabelTimer = setTimeout(() => areaLabelEl.classList.remove('visible'), 2600);
}

export function setFade(alpha) {
  fadeEl.style.opacity = String(alpha);
}

export function showCutsceneOverlay(visible) {
  cutsceneEl.classList.toggle('active', visible);
}

export function setCutsceneText(text, visible = true) {
  cutsceneTextEl.textContent = text;
  cutsceneTextEl.classList.toggle('visible', visible);
}

export function initHUD() {
  onInventoryChange(updateInventoryDisplay);
  updateInventoryDisplay();
}
