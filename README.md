# The Ladybug Quest

A pixel art adventure game where you help a young girl find her lost ladybug friend. Explore 6 interconnected areas, solve item-based puzzles, and interact with quirky NPCs in this Pokemon GBA-inspired adventure.

## Prerequisites

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/mwiesman/ladybug-quest.git
cd ladybug-quest
```

2. Install dependencies:
```bash
npm install
```

## Running the Game

### Development Mode
Start the development server with hot reload:
```bash
npm run dev
```
Then open your browser to `http://localhost:5173`

### Production Build
Build the game for production:
```bash
npm run build
```
The built files will be in the `dist/` directory.

### Preview Production Build
Preview the production build locally:
```bash
npm run preview
```

## Controls

- **Arrow Keys** or **WASD**: Move
- **Space**: Interact with NPCs and objects / Advance dialog / Skip cutscenes
- **R** (on credits screen): Restart game

## Project Structure

```
src/
├── data/          # Game data (NPCs, areas, items, cutscenes)
├── game/          # Core game state and logic
├── systems/       # Game systems (input, inventory, dialog, collision)
├── rendering/     # All drawing functions (sprites, areas, UI)
└── main.js        # Entry point and game loop
```

## Tech Stack

- **Vite** - Build tool and dev server
- **Vanilla JS** - ES6 modules
- **Canvas API** - 2D rendering (procedural pixel art)

## Documentation

- **[DESIGN.md](../DESIGN.md)** - Complete game design document (story, characters, world design, mechanics)
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and roadmap
- **[SPRITE_REQUIREMENTS.md](SPRITE_REQUIREMENTS.md)** - Sprite asset specifications for future sprite system

## Game Features

- 6 interconnected areas to explore
- 8 unique NPCs with personality and purpose
- Item-based quest chain with meaningful trades
- Opening and ending cutscene sequences
- Pokemon GBA-inspired pixel art aesthetic
- Contemplative, story-driven experience (no combat)
