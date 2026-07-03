// Audio system - convention-based audio loading with graceful fallback
// Drop properly-named MP3s into public/audio/ and they auto-load.
// Missing files silently resolve to null; no audio plays = no errors.

const AUDIO_MANIFEST = {
  music: {
    meadow:     'audio/music/meadow.mp3',
    park:       'audio/music/park.mp3',
    playground: 'audio/music/playground.mp3',
    gate_area:  'audio/music/gate_area.mp3',
    woods:      'audio/music/woods.mp3',
    boathouse:  'audio/music/boathouse.mp3',
    cutscene:   'audio/music/cutscene.mp3',
  },
  sfx: {
    pickup:          'audio/sfx/pickup.mp3',
    trade:           'audio/sfx/trade.mp3',
    dialog_open:     'audio/sfx/dialog_open.mp3',
    dialog_advance:  'audio/sfx/dialog_advance.mp3',
    gate_unlock:     'audio/sfx/gate_unlock.mp3',
    logs_clear:      'audio/sfx/logs_clear.mp3',
    step:            'audio/sfx/step.mp3',
    area_transition: 'audio/sfx/area_transition.mp3',
  }
};

const loadedAudio = { music: {}, sfx: {} };
let muted = false;
let currentMusic = null;
let currentMusicKey = null;
let audioContextResumed = false;

function loadAudio(src) {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
    audio.addEventListener('error', () => resolve(null), { once: true });
    audio.src = src;
    audio.load();
  });
}

/**
 * Load all audio in parallel. Missing files resolve to null.
 * Call once at startup.
 * basePrefix lets pages served from a subdirectory (e.g. the 3D version
 * at /3d/) reach the shared public/audio/ folder ('../').
 */
export async function initAudio(basePrefix = '') {
  const musicEntries = Object.entries(AUDIO_MANIFEST.music)
    .map(([key, src]) => [key, basePrefix + src]);
  const sfxEntries = Object.entries(AUDIO_MANIFEST.sfx)
    .map(([key, src]) => [key, basePrefix + src]);

  const musicResults = await Promise.all(
    musicEntries.map(([key, src]) => loadAudio(src).then(audio => [key, audio]))
  );
  for (const [key, audio] of musicResults) {
    if (audio) {
      audio.loop = true;
      audio.volume = 0.3;
    }
    loadedAudio.music[key] = audio;
  }

  const sfxResults = await Promise.all(
    sfxEntries.map(([key, src]) => loadAudio(src).then(audio => [key, audio]))
  );
  for (const [key, audio] of sfxResults) {
    if (audio) {
      audio.volume = 0.5;
    }
    loadedAudio.sfx[key] = audio;
  }
}

/**
 * Play background music for the given area key.
 * Stops previous track. No-op if file wasn't loaded or muted.
 */
export function playMusic(areaKey) {
  if (muted) return;
  if (areaKey === currentMusicKey) return;

  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
  }

  const audio = loadedAudio.music[areaKey];
  if (!audio) {
    currentMusic = null;
    currentMusicKey = null;
    return;
  }

  currentMusic = audio;
  currentMusicKey = areaKey;
  audio.play().catch(() => {});
}

/**
 * Play a one-shot sound effect. Clones for overlapping plays.
 * No-op if file wasn't loaded or muted.
 */
export function playSFX(key) {
  if (muted) return;
  const audio = loadedAudio.sfx[key];
  if (!audio) return;

  const clone = audio.cloneNode();
  clone.volume = audio.volume;
  clone.play().catch(() => {});
}

/**
 * Stop all music.
 */
export function stopMusic() {
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
    currentMusic = null;
    currentMusicKey = null;
  }
}

/**
 * Toggle mute. Returns new mute state.
 */
export function toggleMute() {
  muted = !muted;
  if (muted) {
    stopMusic();
  }
  return muted;
}

/**
 * Get current mute state.
 */
export function isMuted() {
  return muted;
}

/**
 * Call on first user interaction to handle browser autoplay policy.
 */
export function resumeAudioOnInteraction() {
  if (audioContextResumed) return;
  audioContextResumed = true;
  if (currentMusicKey && currentMusic) {
    currentMusic.play().catch(() => {});
  }
}
