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
      up: 'gate_area',
      down: 'playground'
    },
    npcs: ['hippie', 'coffeeCart'],
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
  gate_area: {
    name: 'Gate Area',
    exits: {
      down: 'park',
      // left: 'woods' — only when gate is unlocked (handled in world.js)
    },
    npcs: ['bird', 'squirrel'],
    description: 'A locked gate blocks the path.'
  },
  woods: {
    name: 'Woods',
    exits: {
      right: 'gate_area',
      // up: 'boathouse' — only when logs are cleared (handled in world.js)
    },
    npcs: ['dog'],
    description: 'Dense trees, nature uncontrolled.'
  },
  boathouse: {
    name: 'Boathouse',
    exits: {
      down: 'woods'
    },
    npcs: ['fisherman'],
    description: 'Water and openness. The journey\'s end.'
  }
};
