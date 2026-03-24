import { DeltaTimeManager } from './utils.js';
import { PerformanceManager } from './performance.js';
import { Game } from './game.js';
import { Renderer } from './renderer.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false;

// Mobile scroll lock
document.body.style.overflow = 'hidden';
document.body.style.touchAction = 'none';
canvas.style.touchAction = 'none';
window.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
window.addEventListener('contextmenu', (e) => e.preventDefault());

const deltaManager = new DeltaTimeManager();
const performanceManager = new PerformanceManager(deltaManager);
const game = new Game(performanceManager);
const renderer = new Renderer(canvas);

// Loading screen helper
const showLoading = (text) => {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ff6b9d';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SWEET RUN', canvas.width / 2, canvas.height / 2 - 70);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  ctx.textAlign = 'left';
};

showLoading('Loading...');
await game.loadAllAssets();

if (game.audioLoadReport?.skippedPreload) {
  console.info('[Sweet Run] Audio skipped — no audio files found yet.');
}

await performanceManager.benchmark();
showLoading('Ready!');
await new Promise((r) => setTimeout(r, 500));

// Don't auto-start — show start screen
game.state = 'start';

// Browser autoplay policy fix — resume AudioContext on first pointer
document.addEventListener('pointerdown', () => {
  if (game.audio.ctx && game.audio.ctx.state === 'suspended') {
    game.audio.ctx.resume();
  }
}, { once: true });

// Pause when browser tab is hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.state === 'running') {
    game.pause();
  }
});

// Controls wiring
game.controls.onTap = () => {
  if (game.state === 'start') game.start();
  else if (game.state === 'gameover') game.restart();
};

game.controls.onPause = () => {
  if (game.state === 'running') game.pause();
  else if (game.state === 'paused') game.resume();
};

// Main loop
function loop(timestamp) {
  const delta = deltaManager.update(timestamp);

  deltaManager.runFixedPhysics((fixedStep) => {
    game.update(fixedStep);
  });

  performanceManager.update(delta);
  renderer.draw(game);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
