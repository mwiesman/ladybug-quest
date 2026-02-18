# Changelog

All notable changes to The Ladybug Quest project.

## [Unreleased]

### Gate Area Corner Redesign, NPC Collision & Touch Fixes
**Date:** 2026-02-17

#### Added
- **Gate Area Corner Layout**: L-shaped fence creates a gated corner (top-right) instead of splitting the area in half
  - Vertical fence at x=400 (y=50 to y=300) + horizontal fence at y=300 (x=400 to right edge)
  - Gated corner uses screen edges (top, right) and fence (left, bottom) as natural boundaries
  - Double-door gate in vertical fence swings inward when unlocked (top door up, bottom door down)
- **NPC Collision**: All NPCs now have hitboxes — player cannot walk through characters
  - Overlap-escape logic prevents trapping if NPC moves onto player during animations
  - Per-area NPC collision: boy (meadow), hippie/dog (park), kid/parent (playground), bird/squirrel (gate), fisherman (boathouse)
- **Fall-Colored Trees** (`drawFallTree`): Autumn orange/red canopy variant mixed throughout gate area
- **Improved Acorns** (`drawAcorn`): Pixel-art acorns with cap, body shading, and stem (replaces rectangles)
  - 6 acorns clustered under the squirrel's destination tree at (480, 80)
- **Game HUD**: BAG and MAP buttons now visible on all devices (desktop + mobile), not just touch
- **White Boathouse**: Building changed from brown to off-white with brown trim and roof
- **Woods Polish**: Scattered leaves (various fall colors), twigs, extra mushrooms, 2 fall trees, extra leaf piles

#### Changed
- Squirrel starting position: (360, 300) — outside corner fence
- Squirrel inside position: (500, 120) — at acorn tree inside gated corner
- Fisherman position: (450, 255) — moved to base of boathouse (was on roof at 550, 150)
- Gate position: (400, 215) — in vertical fence segment
- Boathouse collision extended to include roof (y: 168-300, was 180-300)

#### Fixed
- **Touch interaction with gate/logs/NPCs**: Player no longer needs to reach exact position — interaction triggers within 30px (was 4px)
  - Previously, collision barriers (fence, NPC hitboxes) prevented arrival, so interaction never fired
- **Stale squirrel position** in proximity hint check corrected

#### Technical
- New sprite functions: `drawAcorn()`, `drawFallTree()` in `sprites.js`
- `npcBlock()` helper in collision.js — blocks entry but allows escape if already overlapping
- Touch arrival threshold: 30px for interactables, 4px for ground movement
- L-shaped fence collision replaces vertical-only fence in `collision.js`
- Build: 22 modules, ~69KB JS bundle
- Zero build errors

---

### Mobile Touch Support
**Date:** 2026-02-17

#### Added
- **Touch System** (`src/systems/touch.js`): Full mobile input handling
  - Tap-to-move: tap anywhere to walk, character pathfinds with wall-sliding
  - Tap-to-interact: tap NPCs/items/objects to auto-walk and interact on arrival
  - Touch coordinate translation accounting for CSS transform scaling
  - State-based touch routing (playing, dialog, cutscene, map, credits)
- **Responsive Canvas Scaling**: CSS transform scales the 640x480 canvas to fit mobile screens
  - `--game-scale` CSS variable computed on resize/orientation change
  - Thinner border on small screens
- **Area Exit Indicators**: Tappable labeled arrows at each area edge (touch devices only)
  - Shows destination name with directional arrow, subtle pulse animation
  - 15px extra padding on hit area for comfortable tapping
  - Custom positioning for boathouse bridge and gate area corridor exits
- **Game HUD**: Floating BAG and MAP buttons (top-left, all devices)
  - BAG toggles inventory visibility, MAP opens/closes world map
- **Trade Buttons**: Yes/No text buttons during trade prompts (all devices)
  - Green "Yes" / Red "No" centered in dialog box, replaces `[SPACE] Yes [ESC] No` text
- **Save Prompt Buttons**: Continue/New Game buttons (touch devices, replaces `[C]/[N]` text)
- **Dialog Touch**: Tap dialog box to advance (works even though dialog HTML overlays canvas)
- **Viewport Meta**: `user-scalable=no, viewport-fit=cover` prevents pinch-zoom conflicts

#### Changed
- Touch-adaptive text: "Tap to continue" / "Tap to close" / "Tap to restart" on touch devices
- Ladybug catch prompt: "Tap again to try to catch it!" on touch devices
- Interaction prompt ("Press SPACE") hidden on touch devices (tap-to-interact replaces it)
- Bridge collision tightened to match visual railings (x: 297-353, was 295-355)
- Touch interaction hit radius: 40px (matches game's keyboard interaction range)
- Keyboard input takes priority over touch — pressing any key cancels touch movement
- Touch target cleared on area transitions and game restart

#### Technical
- New module: `src/systems/touch.js` (touch events, scaling, hit-testing, mobile detection)
- `.touch` CSS class on body enables mobile-specific styles
- `touch-action: none` and `-webkit-touch-callout: none` prevent browser gesture conflicts
- `inventory.toggleDisplay()` method added for HUD button
- Build: 22 modules, ~66KB JS bundle
- Zero build errors

#### Future Ideas
- Sound/mute HUD button (Press Start 2P font lacks music note glyph — needs custom icon or text label)

---

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
  - Stays at inside position (480, 150) permanently after gate unlocked, even after trade
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
- Sound/mute HUD button (Press Start 2P font lacks music note glyph — needs custom icon or text label)
