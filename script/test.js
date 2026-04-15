document.addEventListener('DOMContentLoaded', function() {
/* =============================================================
   walgi-script.js
   Walgi Smart Home — Interactive Mockup Controller

   Sections:
   1. Scroll Reveal Animation
   2. Email Waitlist Form
   3. Lights Tile  → Light / Dark Mode
   4. AC Tile      → Temperature + Site Colour Theme
   5. Audio Tile   → On / Off toggle
   6. Lock Tile    → Gate Overlay (locks / unlocks entire site)
   ============================================================= */


/* ─────────────────────────────────────────────
   1. SCROLL REVEAL
   Uses IntersectionObserver to watch every element
   with class .rev — when it enters the viewport,
   adds class .vis which triggers a CSS fade-up animation.
   Each element staggers by 75ms for a cascade effect.
───────────────────────────────────────────── */
const obs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      // Stagger each visible element by 75ms
      setTimeout(() => e.target.classList.add('vis'), i * 75);
      // Stop watching once revealed — no need to re-trigger
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 }); // Trigger when 8% of element is visible

// Attach observer to every .rev element on the page
document.querySelectorAll('.rev').forEach(el => obs.observe(el));


/* ─────────────────────────────────────────────
   2. EMAIL WAITLIST FORM
   When the user clicks "Join Waitlist":
   - Validates that the input contains '@' (basic email check)
   - Clears the input and shows a success message in placeholder
───────────────────────────────────────────── */
document.querySelector('.email-form button').addEventListener('click', () => {
  const inp = document.querySelector('.email-form input');
  if (inp.value && inp.value.includes('@')) {
    inp.value = '';
    inp.placeholder = '✓ You\'re on the list!'; // Success feedback
  }
});


/* ─────────────────────────────────────────────
   3. LIGHTS TILE → LIGHT / DARK MODE

   The 💡 Lights tile controls the entire site theme.
   - Lights ON  = Light mode (default, white background)
   - Lights OFF = Dark mode  (black background)

   Toggling adds/removes class 'dark-mode' on <body>.
   All dark mode visual changes are handled in styles.css.
───────────────────────────────────────────── */
let lightsOn = true; // Default: lights are on (light mode)

const tileLights  = document.getElementById('tileLights');  // The tile element
const stateLights = document.getElementById('stateLights'); // "On" / "Off" label

tileLights.addEventListener('click', () => {
  lightsOn = !lightsOn;

  tileLights.classList.toggle('on', lightsOn);
  stateLights.textContent = lightsOn ? 'On' : 'Off';

  // Use requestAnimationFrame to ensure the class toggle
  // happens in a single paint frame — everything updates together
  requestAnimationFrame(() => {
    document.body.classList.toggle('dark-mode', !lightsOn);
  });

  // Dim/brighten phone background image
  const bgImg = document.getElementById('mockupBgImg');
  if (bgImg) bgImg.style.opacity = lightsOn ? '0.45' : '0.15';

  document.getElementById('mockupHint').textContent =
    lightsOn ? '💡 Lights control site theme' : '🌙 Dark mode active';
});


/* ─────────────────────────────────────────────
   4. AC TILE + TEMPERATURE → SITE COLOUR THEME

   The ❄️ AC tile and ▲▼ arrows control temperature.
   Temperature range: 16°C – 32°C

   - ≤ 20° = COOL theme → site gets a blue/cyan tint
   - 21–24° = NEUTRAL  → site returns to normal colours
   - ≥ 25° = WARM theme → site gets an orange/amber tint

   The theme is applied by adding 'temp-warm' or 'temp-cool'
   class to <body>. All colour overrides live in styles.css.

   The temperature ring uses a conic-gradient to show
   a progress arc that changes colour with temperature.
───────────────────────────────────────────── */
let temp = 22;   // Starting temperature in °C
let acOn = true; // AC starts on

// DOM references for the AC section
const tempNum  = document.getElementById('tempNum');   // Big number "22°"
const tempRing = document.getElementById('tempRing');  // Circular ring visual
const stateAC  = document.getElementById('stateAC');   // Tile state label
const iconAC   = document.getElementById('iconAC');    // ❄️ or 🌡️ emoji
const tileAC   = document.getElementById('tileAC');    // The AC tile

/**
 * updateTemp()
 * Called every time temperature changes or AC is toggled.
 * Updates: number display, ring colour/arc, tile colour,
 *          site-wide theme class, and hint text.
 */
function updateTemp() {
  // Update displayed temperature number
  tempNum.textContent = temp + '°';
  stateAC.textContent = acOn ? temp + '°' : 'Off';

  const isWarm = temp >= 25; // Orange/warm zone
  const isCool = temp <= 20; // Blue/cool zone

  /* ── Apply site-wide temperature theme ──
     Only applies theme if AC is on.
     If AC is off, both theme classes are removed. */
  if (acOn) {
    document.body.classList.toggle('temp-warm', isWarm);
    document.body.classList.toggle('temp-cool', isCool);
    // Remove both if in neutral range (21–24°)
    if (!isWarm && !isCool) {
      document.body.classList.remove('temp-warm', 'temp-cool');
    }
  } else {
    document.body.classList.remove('temp-warm', 'temp-cool');
  }

  /* ── Update the temperature ring visual ──
     Uses a conic-gradient to draw a coloured arc.
     The arc percentage grows/shrinks with temperature. */
  if (isWarm) {
    // Orange arc — percentage grows as temp rises above 15°
    const pct = Math.min(95, (temp - 15) * 5);
    tempRing.style.background =
      `conic-gradient(rgba(255,140,0,.55) 0% ${pct}%, rgba(255,255,255,.04) ${pct}% 100%)`;
    tempRing.classList.add('warm');
    tempRing.classList.remove('cool');
    iconAC.textContent = '🌡️';        // Switch to thermometer icon
    tileAC.classList.add('warm-ac');  // Orange tile highlight

  } else if (isCool) {
    // Blue arc — percentage shrinks as temp drops below 21°
    const pct = Math.max(10, (temp - 10) * 6);
    tempRing.style.background =
      `conic-gradient(rgba(69,212,255,.5) 0% ${pct}%, rgba(255,255,255,.04) ${pct}% 100%)`;
    tempRing.classList.add('cool');
    tempRing.classList.remove('warm');
    iconAC.textContent = '❄️';           // Snowflake icon
    tileAC.classList.remove('warm-ac');  // Remove orange highlight

  } else {
    // Neutral white arc for 21–24°
    const pct = (temp - 15) * 13;
    tempRing.style.background =
      `conic-gradient(rgba(255,255,255,.15) 0% ${pct}%, rgba(255,255,255,.04) ${pct}% 100%)`;
    tempRing.classList.remove('warm', 'cool');
    iconAC.textContent = '❄️';
    tileAC.classList.remove('warm-ac');
  }

  // Colour the temperature number to match the theme
  tempNum.style.color = isWarm ? '#ff9a3c' : isCool ? '#45d4ff' : '';

  // Update hint text at bottom of mockup
  document.getElementById('mockupHint').textContent =
    isWarm ? '🌡️ Warm theme active' :
    isCool ? '❄️ Cool theme active' :
    '💡 Lights control site theme';
}

/* ── Temperature UP button (▲) ──
   Increases temp by 1° up to max 32°.
   stopPropagation prevents the AC tile click from firing. */
document.getElementById('tempUp').addEventListener('click', e => {
  e.stopPropagation();
  if (acOn && temp < 32) { temp++; updateTemp(); }
});

/* ── Temperature DOWN button (▼) ──
   Decreases temp by 1° down to min 16°. */
document.getElementById('tempDn').addEventListener('click', e => {
  e.stopPropagation();
  if (acOn && temp > 16) { temp--; updateTemp(); }
});

/* ── AC tile click — toggle AC on/off ──
   When off: resets the ring to blank, removes theme classes.
   When on:  restores the current temperature display. */
tileAC.addEventListener('click', () => {
  acOn = !acOn;
  tileAC.classList.toggle('on', acOn);
  stateAC.textContent = acOn ? temp + '°' : 'Off';
  iconAC.textContent  = acOn ? (temp >= 25 ? '🌡️' : '❄️') : '❄️';

  if (!acOn) {
    // AC turned off — reset ring and remove site theme
    tempRing.style.background = 'conic-gradient(rgba(255,255,255,.05) 0% 100%)';
    tempRing.classList.remove('warm', 'cool');
    tempNum.style.color = '';
    document.body.classList.remove('temp-warm', 'temp-cool');
    document.getElementById('mockupHint').textContent = '💡 Lights control site theme';
  } else {
    // AC turned on — restore temperature display
    updateTemp();
  }
});


/* ─────────────────────────────────────────────
   5. AUDIO TILE + PLAYLIST PLAYER

   The 🎵 Audio tile shows/hides a floating playlist
   player panel that slides up from the bottom right.

   Playlist features:
   - Play / Pause toggle
   - Previous / Next track buttons
   - Clickable track list — click any track to play it
   - Progress bar — updates every second, click to seek
   - Volume slider
   - Animated equaliser bars while playing
   - Auto-advances to next track when current one ends

   To add tracks: update the <li data-src="..."> items
   in walgi-index.html and add your .mp3 files to the folder.
───────────────────────────────────────────── */
let audioOn = false;

const tileAudio      = document.getElementById('tileAudio');
const stateAudio     = document.getElementById('stateAudio');
const playlistPlayer = document.getElementById('playlistPlayer');
const bgAudio        = document.getElementById('bgAudio');
const plTrackName    = document.getElementById('plTrackName');
const plPlayPause    = document.getElementById('plPlayPause');
const plPrev         = document.getElementById('plPrev');
const plNext         = document.getElementById('plNext');
const plList         = document.getElementById('plList');
const plProgressFill = document.getElementById('plProgressFill');
const plProgressBar  = document.getElementById('plProgressBar');
const plCurrentTime  = document.getElementById('plCurrentTime');
const plDuration     = document.getElementById('plDuration');
const plVolume       = document.getElementById('plVolume');
const plEq           = document.getElementById('plEq');

/* Build the tracks array from the <li> elements in the HTML.
   Each item has a data-src attribute pointing to the audio file. */
const trackItems = Array.from(plList.querySelectorAll('.pl-item'));
const tracks = trackItems.map(li => ({
  name : li.textContent.trim(), // Display name from the li text
  src  : li.dataset.src         // File path from data-src attribute
}));

let currentTrack = 0;   // Index of the currently loaded track
let isPlaying    = false; // Current playback state

/**
 * formatTime(seconds)
 * Converts a number of seconds into "m:ss" display format.
 * e.g. 75 → "1:15"
 */
function formatTime(s) {
  if (isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

/**
 * loadTrack(index)
 * Loads a track by index — updates the audio src,
 * highlights the active item in the list, and updates
 * the displayed track name.
 * Does NOT auto-play — call playTrack() after if needed.
 */
function loadTrack(index) {
  currentTrack = index;

  // Update audio source
  bgAudio.src = tracks[index].src;
  bgAudio.volume = parseFloat(plVolume.value);

  // Update track name display
  plTrackName.textContent = tracks[index].name.replace('🎵 ', '');

  // Update active highlight in the track list
  trackItems.forEach((li, i) => {
    li.classList.toggle('active', i === index);
  });

  // Reset progress bar display
  plProgressFill.style.width = '0%';
  plCurrentTime.textContent  = '0:00';
  plDuration.textContent     = '0:00';
}

/**
 * playTrack()
 * Starts playback and updates all UI state:
 * play button icon, tile state, equaliser animation.
 */
function playTrack() {
  bgAudio.play().catch(err => console.warn('Playback blocked:', err));
  isPlaying = true;
  plPlayPause.textContent  = '⏸'; // Switch to pause icon
  plEq.classList.add('active');   // Show animated equaliser
}

/**
 * pauseTrack()
 * Pauses playback and updates UI state.
 */
function pauseTrack() {
  bgAudio.pause();
  isPlaying = false;
  plPlayPause.textContent   = '▶'; // Switch to play icon
  plEq.classList.remove('active'); // Hide equaliser
}

/* ── Audio tile click ──
   Shows/hides the playlist panel and starts/stops playback. */
tileAudio.addEventListener('click', () => {
  audioOn = !audioOn;
  tileAudio.classList.toggle('on', audioOn);
  stateAudio.textContent = audioOn ? 'Playing' : 'Off';

  if (audioOn) {
    playlistPlayer.classList.add('pl-visible'); // Slide panel up
    if (!bgAudio.src || bgAudio.src === window.location.href) {
      loadTrack(0); // Load first track if nothing is loaded yet
    }
    playTrack();
  } else {
    playlistPlayer.classList.remove('pl-visible'); // Slide panel down
    pauseTrack();
  }
});

/* ── Play / Pause button ── */
plPlayPause.addEventListener('click', () => {
  if (isPlaying) {
    pauseTrack();
    stateAudio.textContent = 'Paused';
  } else {
    playTrack();
    stateAudio.textContent = 'Playing';
  }
});

/* ── Previous track button ──
   Wraps around to last track if on first. */
plPrev.addEventListener('click', () => {
  const prevIndex = (currentTrack - 1 + tracks.length) % tracks.length;
  loadTrack(prevIndex);
  if (isPlaying) playTrack();
});

/* ── Next track button ──
   Wraps around to first track if on last. */
plNext.addEventListener('click', () => {
  const nextIndex = (currentTrack + 1) % tracks.length;
  loadTrack(nextIndex);
  if (isPlaying) playTrack();
});

/* ── Click a track in the list to play it directly ── */
trackItems.forEach((li, i) => {
  li.addEventListener('click', () => {
    loadTrack(i);
    playTrack();
    // Make sure the tile and player are in the "on" state
    if (!audioOn) {
      audioOn = true;
      tileAudio.classList.add('on');
      stateAudio.textContent = 'Playing';
      playlistPlayer.classList.add('pl-visible');
    }
  });
});

/* ── Auto-advance to next track when current ends ── */
bgAudio.addEventListener('ended', () => {
  const nextIndex = (currentTrack + 1) % tracks.length;
  loadTrack(nextIndex);
  playTrack();
});

/* ── Update progress bar and time display every second ── */
bgAudio.addEventListener('timeupdate', () => {
  if (!bgAudio.duration) return;
  const pct = (bgAudio.currentTime / bgAudio.duration) * 100;
  plProgressFill.style.width = pct + '%';
  plCurrentTime.textContent  = formatTime(bgAudio.currentTime);
  plDuration.textContent     = formatTime(bgAudio.duration);
});

/* ── Click on the progress bar to seek ── */
plProgressBar.addEventListener('click', e => {
  const rect  = plProgressBar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const seekPct = clickX / rect.width;
  bgAudio.currentTime = seekPct * bgAudio.duration;
});

/* ── Volume slider ── */
plVolume.addEventListener('input', () => {
  bgAudio.volume = parseFloat(plVolume.value);
});

/* Initialise: load the first track but don't auto-play */
loadTrack(0);


/* ─────────────────────────────────────────────
   6. LOCK TILE → GATE OVERLAY

   The 🔒 Lock tile controls a full-screen gate overlay.

   - LOCKED   → two metal gate panels slide in from left
                and right, covering the entire website.
                A "Site Locked" message appears in the centre
                with an "Unlock Gate →" button.
   - UNLOCKED → gate panels slide back out, site is revealed.

   The phone mockup (z-index: 400) and the gate message
   (z-index: 9999) always remain visible above the gate
   so the user can always reach the unlock button.

   setLocked(true)  = close the gate
   setLocked(false) = open the gate
───────────────────────────────────────────── */
const gateOverlay   = document.getElementById('gateOverlay');   // Gate panel container
const gateMessage   = document.getElementById('gateMessage');   // "Site Locked" message div
const gateUnlockBtn = document.getElementById('gateUnlockBtn'); // Unlock button in message

let locked = false; // Current lock state (false = unlocked by default)

const tileLock  = document.getElementById('tileLock');  // Lock tile in mockup
const stateLock = document.getElementById('stateLock'); // "Locked" / "Open" label
const iconLock  = document.getElementById('iconLock');  // 🔒 / 🔓 emoji

/**
 * setLocked(val)
 * @param {boolean} val - true = lock the site, false = unlock
 *
 * Controls both the gate overlay animation and the
 * locked message visibility. The message fades in
 * 600ms after locking (after gate panels finish sliding in).
 */
function setLocked(val) {
  locked = val;

  // Update the lock tile appearance in the mockup
  tileLock.classList.toggle('on', locked);
  stateLock.textContent = locked ? 'Locked' : 'Open';
  iconLock.textContent  = locked ? '🔒' : '🔓';
  stateLock.style.color = locked ? '' : '#6fff9e'; // Green tint when unlocked

  // Toggle the .locked class on the overlay — CSS handles the slide animation
  gateOverlay.classList.toggle('locked', locked);

  if (locked) {
    // Wait 600ms for gate panels to slide in before showing the message
    setTimeout(() => gateMessage.classList.add('visible'), 600);
  } else {
    // Instantly hide the message when unlocking
    gateMessage.classList.remove('visible');
  }
}

// Lock tile click — toggles between locked and unlocked
tileLock.addEventListener('click', () => setLocked(!locked));

// "Unlock Gate →" button inside the gate message overlay
gateUnlockBtn.addEventListener('click', () => setLocked(false));


/* ─────────────────────────────────────────────
   VIDEO PLAYER
   Custom play button overlay on the featured video.
   - Click play button → hides overlay, starts video
   - Click video while playing → pauses it, shows overlay
───────────────────────────────────────────── */
const heroVideo   = document.getElementById('heroVideo');
const videoPlayBtn = document.getElementById('videoPlayBtn');

if (heroVideo && videoPlayBtn) {
  /* Play button click — start video, hide overlay */
  videoPlayBtn.addEventListener('click', () => {
    heroVideo.play();
    videoPlayBtn.classList.add('hidden');
    heroVideo.classList.add('playing');
  });

  /* Click on video while playing — pause and show overlay again */
  heroVideo.addEventListener('click', () => {
    if (!heroVideo.paused) {
      heroVideo.pause();
      videoPlayBtn.classList.remove('hidden');
      heroVideo.classList.remove('playing');
    }
  });

  /* When video ends — show play button again */
  heroVideo.addEventListener('ended', () => {
    videoPlayBtn.classList.remove('hidden');
    heroVideo.classList.remove('playing');
  });
}


/* ─────────────────────────────────────────────
   INITIALISE
   Run once on page load to set starting states.
───────────────────────────────────────────── */

// Start with gate locked — visitors see the dramatic opening animation
setLocked(true);

// Set the initial temperature ring appearance
updateTemp();

/* ═══════════════════════════════════════════════
   3D MODEL VIEWER — Controls
   Handles Reset Camera + Auto-Rotate toggle
═══════════════════════════════════════════════ */
(function() {
  const mv          = document.getElementById('walgiModel');
  const resetBtn    = document.getElementById('modelResetBtn');
  const rotateBtn   = document.getElementById('modelAutoRotateBtn');
  if (!mv || !resetBtn || !rotateBtn) return;

  let isRotating = true;

  /* Reset camera to default position */
  resetBtn.addEventListener('click', () => {
    mv.cameraOrbit  = 'auto auto auto';
    mv.cameraTarget = 'auto auto auto';
    mv.fieldOfView  = 'auto';
    // Brief flash to confirm reset
    resetBtn.textContent = '✓ Reset';
    setTimeout(() => { resetBtn.textContent = '⟳ Reset'; }, 800);
  });

  /* Toggle auto-rotate */
  rotateBtn.addEventListener('click', () => {
    isRotating = !isRotating;
    mv.autoRotate          = isRotating;
    rotateBtn.textContent  = isRotating ? '⏸ Pause' : '▶ Rotate';
  });

  /* Resume rotation when user stops interacting */
  mv.addEventListener('camera-change', () => {
    if (isRotating) {
      clearTimeout(mv._resumeTimer);
      mv.autoRotate = false;
      mv._resumeTimer = setTimeout(() => {
        if (isRotating) mv.autoRotate = true;
      }, 2000);
    }
  });
})();});