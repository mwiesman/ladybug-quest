// Area definitions - world layout, exits, and narrative context
// See DESIGN.md World Design section for full area descriptions

export const AREA_DATA = {
  meadow: {
    name: 'Meadow',
    exits: {
      right: 'park'
    },
    npcs: [],
    description: 'Under the old oak tree. A peaceful beginning.'
  },
  park: {
    name: 'Park Path',
    exits: {
      left: 'meadow',
      up: 'boathouse',
      down: 'playground'
    },
    npcs: ['hippie', 'coffeeCart', 'dog'],
    description: 'The main park path. Life in motion.'
  },
  playground: {
    name: 'Playground',
    exits: {
      up: 'park'
    },
    npcs: ['kid', 'parent'],
    description: 'Bright and full of energy.'
  },
  boathouse: {
    name: 'Boathouse',
    exits: {
      down: 'park',
      right: 'gate_area'
    },
    npcs: ['fisherman'],
    description: 'Water and openness.'
  },
  gate_area: {
    name: 'Gate Area',
    exits: {
      left: 'boathouse',
      // up: 'woods' — only when logs are cleared (handled in world.js)
    },
    npcs: ['bird', 'squirrel'],
    description: 'A locked gate blocks half the area. Logs block the path north.'
  },
  woods: {
    name: 'Woods',
    exits: {
      down: 'gate_area'
    },
    npcs: [],
    description: 'Dense trees, nature uncontrolled. A fleeting red glimpse.'
  }
};
