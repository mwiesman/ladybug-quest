// Item definitions
// Collectibles found in the world and tradeable items in the quest chain

export const WORLD_ITEMS = {
  birdseed: {
    x: 120, y: 80, area: 'park',
    name: 'Birdseed',
    collected: false
  },
  doubloons: {
    x: 300, y: 200, area: 'gate_area',
    name: 'Gold Doubloons',
    collected: false
    // Easter egg - completely useless, NPCs ignore it
  }
};

export const STARTING_ITEMS = ['Gum'];
