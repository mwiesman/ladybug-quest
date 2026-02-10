// Item definitions
// Collectibles found in the world and tradeable items in the quest chain

export const WORLD_ITEMS = {
  birdseed: {
    x: 200, y: 65, area: 'park',
    name: 'Birdseed',
    collected: false
  },
  doubloons: {
    x: 450, y: 300, area: 'woods',
    name: 'Gold Doubloons',
    collected: false
    // Easter egg - completely useless, NPCs ignore it
    // Hidden under leaves in woods, accessible after clearing logs
  }
};

export const STARTING_ITEMS = ['Gum'];
