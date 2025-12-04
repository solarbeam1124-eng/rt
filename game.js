import { LEVELS } from './levels.js';
import { ROBLOX_INFO } from './info.js';

const homeScreen = document.getElementById('home');
const gameScreen = document.getElementById('game');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const overlayEl = document.getElementById('overlay-text');
const hudLevel = document.getElementById('hud-level');
const hudAttempt = document.getElementById('hud-attempt');

const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
const playBtn = document.getElementById('play');
const pauseBtn = document.getElementById('pause');
const homeBtn = document.getElementById('home-btn');

const pauseModal = document.getElementById('pause-modal');
const resumeBtn = document.getElementById('resume');
const restartBtn = document.getElementById('restart');
const quitBtn = document.getElementById('quit');

const levelLabel = document.getElementById('level-label');
const levelInfo = document.getElementById('level-info');

let currentLevelIndex = 0;
let attempt = 1;

// Audio
let audio = null;
let audioCtx = null;
let trackSource = null;
let beatFlash = 0; // 0..1

// Game state
let running = false;
let paused = false;
let lastTime = 0;

const player = {
  x: 0,
  y: 0,
  w: 44,
  h: 44,
  vx: 0,
  vy: 0,
  onGround: false
};

let cameraX = 0;

// Info cycle
let infoIndex = 0;

// Input
let jumpQueued = false;

// Utility
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }

function setScreen(home) {
  if (home) {
    homeScreen.classList.add('active');
    gameScreen.classList.remove('active');
  } else {
    homeScreen.classList.remove('active');
    gameScreen.classList.add('active');
  }
}

function updateHomeUI() {
  const lvl = LEVELS[currentLevelIndex];
  levelLabel.textContent = lvl.name;
  levelInfo.textContent =
    currentLevelIndex === 0 ? 'Beat-synced, basic spikes, clean parallax' :
    currentLevelIndex === 1 ? 'Sharper spikes, chroma effects, faster pace' :
    currentLevelIndex === 2 ? 'Scanlines, richer parallax, longer map' :
    currentLevelIndex === 3 ? 'Bloom, deeper scenery, tougher timing' :
    'Heat shimmer, max effects, final challenge';
}

leftBtn.addEventListener('click', () => {
  currentLevelIndex = (currentLevelIndex - 1 + LEVELS.length) % LEVELS.length;
  updateHomeUI();
});
rightBtn.addEventListener('click', () => {
  currentLevelIndex = (currentLevelIndex + 1) % LEVELS.length;
  updateHomeUI();
});

playBtn.addEventListener('click', () => startLevel(currentLevelIndex));
homeBtn.addEventListener('click', () => {
  stopAudio();
  running = false;
  setScreen(true);
});

pauseBtn.addEventListener('click', () => {
  if (!running) return;
  paused = true;
  pauseModal.classList.remove('hidden');
  audio && audio.pause();
});

resumeBtn.addEventListener('click', () => {
  if (!running) return;
  paused = false;
  pauseModal.classList.add('hidden');
  audio && audio.play();
});

restartBtn.addEventListener('click', () => {
  if (!running) return;
  paused = false;
  pauseModal.classList.add('hidden');
  attempt++;
  startLevel(currentLevelIndex, true);
});

quitBtn.addEventListener('click', () => {
  stopAudio();
  paused = false;
  running = false;
  pauseModal.classList.add('hidden');
  setScreen(true);
});

// Input
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
    e.preventDefault();
    queueJump();
  }
});
canvas.addEventListener('mousedown', queueJump);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); queueJump(); });

function queueJump() { jumpQueued = true; }

// Start/Stop audio
function stopAudio() {
  if (audio) { audio.pause(); audio = null; }
  if (trackSource) { try { trackSource.disconnect(); } catch {} trackSource = null; }
  if (audioCtx) { try { audioCtx.close(); } catch {} audioCtx = null; }
}

// Beat detection (simple): flash on amplitude changes using AnalyserNode
function setupAudio(src) {
  stopAudio();
  audio = new Audio(src);
  audio.loop = false;
  audio.preload = 'auto';
  audio.crossOrigin = 'anonymous';

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const track = audioCtx.createMediaElementSource(audio);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  track.connect(analyser);
  analyser.connect(audioCtx.destination);
  const buffer = new Uint8Array(analyser.frequencyBinCount);

  function probeBeat() {
    if (!running) return;
    analyser.getByteFrequencyData(buffer);
    // crude beat: look at low frequencies average
    let sum = 0, count = Math.min(20, buffer.length);
    for (let i = 0; i < count; i++) sum += buffer[i];
    const avg = sum / count;
    const threshold = 80; // adjust as needed
    if (avg > threshold) beatFlash = 1;
    requestAnimationFrame(probeBeat);
  }
  requestAnimationFrame(probeBeat);

  audio.play().catch(() => {
    // user gesture may be required; will play after next interaction
  });
}

function showInfo(levelId) {
  const infos = ROBLOX_INFO[levelId] || [];
  if (infos.length === 0) return;
  overlayEl.textContent = infos[infoIndex % infos.length];
  overlayEl.style.opacity = '1';
  overlayEl.style.transform = 'translateY(0)';
  // fade out slowly as you go further (requested “further you go the more it disappears”)
  setTimeout(() => {
    overlayEl.style.opacity = '0.3';
  }, 2000);
}

// Player reset
function initPlayer(lvl) {
  player.x = 60; // starts near left; camera will center
  player.y = lvl.floorY - player.h;
  player.vx = lvl.speed; // auto-run
  player.vy = 0;
  player.onGround = true;
  cameraX = player.x - canvas.width / 2; // center character
}

// Collision with spikes
function playerRect() {
  return { x: player.x, y: player.y, w: player.w, h: player.h };
}
function intersects(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < (b.y + b.h) && (a.y + a.h) > b.y;
}

// Restart run
function startLevel(index, keepAttempt = false) {
  const lvl = LEVELS[index];
  currentLevelIndex = index;
  if (!keepAttempt) attempt = 1;
  infoIndex = 0;

  setScreen(false);
  hudLevel.textContent = lvl.name;
  hudAttempt.textContent = `Attempt ${attempt}`;

  initPlayer(lvl);
  running = true;
  paused = false;
  lastTime = performance.now();

  // overlay info shows at start
  showInfo(lvl.id);

  // audio
  setupAudio(lvl.audio);

  // loop
  requestAnimationFrame(loop);
}

function dieAndRestart() {
  const lvl = LEVELS[currentLevelIndex];
  attempt++;
  infoIndex++; // next info on death
  hudAttempt.textContent = `Attempt ${attempt}`;
  // death particles
  spawnParticles(player.x, player.y + player.h / 2, 22, '#ff4d6d');
  // reset
  initPlayer(lvl);
  // show next info
  showInfo(lvl.id);
}

function completeLevel() {
  stopAudio();
  running = false;
  paused = false;
  // celebratory particles
  spawnParticles(player.x, player.y, 80, '#7ef5ff');
  // go home after brief delay
  setTimeout(() => setScreen(true), 1200);
}

// Particles
const particles = [];
function spawnParticles(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6 - 2,
      life: 1.0,
      color
    });
  }
}

// Rendering helpers
function drawBackground(lvl, t) {
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, lvl.theme.sky[0]);
  g.addColorStop(1, lvl.theme.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // parallax layers
  lvl.theme.parallaxLayers.forEach((layer, i) => {
    const baseY = canvas.height - layer.height;
    const scroll = (cameraX * layer.speed) % canvas.width;
    ctx.fillStyle = layer.color;
    ctx.fillRect(-scroll, baseY, canvas.width + 40, layer.height);
    ctx.fillRect(-scroll + canvas.width, baseY, canvas.width + 40, layer.height);
  });

  // beat flash overlay
  if (beatFlash > 0) {
    const alpha = beatFlash * 0.25;
    ctx.fillStyle = `rgba(77,177,255,${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    beatFlash = Math.max(0, beatFlash - 0.08);
  }

  // scanlines
  if (lvl.theme.fx.scanlines) {
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#000';
    for (let y = 0; y < canvas.height; y += 4) {
      ctx.fillRect(0, y, canvas.width, 2);
    }
    ctx.globalAlpha = 1;
  }

  // heat shimmer (final level)
  if (lvl.theme.fx.heat) {
    const amplitude = 2;
    const wavelength = 120;
    ctx.save();
    ctx.globalAlpha = 0.04;
    for (let y = canvas.height - 160; y < canvas.height; y += 8) {
      const offset = Math.sin((t + y) / wavelength) * amplitude;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(offset, y, canvas.width, 1);
    }
    ctx.restore();
  }
}

function drawGround(lvl) {
  ctx.fillStyle = lvl.theme.ground;
  const groundHeight = canvas.height - lvl.floorY;
  ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
}

function drawSpikes(lvl) {
  ctx.save();
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#d64b6a';
  lvl.spikes.forEach(s => {
    const sx = s.x - cameraX;
    const baseY = lvl.floorY;
    if (sx + s.w < 0 || sx > canvas.width) return;
    // draw triangle spike
    ctx.beginPath();
    ctx.moveTo(sx, baseY);
    ctx.lineTo(sx + s.w / 2, baseY - s.h);
    ctx.lineTo(sx + s.w, baseY);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}

function drawPlayer(lvl, t) {
  const px = player.x - cameraX;
  const py = player.y;

  // glow/chroma
  if (lvl.theme.fx.glow) {
    ctx.save();
    ctx.shadowColor = lvl.theme.accent;
    ctx.shadowBlur = 20;
  }

  // body (blue block with face)
  ctx.fillStyle = '#3aa7ff';
  ctx.fillRect(px, py, player.w, player.h);
  // face
  ctx.fillStyle = '#0a2540';
  // eyes
  ctx.fillRect(px + 10, py + 12, 8, 8);
  ctx.fillRect(px + player.w - 18, py + 12, 8, 8);
  // mouth
  ctx.fillRect(px + 14, py + 28, 16, 5);

  if (lvl.theme.fx.glow) ctx.restore();

  // chroma edge
  if (lvl.theme.fx.chroma) {
    ctx.strokeStyle = lvl.theme.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(px - 1, py - 1, player.w + 2, player.h + 2);
  }

  // jump particles
  if (!player.onGround && Math.random() < 0.12) {
    spawnParticles(player.x + player.w / 2, player.y + player.h, 1, '#7ef5ff');
  }
}

function drawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.2;
    p.life -= 0.02;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    const px = p.x - cameraX;
    ctx.fillRect(px, p.y, 3, 3);
    ctx.globalAlpha = 1;
  }
}

function physics(lvl) {
  // horizontal auto-run
  player.x += player.vx;

  // vertical
  player.vy += lvl.gravity;
  player.y += player.vy;

  // ground collision
  if (player.y + player.h >= lvl.floorY) {
    player.y = lvl.floorY - player.h;
    player.vy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }

  // queued jump
  if (jumpQueued && player.onGround) {
    player.vy = lvl.jumpVel;
    player.onGround = false;
    jumpQueued = false;
    // small burst
    spawnParticles(player.x + player.w / 2, player.y + player.h, 8, '#4db1ff');
  } else {
    jumpQueued = false;
  }

  // camera follows, keeps player centered
  const targetCam = player.x - canvas.width / 2;
  cameraX = lerp(cameraX, targetCam, 0.15);

  // map bounds: keep character above map
  player.y = Math.min(player.y, lvl.floorY - player.h);

  // spike collisions
  const pr = playerRect();
  for (const s of lvl.spikes) {
    const spikeRect = { x: s.x, y: lvl.floorY - s.h, w: s.w, h: s.h };
    if (intersects(pr, spikeRect)) {
      dieAndRestart();
      break;
    }
  }

  // level end
  if (player.x > lvl.length) {
    completeLevel();
  }
}

function draw(lvl, t) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(lvl, t);
  drawGround(lvl);
  drawSpikes(lvl);
  drawPlayer(lvl, t);
  drawParticles();
}

function loop(now) {
  if (!running) return;
  if (paused) { requestAnimationFrame(loop); return; }
  const dt = (now - lastTime) / 1000;
  lastTime = now;

  const lvl = LEVELS[currentLevelIndex];
  physics(lvl);
  draw(lvl, now);

  requestAnimationFrame(loop);
}

// Initialize
updateHomeUI();
