# The Ladybug Quest 3D

A 3D reimagining of The Ladybug Quest, built with [three.js](https://threejs.org/).
Runs in the browser alongside the 8-bit original — same repo, fully isolated folder,
separate JS bundle (the original game does not load any of this code).

![status](https://img.shields.io/badge/status-prototype-orange)

## What's shared with the 8-bit game

The 3D version imports the original game's **data layer directly** — there is one
source of truth for the story:

| Shared file | What it provides |
|---|---|
| `src/data/npcs.js` | All NPC dialog, trades, and positions |
| `src/data/items.js` | World items and starting inventory |
| `src/data/areas.js` | The area graph (names, exits, NPC placement) |
| `src/data/cutscenes.js` | Intro and ending cutscene text |

The fetch-quest mechanics (dialog phase machine, trade prompts, before/complete
dialog selection, gate/logs progression, ladybug ending) are ports of
`src/systems/dialog.js`, `src/systems/interaction.js`, and `src/game/world.js`.
The player's *logical* position lives in the original 640×480 coordinate space,
so every NPC position, interaction range, and area-exit rule from the 2D game
works verbatim — it's just projected onto a 3D ground plane at render time
(`toX`/`toZ` in `src/state.js`).

Editing dialog in `src/data/npcs.js` updates **both** games.

## Running it

```bash
npm install
npm run dev       # then open http://localhost:5173/3d/
npm run build     # builds BOTH games into dist/ (8-bit at /, 3D at /3d/)
```

## Controls

Desktop:
- **WASD / Arrow keys** — move
- **SPACE / Enter** — interact, advance dialog
- **I** — toggle inventory
- **P** — manual save · **M** — mute
- Click **Yes / No** on trade prompts

Mobile / touch:
- **Tap ground** — walk to that spot (tap past an area edge to exit)
- **Tap NPC / object** — walk over and auto-interact
- **Tap dialog** — advance (Yes/No buttons for trades and the proposal)
- **Tap cutscene** — next beat

## The full quest chain works

Gum → Hippie → Flower → Kid → Axe · Coffee cart → birdseed hint →
Birdseed → Bird → Key → Gate → Squirrel → Ball → Dog → Leash →
Fisherman → Net → the ladybug by the old oak tree → ending.

Easter eggs made the jump too: the Gold Doubloons in the woods, the
Camperdown Elm plaque, and the faithful-to-real-life engagement horse poop.

The **proposal sequence** is in as well: the boy stops the girl before she
first leaves the meadow — "Wait!", the walk over, the Snoopy line, the
Yes/No prompt (declining re-asks with only Yes, as is right and proper),
the ring, floating hearts, and every NPC congratulating you once afterward.

## Architecture

```
3d/
  index.html          HTML shell + overlay UI (dialog box, inventory, cutscenes)
  src/
    main.js           bootstrap, render loop, mode state machine
    state.js          runtime state; imports shared data; 2D→3D coord mapping
    player.js         movement, collision, camera follow, area transitions
    quest.js          interaction checks (port of systems/interaction.js)
    dialog.js         dialog phase machine (port of systems/dialog.js)
    touch.js          tap-to-move / tap-to-interact (ground-plane raycast)
    areas3d.js        procedural low-poly builders for the six areas
    characters.js     primitive-based character meshes (no external assets)
    lineup.js         cast viewer (/3d/lineup.html) — turntable of all models
    save.js           localStorage save/load (own key, never collides with 2D)
    hud.js            HTML overlay helpers
```

Everything is procedural geometry — no models, textures, or other assets to load.
Character colors are taken from each sprite's palette in
`src/rendering/sprites.js` (the bird is a robin, the dog a golden retriever,
the fisherman wears slate waders, and so on). To iterate on the models, open
**`/3d/lineup.html`** — a slow-turntable lineup of the whole cast.

## Audio & saves

- **Audio** reuses the 8-bit game's `src/systems/audio.js` directly — the same
  drop-in MP3s in `public/audio/` play in both games (music per area + SFX for
  dialog, trades, pickups, gate, logs, transitions). Missing files stay silent.
  **M** toggles mute.
- **Saves** auto-write at every trade, pickup, area change, and after the
  proposal (**P** saves manually). Relaunching shows a Continue / New Game
  prompt. The 3D game uses its own localStorage key, so 2D and 3D saves
  coexist.

## Not (yet) in the 3D version

- Character animation rigs (characters bob, flap, and wag procedurally)

## Standalone desktop app?

Since it's a self-contained static web build, wrapping it with
[Tauri](https://tauri.app/) or Electron later is straightforward — no code
changes needed, just point the wrapper at `dist/3d/`.
