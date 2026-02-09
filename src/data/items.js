// Item definitions
// Collectibles found in the world and tradeable items in the quest chain

export const WORLD_ITEMS = {
  birdseed: {
    x: 120, y: 80, area: 'park',
    name: 'Birdseed',
    collected: false
  },
  doubloons: {
    x: 470, y: 180, area: 'woods',
    name: 'Gold Doubloons',
    collected: false
    // Easter egg - completely useless, NPCs ignore it
    // Hidden behind logs until cleared
  }
};

export const STARTING_ITEMS = ['Gum'];
