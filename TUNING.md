# Tuning Guide - Quick Reference for Tweaking the Game

This guide maps every adjustable parameter to its file so you can make changes without deep-diving into the codebase.

---

## Player Movement

**File:** `src/game/player.js`

| Parameter | Current | Description |
|-----------|---------|-------------|
| `speed` | 3.5 | Pixels per frame. Higher = faster movement |
| `x`, `y` | 310, 200 | Starting position (under the oak tree in meadow) |
| `width`, `height` | 24, 32 | Hitbox size for collision detection |

**Animation timing** is in `src/main.js` line ~314:
- `animTimer > 8` — walk cycle speed (lower = faster leg animation)

---

## NPC Positions & Dialog

**File:** `src/data/npcs.js`

Each NPC has:
```
x, y        — position in their area
area        — which area they appear in ('park', 'gate_area', etc.)
dialog      — lines shown when player has the required item (before trade prompt)
dialogBefore    — lines shown when player does NOT have required item
dialogAfterTrade — lines shown after player accepts trade
dialogDecline   — lines shown if player presses ESC to decline
dialogComplete  — lines shown on all visits after trade is done
needsItem   — item required for trade (or 'Gate Unlocked' for squirrel)
givesItem   — item received from trade
```

### Current NPC Positions
| NPC | Position | Area |
|-----|----------|------|
| Coffee Cart | 100, 100 | park |
| Hippie | 150, 200 | park |
| Dog | 350, 350 | park |
| Bird | 200, 120 | gate_area |
| Squirrel | 340, 200 | gate_area (moves to 500, 140 when gate unlocked) |
| Kid | 200, 300 | playground (runs to parent at 280, 310) |
| Parent | 250, 320 | playground |
| Fisherman | 550, 150 | boathouse |
| Boy (static) | 290, 270 | meadow (defined in `src/game/state.js`) |

---

## World Items

**File:** `src/data/items.js`

| Item | Position | Area | Notes |
|------|----------|------|-------|
| Birdseed | 200, 65 | park | On bird feeder near coffee cart |
| Gold Doubloons | 450, 300 | woods | Easter egg, no gameplay use |

**Starting inventory:** `STARTING_ITEMS = ['Gum']`

To add a new collectible, add an entry to `WORLD_ITEMS` and add pickup logic in `src/systems/interaction.js`.

---

## Quest Chain

**File:** `src/data/npcs.js` (trade definitions)

Current chain:
```
Birdseed → Bird (Key) → Gate → Squirrel (Ball) → Dog (Leash/Rope) → Fisherman (Net) → Ladybug
                                                    Side: Gum → Hippie (Flower) → Kid (Axe) → Logs → Woods
```

To change what an NPC wants/gives, edit their `needsItem` and `givesItem` fields.

---

## Cutscene Timing

**File:** `src/data/cutscenes.js`

Each beat has a `duration` in frames (60 frames = 1 second):
```javascript
{ duration: 180, text: "Under the old oak tree..." }  // 3 seconds
```

### Intro Animation Phases
**File:** `src/main.js` (~line 203)

| Phase | Frames | What Happens |
|-------|--------|-------------|
| 0-60 | 60 | Ladybug flies off |
| 60-140 | 80 | Girl walks away from tree (y: 200 → 370) |
| 140 | 1 | Boy's dialog appears |
| 200+ | — | Game starts |

### Ending Animation Phases
**File:** `src/main.js` (~line 226)

| Phase | Frames | What Happens |
|-------|--------|-------------|
| 0-30 | 30 | Ladybug on leaf |
| 30-70 | 40 | Girl swings net, ladybug flies up (sine weave) |
| 70 | — | "*Misses!*" dialog (freezes until SPACE) |
| 70-120 | 50 | Boy walks toward girl, ladybug hovers |
| 120-160 | 40 | Ladybug descends to boy's hand |
| 160 | — | "*The ladybug lands gently on his hand...*" dialog |
| 180 | — | "Ain't that just the way." dialog |
| 210+ | ~50 | Fade to black, then credits |

---

## Animation Speeds

**File:** `src/main.js` (update function) and `src/rendering/areas.js`

| Animation | Duration | Location |
|-----------|----------|----------|
| Kid run to parent | 40 frames | `main.js` ~line 265 |
| Squirrel gate run | 60 frames (3 legs × 20) | `main.js` ~line 270, `areas.js` ~line 264 |
| Woods ladybug sighting | 150 frames (40 sit + 110 fly) | `main.js` ~line 278 |
| Bird flight | Continuous sine wave | `areas.js` ~line 260 |
| Bird flight frequency | x: 0.02, y: 0.03 | `areas.js` / `interaction.js` |
| Screen transitions | ~30 frames each way | `src/game/world.js` |
| Ending fade to black | +0.02 alpha per frame (~50 frames) | `main.js` ~line 232 |

---

## Collision Zones

**File:** `src/systems/collision.js`

Each area has hardcoded collision rectangles. Format:
```javascript
if (x < right && x + w > left && y < bottom && y + h > top) return true;
```

Key collision areas:
- **Meadow:** Trees, rocks
- **Gate Area:** Stone walls (4 walls), gate, tree line across top, logs
- **Boathouse:** Water (blocked except bridge at x: 305-345), building, trees, elm fence
- **Woods:** Rocks only
- **Park/Playground:** No obstacle collision (just screen boundaries)

To move an obstacle, change both the collision rect in `collision.js` AND the visual in `areas.js`.

---

## Visual Tuning

### Area Rendering
**File:** `src/rendering/areas.js`

Each area is a section in `drawCompleteArea()`. Trees, flowers, rocks etc. are positioned with direct coordinates. To move something visual, find the `drawTree(x, y)` or similar call and change the coordinates.

### Sprite Sizes
**File:** `src/rendering/sprites.js`

All procedural drawing functions are here. Key sizes:
- Player/NPCs: ~24×32 pixels
- Trees: ~48×48 (regular), ~96×96 (large oak)
- Ladybug: 12px diameter

### Colors
Common colors used throughout:
- Grass: `#6b8e23` (olive), `#7cba3f` (bright green)
- Water: `#4682b4` (steel blue)
- Wood: `#8b4513` (saddle brown), `#654321` (dark brown)
- Stone walls: `#808080` (gray)

---

## Sprites & Audio (Drop-in Assets)

### Sprites
**Directory:** `public/sprites/`

Drop PNG files and they auto-load, replacing procedural art:
```
sprites/characters/girl.png      — Player sprite sheet (8 frames: 4 dirs × 2 walk frames, each 24×32)
sprites/characters/boy.png       — Boy NPC
sprites/characters/dog.png       — Dog NPC
sprites/characters/bird.png      — etc.
sprites/environment/tree.png     — Regular tree
sprites/environment/tree_large.png
sprites/portraits/girl.png       — Dialog portrait (80×80)
sprites/portraits/boy.png
```

Full manifest in `src/rendering/spriteLoader.js`.

### Audio
**Directory:** `public/audio/`

Drop MP3 files and they auto-load:
```
audio/music/meadow.mp3       — Background music per area
audio/music/park.mp3
audio/music/cutscene.mp3
audio/sfx/pickup.mp3          — Sound effects
audio/sfx/trade.mp3
audio/sfx/dialog_open.mp3
audio/sfx/gate_unlock.mp3
```

Full manifest in `src/systems/audio.js`. Missing files silently fall back to no sound.

---

## Notification Timing

**File:** `src/rendering/ui.js`

| Notification | Duration | Constant |
|-------------|----------|----------|
| Save notification | 90 frames (~1.5s) | `SAVE_NOTIFICATION_DURATION` |
| Item received | 120 frames (~2s) | `ITEM_NOTIFICATION_DURATION` |

---

## Save System

**File:** `src/systems/save.js`

- `SAVE_VERSION` — Bump this when state shape changes (invalidates old saves)
- Auto-saves trigger in `interaction.js` (pickups, trades, gate, logs) and `world.js` (transitions)
- Manual save: P key
- Save data stored in `localStorage` as JSON

---

## Controls

**File:** `src/systems/input.js`

| Key | Action |
|-----|--------|
| WASD / Arrow Keys | Move |
| SPACE | Interact / advance dialog / accept trade |
| ESC | Decline trade |
| P | Manual save |
| M | Toggle mute |
| Tab | Toggle map |
| C | Continue (save prompt) |
| N | New game (save prompt) |
| R | Restart (credits screen) |

---

## Module Map

```
src/
├── data/
│   ├── npcs.js          — NPC positions, dialog, trades
│   ├── items.js         — World collectibles, starting inventory
│   └── cutscenes.js     — Cutscene text beats and timing
├── game/
│   ├── state.js         — All game state, flags, reset function
│   ├── player.js        — Player position, speed, size
│   └── world.js         — Area transitions, spawn points
├── systems/
│   ├── dialog.js        — Dialog flow, trade logic
│   ├── interaction.js   — Proximity checks, item pickups, gate/logs
│   ├── collision.js     — Per-area collision rectangles
│   ├── inventory.js     — Inventory management + UI
│   ├── input.js         — Keyboard handling
│   ├── audio.js         — Music/SFX loading and playback
│   └── save.js          — LocalStorage save/load
├── rendering/
│   ├── sprites.js       — All procedural draw functions
│   ├── areas.js         — Area renderers (drawCompleteArea)
│   ├── spriteLoader.js  — PNG sprite loading with fallback
│   └── ui.js            — Notifications, prompts, map overlay
├── main.js              — Game loop, cutscenes, animations
└── styles.css           — UI styling (dialog box, inventory, credits)
```
