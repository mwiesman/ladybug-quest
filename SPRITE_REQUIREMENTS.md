# Sprite Requirements

This document outlines all sprite assets needed to replace the current procedural pixel art system with proper sprite sheets.

## Overview

The game currently renders all graphics procedurally using `ctx.fillRect()` calls. This document specifies the sprite sheets needed to replace this system with `ctx.drawImage()` calls for better visual quality and easier art iteration.

## Technical Specifications

- **Style**: Pokemon GBA-inspired pixel art
- **Palette**: Limited color palette with black (#000000) outlines on all sprites
- **Format**: PNG with transparency
- **Grid**: Sprites should align to pixel-perfect grids
- **Anti-aliasing**: None (sharp pixels only)

## Character Sprites

### 1. Player Character (Girl)

**Dimensions**: 24×32 pixels per frame
**Animation States**: 4 directions × 2 frames each = 8 total sprites

**Sprite Sheet Layout**: `girl.png` (96×32 pixels)
```
[Down-1] [Down-2] [Up-1] [Up-2] [Left-1] [Left-2] [Right-1] [Right-2]
```

**Color Palette**:
- Hair: #8b4513 (brown), #654321 (dark brown)
- Skin: #ffd1a3 (peach)
- Dress: #ff69b4 (pink), #ff8dc7 (light pink)
- Pants: #4169e1 (blue)
- Shoes: #654321 (dark brown)
- Smile: #dc143c (red), #fff (white teeth)
- Eyes: #fff (white), #654321 (brown pupils)

**Animation Notes**:
- Frame 1: legs together
- Frame 2: legs offset for walking
- Each direction needs distinct front/back/side views
- Down: Full face visible, brown hair with bangs, big smile
- Up: Back of head, hair visible, no face
- Left/Right: Profile view, one eye visible

**Reference**: See `src/rendering/sprites.js` lines 20-189

### 2. Boy Character (Static NPC)

**Dimensions**: 24×32 pixels
**Animation**: 1 static sprite (front-facing only)

**Color Palette**:
- Hair: #2c2c2c (dark gray/black)
- Skin: #ffd1a3 (peach)
- Shirt: #4682b4 (blue), #5a9bd4 (light blue sleeves)
- Pants: #2c5aa0 (dark blue)
- Shoes: #1a1a1a (black)
- Face paint: #9370db (purple), #4169e1 (blue), #ff1493 (pink), #7b68ee (lavender)
- Eyes: #fff (white), #654321 (brown pupils)

**Reference**: See `src/rendering/sprites.js` lines 191-236

### 3. Dog NPC

**Dimensions**: 34×28 pixels
**Animation**: 1 static sprite (side profile)

**Color Palette**:
- Fur: #daa520 (goldenrod), #f0e68c (light yellow chest/face)
- Details: #b8860b (dark gold)
- Eyes: #2c1810 (dark brown), #fff (white highlights)
- Nose: #1a1a1a (black)
- Collar: #dc143c (red), #ffd700 (gold tag)

**Reference**: See `src/rendering/sprites.js` lines 242-281

### 4. Bird NPC

**Dimensions**: 24×22 pixels
**Animation**: 1 static sprite

**Color Palette**:
- Body: #8b4513 (brown), #ff6347 (red chest)
- Wings: #654321 (dark brown)
- Beak: #ffa500 (orange)
- Legs: #ff8c00 (dark orange)
- Eyes: #1a1a1a (black), #fff (white highlights)

**Reference**: See `src/rendering/sprites.js` lines 282-310

### 5. Squirrel NPC

**Dimensions**: 34×28 pixels
**Animation**: 1 static sprite

**Color Palette**:
- Fur: #8b6914 (brown), #a0522d (sienna)
- Belly: #d2a679 (tan)
- Tail: #a0832d (light brown)
- Nose: #1a1a1a (black)
- Eyes: #2c1810 (dark brown), #fff (white highlights)

**Reference**: See `src/rendering/sprites.js` lines 312-348

### 6. Hippie NPC

**Dimensions**: 24×28 pixels
**Animation**: 1 static sprite

**Color Palette**:
- Skin: #ffd1a3 (peach)
- Hair: #8b7355 (long brown)
- Headband: #ff6347 (red)
- Shirt: #9370db (purple)
- Pants: #4169e1 (blue)
- Eyes: #654321 (brown), #fff (white highlights)
- Mouth: #c97a5f (smile)

**Reference**: See `src/rendering/sprites.js` lines 349-373

### 7. Fisherman NPC

**Dimensions**: 24×32 pixels
**Animation**: 1 static sprite (with fishing rod)

**Color Palette**:
- Skin: #ffd1a3 (peach)
- Hat: #8b4513 (brown)
- Beard: #696969 (gray)
- Vest: #2f4f4f (dark slate)
- Pants: #2f4f4f (dark slate)
- Shoes: #654321 (brown)
- Fishing rod: #8b4513 (brown, 2px stroke)
- Eyes: #654321 (brown)

**Reference**: See `src/rendering/sprites.js` lines 374-403

### 8. Kid NPC

**Dimensions**: 24×26 pixels
**Animation**: 1 static sprite (smaller than adults)

**Color Palette**:
- Hair: #ff8c00 (orange)
- Skin: #ffd1a3 (peach)
- Shirt: #ffa500 (orange)
- Pants: #4169e1 (blue)
- Shoes: #654321 (brown)
- Eyes: #654321 (brown), #fff (white highlights)
- Mouth: #c97a5f (smile)

**Reference**: See `src/rendering/sprites.js` lines 404-432

### 9. Parent NPC

**Dimensions**: 24×32 pixels
**Animation**: 1 static sprite

**Color Palette**:
- Hair: #4a4a4a (dark gray)
- Skin: #ffd1a3 (peach)
- Shirt: #6b8e23 (olive green)
- Pants: #2c5aa0 (blue)
- Shoes: #1a1a1a (black)
- Eyes: #654321 (brown), #fff (white highlights)
- Mouth: #c97a5f (smile)

**Reference**: See `src/rendering/sprites.js` lines 433-459

### 10. Coffee Cart (Static Object/NPC Hybrid)

**Dimensions**: 42×32 pixels
**Animation**: 1 static sprite

**Color Palette**:
- Cart body: #8b4513 (brown), #a0522d (lighter brown top)
- Window: #87ceeb (sky blue)
- Wheels: #1a1a1a (black)
- Text: #fff "COFFEE" (Press Start 2P font, 6px)

**Reference**: See `src/rendering/sprites.js` lines 460-477

### 11. Ladybug (Special Animated)

**Dimensions**: Variable (12px base, scales with pulse)
**Animation**: Pulsing glow effect (managed by code)

**Sprite**: Single 24×24 pixel sprite (to allow for glow)

**Color Palette**:
- Body: #ff0000 (red)
- Spots: #000 (black, 4 spots)
- Head: #000 (black circle)
- Center line: #000 (black, 2px vertical)
- Glow: Radial gradient from rgba(255, 0, 0, 0.3) to transparent

**Reference**: See `src/rendering/sprites.js` lines 482-518

## Environmental Sprites

### 12. Tree (Standard)

**Dimensions**: 32×33 pixels

**Color Palette**:
- Outline: #000 (black)
- Trunk: #654321 (brown), #4a2f1a (dark brown left side)
- Canopy layers: #2d5016 (dark green), #3a6b1f (medium green), #4a7c2f (light green)

**Reference**: See `src/rendering/sprites.js` lines 561-575

### 13. Large Oak Tree

**Dimensions**: 96×99 pixels (3× scale of standard tree)

**Color Palette**: Same as standard tree

**Reference**: See `src/rendering/sprites.js` lines 577-593

### 14. Camperdown Elm

**Dimensions**: 40×48 pixels
**Special Feature**: Plaque with text

**Color Palette**:
- Same as standard tree
- Plaque: #8b7355 (brown), #000 text "Camperdown Elm"

**Reference**: See `src/rendering/sprites.js` lines 595-618

### 15. Flowers

**Dimensions**: 8×8 pixels per flower cluster

**Variants**: 5 color variants (sprite sheet with 5 variations)

**Colors**:
- Petals: Variable (#ff69b4, #ffa500, #ffff00, #ff1493, #ff6347)
- Center: #ffeb3b (yellow, always)
- Stem: #228b22 (green)

**Reference**: See `src/rendering/sprites.js` lines 620-632

### 16. Rock

**Dimensions**: 28×24 pixels

**Color Palette**:
- Outline: #000 (black)
- Main: #696969 (gray)
- Highlight: #808080 (light gray)

**Reference**: See `src/rendering/sprites.js` lines 634-645

### 17. Gate

**Dimensions**: 28×36 pixels
**States**: 2 sprites (locked, unlocked/invisible)

**Color Palette**:
- Outline: #000 (black)
- Wood: #8b4513 (brown)
- Lock: #ffd700 (gold), #000 (keyhole)

**Reference**: See `src/rendering/sprites.js` lines 520-534

### 18. Log Pile

**Dimensions**: 54×34 pixels
**States**: 2 sprites (blocking, cleared/invisible)

**Color Palette**:
- Outline: #000 (black)
- Logs: #8b4513 (brown), #654321 (darker brown rings)

**Reference**: See `src/rendering/sprites.js` lines 536-549

### 19. Leaf Pile

**Dimensions**: 24×20 pixels

**Color Palette**:
- Leaves: #d2691e (chocolate), #ff6347 (tomato), #ffa500 (orange), #8b4513 (brown)

**Reference**: See `src/rendering/sprites.js` lines 551-559

### 20. Navigation Indicators

**Dimensions**: 24×36 pixels (including text)
**Variants**: 4 directions (up, down, left, right)

**Color Palette**:
- Arrow: rgba(255, 255, 255, 0.6), #fff (white stroke)
- Text: #fff (white fill), #000 (black stroke outline)

**Reference**: See `src/rendering/sprites.js` lines 669-719

## Dialog Portrait Sprites

**Dimensions**: 80×80 pixels each
**Count**: 3 portraits

### 1. Girl Portrait
- Close-up of girl's face
- Should match player sprite color palette
- Expressive, friendly

### 2. Boy Portrait
- Close-up of boy's face
- Should match boy NPC color palette
- Face paint visible

### 3. Dog Portrait
- Close-up of dog's face
- Should match dog NPC color palette
- Friendly expression

**Current**: Placeholder text labels
**Reference**: See `src/systems/dialog.js` lines 120-129

## Ground Texture

**Approach**: Tileable pattern or solid fills

**Option 1**: 16×16 pixel grass tile (repeats seamlessly)
**Option 2**: Keep procedural (current system works well)

**Color Palette**:
- Base: #7cb342 (light green)
- Variation: #689f38 (medium green)
- Dark blades: #558b2f (dark green)

**Reference**: See `src/rendering/sprites.js` lines 647-667

## Implementation Notes

### File Structure
```
public/
  sprites/
    characters/
      girl.png          # 96×32 (8 frames)
      boy.png           # 24×32 (1 frame)
      dog.png           # 34×28
      bird.png          # 24×22
      squirrel.png      # 34×28
      hippie.png        # 24×28
      fisherman.png     # 24×32
      kid.png           # 24×26
      parent.png        # 24×32
      coffeeCart.png    # 42×32
      ladybug.png       # 24×24
    environment/
      tree.png          # 32×33
      tree_large.png    # 96×99
      tree_elm.png      # 40×48
      flowers.png       # 40×8 (5 variants)
      rock.png          # 28×24
      gate.png          # 56×36 (2 states side-by-side)
      logs.png          # 108×34 (2 states)
      leaves.png        # 24×20
      arrows.png        # 24×144 (4 directions)
    portraits/
      girl_portrait.png # 80×80
      boy_portrait.png  # 80×80
      dog_portrait.png  # 80×80
```

### Code Integration

1. Create `src/rendering/spriteLoader.js`:
   - Load all sprite sheets on game init
   - Export sprite map for use in sprites.js

2. Update `src/rendering/sprites.js`:
   - Replace each `draw*()` function's fillRect calls with `ctx.drawImage()`
   - Maintain same function signatures for easy drop-in replacement

3. Update `src/systems/dialog.js`:
   - Replace `drawPortrait()` text placeholders with actual portrait sprites

### Animation System

For player character, modify `src/game/player.js`:
- `player.animFrame` already alternates between 0 and 1
- Map to correct sprite based on direction + frame:
  ```javascript
  const frameX = directionMap[player.direction] * 24 + player.animFrame * 24;
  ctx.drawImage(girlSprite, frameX, 0, 24, 32, x, y, 24, 32);
  ```

## Design Guidelines

1. **Consistency**: All sprites should use same outline thickness (1px black)
2. **Readability**: High contrast between elements at 640×480 resolution
3. **Personality**: Each character should be distinct and expressive
4. **Palette Cohesion**: Use colors from existing procedural art as base
5. **Pixeling**: No gradients (except ladybug glow), pure pixel clusters
6. **References**: Pokemon GBA games (Fire Red, Leaf Green, Emerald)

## Priority Order

### Phase 1 (Highest Impact):
1. Player character (girl) - 8 frames
2. Boy character - 1 frame
3. Dialog portraits - 3 sprites

### Phase 2 (NPCs):
4. Dog - 1 frame
5. Bird - 1 frame
6. Squirrel - 1 frame
7. Hippie - 1 frame
8. Fisherman - 1 frame
9. Kid - 1 frame
10. Parent - 1 frame
11. Coffee cart - 1 frame

### Phase 3 (Environment):
12. Ladybug - 1 frame
13. Trees (all 3 variants)
14. Flowers (5 variants)
15. Rocks, gates, logs, leaves
16. Navigation arrows

## Total Asset Count

- **Character sprites**: 19 frames (8 girl + 11 NPCs)
- **Portrait sprites**: 3 portraits
- **Environment sprites**: ~25 sprites (trees, objects, UI)
- **Total**: ~47 individual sprite assets

## Tools Recommended

- **Aseprite** (paid, industry standard for pixel art)
- **Piskel** (free, browser-based)
- **LibreSprite** (free, Aseprite fork)
- **GraphicsGale** (free, Windows)

## Next Steps

1. Choose artist/create sprites
2. Implement sprite loader system
3. Replace draw functions one-by-one (can do incrementally)
4. Test visual parity with original
5. Polish and add sprite-specific enhancements
