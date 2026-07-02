# The Ladybug Quest

A pixel art adventure game where you help a young girl find her lost ladybug friend. Explore 6 interconnected areas, solve item-based puzzles, and interact with quirky NPCs in this Pokemon GBA-inspired adventure.

> **🎲 3D version:** an experimental three.js remake lives in the isolated [`3d/`](3d/) folder (play at `/3d/` in dev or after build). It shares this game's dialog and quest data but builds as a completely separate bundle — it has zero impact on the 8-bit game's load time. See [3d/README.md](3d/README.md).

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

### Keyboard
- **Arrow Keys** or **WASD**: Move
- **Space**: Interact with NPCs and objects / Advance dialog / Skip cutscenes
- **ESC**: Decline a trade
- **Tab**: Open/close world map
- **P**: Manual save (during gameplay)
- **M**: Toggle audio mute
- **R** (on credits screen): Restart game

### On-Screen Buttons (All Devices)
- **BAG button**: Toggle inventory
- **MAP button**: Toggle world map

### Mobile / Touch
- **Tap ground**: Walk to that spot
- **Tap NPC/object**: Walk over and auto-interact
- **Tap exit indicator**: Walk to area exit and transition
- **Tap dialog**: Advance dialog (Yes/No buttons for trades)
- **Tap cutscene**: Advance to next beat

## Adding Sprites & Audio

The game uses a **drop-in asset system**. Place properly-named files in the right folder and they load automatically. No code changes needed. If a file is missing, the game falls back to procedural art / silent operation.

### Sprites
Place PNGs in `public/sprites/`:
```
public/sprites/
├── characters/    girl.png, boy.png, dog.png, bird.png, squirrel.png,
│                  hippie.png, fisherman.png, kid.png, parent.png,
│                  coffee_cart.png, ladybug.png
├── environment/   tree.png, tree_large.png, camperdown_elm.png, rock.png,
│                  gate.png, logs.png, leaf_pile.png, flowers_pink.png,
│                  flowers_orange.png, flowers_yellow.png, etc.
└── portraits/     girl.png (80x80), boy.png, dog.png
```

`girl.png` is a horizontal sprite sheet: 8 frames at 24x32px each (Down x2, Up x2, Left x2, Right x2).

### Audio
Place MP3s in `public/audio/`:
```
public/audio/
├── music/    meadow.mp3, park.mp3, playground.mp3, gate_area.mp3,
│             woods.mp3, boathouse.mp3, cutscene.mp3
└── sfx/      pickup.mp3, trade.mp3, dialog_open.mp3, dialog_advance.mp3,
              gate_unlock.mp3, logs_clear.mp3, step.mp3, area_transition.mp3
```

See [SPRITE_REQUIREMENTS.md](SPRITE_REQUIREMENTS.md) for detailed specifications.

## Project Structure

```
src/
├── data/          # Game data (NPCs, areas, items, cutscenes)
├── game/          # Core game state and logic
├── systems/       # Game systems (input, touch, inventory, dialog, collision, audio)
├── rendering/     # All drawing functions (sprites, areas, UI, sprite loader)
└── main.js        # Entry point and game loop
```

## Tech Stack

- **Vite** - Build tool and dev server
- **Vanilla JS** - ES6 modules
- **Canvas API** - 2D rendering (procedural pixel art with sprite overlay support)

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
- Save system with auto-save and manual save
- Smooth fade-to-black screen transitions
- World map overlay (Tab key)
- Environmental animations (butterflies, fireflies, water ripples)
- Full mobile/touch support with responsive canvas scaling
