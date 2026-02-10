// Sprite loader - convention-based image loading with graceful fallback
// Drop properly-named PNGs into public/sprites/ and they auto-load.
// Missing files silently resolve to null; procedural drawing takes over.

const SPRITE_MANIFEST = {
  // Characters
  player: {
    path: 'sprites/characters/girl.png',
    frameWidth: 24, frameHeight: 32, frameCount: 8
  },
  boy:        { path: 'sprites/characters/boy.png' },
  dog:        { path: 'sprites/characters/dog.png' },
  bird:       { path: 'sprites/characters/bird.png' },
  squirrel:   { path: 'sprites/characters/squirrel.png' },
  hippie:     { path: 'sprites/characters/hippie.png' },
  fisherman:  { path: 'sprites/characters/fisherman.png' },
  kid:        { path: 'sprites/characters/kid.png' },
  parent:     { path: 'sprites/characters/parent.png' },
  coffeeCart: { path: 'sprites/characters/coffee_cart.png' },
  ladybug:    { path: 'sprites/characters/ladybug.png' },

  // Environment
  tree:           { path: 'sprites/environment/tree.png' },
  tree_large:     { path: 'sprites/environment/tree_large.png' },
  camperdown_elm: { path: 'sprites/environment/camperdown_elm.png' },
  rock:           { path: 'sprites/environment/rock.png' },
  gate:           { path: 'sprites/environment/gate.png' },
  logs:           { path: 'sprites/environment/logs.png' },
  leaf_pile:      { path: 'sprites/environment/leaf_pile.png' },
  flowers_pink:      { path: 'sprites/environment/flowers_pink.png' },
  flowers_orange:    { path: 'sprites/environment/flowers_orange.png' },
  flowers_yellow:    { path: 'sprites/environment/flowers_yellow.png' },
  flowers_deeppink:  { path: 'sprites/environment/flowers_deeppink.png' },
  flowers_tomato:    { path: 'sprites/environment/flowers_tomato.png' },

  // Portraits (80x80 for dialog box)
  portrait_girl: { path: 'sprites/portraits/girl.png' },
  portrait_boy:  { path: 'sprites/portraits/boy.png' },
  portrait_dog:  { path: 'sprites/portraits/dog.png' },
};

// Map hex color codes used in drawFlowers() to manifest keys
const FLOWER_COLOR_MAP = {
  '#ff69b4': 'flowers_pink',
  '#ffa500': 'flowers_orange',
  '#ffff00': 'flowers_yellow',
  '#ff1493': 'flowers_deeppink',
  '#ff6347': 'flowers_tomato',
};

// Player sprite sheet frame layout:
// [Down-0, Down-1, Up-0, Up-1, Left-0, Left-1, Right-0, Right-1]
const DIRECTION_BASE_FRAME = { down: 0, up: 2, left: 6, right: 4 };

const loadedSprites = {};

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Load all sprites in parallel. Missing files resolve to null.
 * Call once at startup before the game loop.
 */
export async function initSprites() {
  const entries = Object.entries(SPRITE_MANIFEST);
  const results = await Promise.all(
    entries.map(([key, def]) => loadImage(def.path).then(img => [key, img]))
  );
  for (const [key, img] of results) {
    loadedSprites[key] = img;
  }
}

/**
 * Get a loaded sprite image, or null if not available.
 */
export function getSprite(key) {
  return loadedSprites[key] || null;
}

/**
 * Get sprite metadata (frame dimensions for sprite sheets).
 */
export function getSpriteInfo(key) {
  return SPRITE_MANIFEST[key] || null;
}

/**
 * Check if a sprite image was successfully loaded.
 */
export function hasSprite(key) {
  return !!loadedSprites[key];
}

/**
 * Resolve a flower hex color to a sprite key.
 */
export function getFlowerSpriteKey(hexColor) {
  return FLOWER_COLOR_MAP[hexColor] || null;
}

/**
 * Get the source rectangle for a player animation frame.
 * @param {string} direction - 'up'|'down'|'left'|'right'
 * @param {number} animFrame - 0 or 1
 * @returns {{ sx: number, sy: number, sw: number, sh: number }|null}
 */
export function getPlayerFrame(direction, animFrame) {
  const info = SPRITE_MANIFEST.player;
  if (!info) return null;
  const frameIndex = DIRECTION_BASE_FRAME[direction] + animFrame;
  return {
    sx: frameIndex * info.frameWidth,
    sy: 0,
    sw: info.frameWidth,
    sh: info.frameHeight
  };
}
