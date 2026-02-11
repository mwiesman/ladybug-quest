# Changelog

All notable changes to The Ladybug Quest project.

## [Unreleased]

### Gameplay Polish & Dialog Rework
**Date:** 2026-02-10

#### Added
- **Dialog Trade System Rework**: Split NPC dialog into phases
  - `dialogBefore` (no required item), `dialog` (neutral recognition), `dialogAfterTrade`, `dialogDecline`, `dialogComplete`
  - Trade prompt appears AFTER neutral dialog lines — `[SPACE] Yes  [ESC] No`
  - NPCs no longer say "thank you" before you agree to trade
- **Bird Flight Animation**: Bird flies back and forth on sine wave until interacted with
  - `birdStopped` state persisted in save data
- **Squirrel Gate-Unlock Behavior**: Squirrel runs through gate opening via 3-leg waypoint path
  - Stays at inside position (500, 140) permanently after gate unlocked, even after trade
- **Kid Interruption**: Kid runs over when parent is talked to (triggers on dialog line 3)
  - Kid uses animated position for interaction checks after running
- **Item Received Notifications**: Gold "Received: [item]" popup at top of screen (~2 seconds)
- **Ending Sequence Rework**: Animated sequence with dialog prompts
  - "*Misses!*" after net swing, "*The ladybug lands gently on his hand...*" after landing
  - Boy: "Ain't that just the way." — then fade to black before credits
  - Ladybug lands on boy's hand (cyclical return to opening)
- **Bird Feeder**: Small feeder near coffee cart in park with sparkle effect when birdseed available
- **Coffee Cart Hint**: Now mentions bird feeder with seeds after handing you coffee
- **Camperdown Elm Plaque**: Interactable in boathouse area — read the plaque
- **Boathouse Bridge**: Wooden bridge with railings connecting land to south exit over water
- **Gate Area Enclosure**: Four sealed walls with gate opening, dense tree line across top
- **Woods Enhancement**: 12+ trees, fallen logs, leaf piles, mushrooms, 7 fireflies
- **Ladybug Woods Sighting**: Slowed to 150 frames (40 sit + 110 fly) with extra firefly burst

#### Changed
- Player speed: 3.5 → 2 (pixel-snapped movement)
- Dog: moved to Park, trades Ball for Leash (Rope) instead of Dog Toy for Rope
- Squirrel: gives Ball instead of Axe (x: 340, y: 200)
- Kid: gives Axe instead of Dog Toy
- Bird: x: 200, y: 120 (moved from 280, 140), `flies: true`
- Doubloons: moved back to Woods (from Gate Area)
- Birdseed: moved to (200, 65) near bird feeder
- Girl sprite: left/right drawing swapped (was reversed)
- Navigation labels: centered text, full area names
- Credits: "A story of infinite beginnings" (was "infinite pursuit"), "for Adielle"
- Intro: boy walks from tree to meadow position during phases 100-180
- Gate draws open (swung door) when unlocked
- Save version bumped to 3

#### Fixed
- Ending ladybug invisible (was setting `ladybug.found = true` before animation)
- Gate area not sealed (wall gap from y:180-230)
- Player could walk through squirrel into gated area
- Bird feeder sizing (restored to appropriate size)
- Missing state resets for endingPhase, tradePrompted, kidRunPhase, squirrelRunPhase

#### Technical
- Build: 21 modules → ~53KB JS bundle
- Zero build errors

---

### World Rework, Transitions & Map
**Date:** 2026-02-08

#### Added
- **World Layout Rework**: Restructured map so Boathouse is accessible early
  - New layout: Meadow ↔ Park ↔ Boathouse ↔ Gate Area ↔ Woods (+ Playground below Park)
  - Fisherman quest feels natural since you can reach him immediately
  - Woods/Forest is now an optional late-game area behind the logs

- **Quest Chain Restructure**:
  - Main path: Birdseed → Bird → Key → Gate → Squirrel → Ball → Dog → Rope → Fisherman → Net → Ladybug
  - Side path: Gum → Hippie → Flower → Kid → Axe → clear logs → Woods (optional exploration)
  - Dog moved to Park, Kid now gives Axe, Squirrel now gives Ball

- **Screen Fade Transitions**: Smooth fade-to-black between area transitions
  - ~0.5s fade out, area swap, ~0.5s fade in

- **Map Overlay** (Tab key): Canvas-drawn map showing all 6 areas
  - Current area highlighted in pink
  - Connections between areas shown as lines
  - Blocked paths (logs) shown as dashed/dimmed

- **Ladybug Woods Sighting**: First-time Woods entry triggers a brief animation
  - Ladybug flies across the screen among a burst of extra fireflies

- **Save System**:
  - Auto-saves at area transitions, item pickups, NPC trades, gate unlock, logs cleared
  - Manual save with P key (shows "Game Saved" notification)
  - Continue / New Game prompt on launch when a save exists
  - LocalStorage persistence with version checking

#### Changed
- Dog NPC relocated from Woods to Park
- Doubloons initially moved to Gate Area (later moved back to Woods in polish pass)
- Gate Area now has stone walls forming gated corner + log blockade to Woods
- Save version bumped to 2 (old saves invalidated by layout change)

#### Technical
- Build: 21 modules → ~46KB JS bundle
- Zero build errors

---

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

### Additional Polish
- Character scaling (larger/boxier sprites for faster feel)
- Mobile/touch controls
