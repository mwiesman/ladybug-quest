# Changelog

All notable changes to The Ladybug Quest project.

## [Unreleased]

### Modular Restructure (v3 → Vite Project)
**Date:** 2026-02-08

#### Added
- **Project Structure**: Converted from single 2,271-line HTML file to modular Vite project
  - 20 source files across `data/`, `game/`, `systems/`, `rendering/` modules
  - Vite build system with hot module reload
  - ES6 modules throughout
  - Centralized state architecture

- **Visual Improvements**:
  - Large oak tree (3x scale) as main landmark
  - Camperdown Elm with plaque at boathouse
  - Improved gated area: full stone wall corner with scattered acorns
  - Deterministic grass patterns (no more flickering)

- **Gameplay Features**:
  - Trade confirmation prompts: "*Give X the Y?*"
  - Log interaction system with feedback
  - Doubloons moved behind logs as hidden easter egg
  - NPC completion dialog (no repetition after trades)

- **Ending Sequence**:
  - Ladybug relocated to original oak tree location
  - New animated ending: flies to boy's hand, escapes again
  - Fisherman hints at ladybug location
  - Updated credits: "for Adielle" / "a story of infinite beginnings"

- **Intro Sequence**:
  - Characters start together under tree
  - Girl walks away (not toward boy)
  - Ladybug fly-off animation during area transition

#### Fixed
- Area transitions spawn player on correct side
- Intro animation timing and positioning
- Rock collision detection throughout areas
- Dog auto-trade issue (now waits for confirmation)
- Dialog state preservation during animations
- Canvas boundary collision at transition edges

#### Technical
- Added `.gitignore` for node_modules and dist
- GitHub repository: https://github.com/mwiesman/ladybug-quest
- Build: 18 modules → 31KB JS bundle
- Zero build errors

### Sprite & Audio Systems + Polish
**Date:** 2026-02-08

#### Added
- **Sprite System** (`rendering/spriteLoader.js`):
  - Convention-based sprite loading with manifest
  - Drop PNGs into `public/sprites/{characters,environment,portraits}/` — auto-loaded
  - Every draw function checks for sprite first, falls back to procedural art
  - Player sprite sheet support: 8-frame horizontal strip (4 dirs x 2 frames)
  - Dialog portrait sprite support (80x80)

- **Audio System** (`systems/audio.js`):
  - Convention-based audio loading — same drop-in pattern as sprites
  - Background music per area (`public/audio/music/`)
  - Sound effects for interactions (`public/audio/sfx/`)
  - Mute toggle (M key)
  - Browser autoplay policy handling

- **Gameplay Polish**:
  - Trade decline with ESC key (`[SPACE] Yes  [ESC] No` prompt)
  - NPC idle bob animation (sine wave vertical offset)
  - Butterflies floating in meadow (3) and park (2)
  - Fireflies with glow effect in woods (5)
  - Animated water ripples in boathouse (time-based sine waves)
  - Global `frameCount` counter for all environmental animations

#### Technical
- Async initialization: sprites and audio load in parallel before game loop
- All asset loading uses graceful fallback — game works identically without any files
- Build: 20 modules → ~40KB JS bundle

## [v3] - Original Single-File Version
**Date:** Pre-2026-02-08

- Complete game in single `ladybug-quest-v3.html` file
- All features functional: 6 areas, 8 NPCs, quest chain, cutscenes
- Procedural pixel art rendering
- Pokemon GBA-inspired visual style

---

## Future Roadmap

### Save System
- LocalStorage persistence
- Save/load game state
- Continue from last position

### Additional Polish
- Character scaling (larger/boxier sprites for faster feel)
