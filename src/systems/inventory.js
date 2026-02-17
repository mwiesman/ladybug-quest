// Inventory management and DOM display

import { STARTING_ITEMS } from '../data/items.js';
import { showItemNotification } from '../rendering/ui.js';

const inventoryEl = document.getElementById('inventory');
const inventoryItemsEl = document.getElementById('inventoryItems');

export const inventory = {
  items: [...STARTING_ITEMS],

  hasItem(item) {
    return this.items.includes(item);
  },

  addItem(item) {
    this.items.push(item);
    this.updateDisplay();
    showItemNotification(item);
  },

  removeItem(item) {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
    }
    this.updateDisplay();
  },

  updateDisplay() {
    if (this.items.length === 0) {
      inventoryItemsEl.innerHTML = '<div class="inventory-item">Empty</div>';
    } else {
      inventoryItemsEl.innerHTML = this.items
        .map(item => `<div class="inventory-item">• ${item}</div>`)
        .join('');
    }
  },

  toggleDisplay() {
    if (inventoryEl.style.display === 'none') {
      inventoryEl.style.display = '';
    } else {
      inventoryEl.style.display = 'none';
    }
  },

  reset() {
    this.items = [...STARTING_ITEMS];
    this.updateDisplay();
  }
};
