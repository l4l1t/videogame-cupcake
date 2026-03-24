import { DeltaTimeManager } from './utils.js';
import { PerformanceManager } from './performance.js';
import { Game } from './game.js';
import { Renderer } from './renderer.js';

const canvas = document.getElementById('game-canvas');
document.body.style.overflow = 'hidden';
document.body.style.touchAction = 'none';
canvas.style.touchAction = 'none';

window.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
window.addEventListener('contextmenu', (e) => e.preventDefault());

const ctx = canvas.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false;

const deltaManager = new DeltaTimeManager();
const performanceManager = new PerformanceManager(deltaManager);
const game = new Game(performanceManager);
const renderer = new Renderer(canvas, ctx);

game.controls.onTap = () => {
  if (game.state === 'start') game.start();
  else if (game.state === 'gameover') game.restart();
};
game.controls.onPause = () => {
  if (game.state === 'running') game.pause();
  else if (game.state === 'paused') game.resume();
};

const showLoading = (text) => {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ff6b9d';
  ctx.font = 'bold 40px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SWEET RUN', canvas.width / 2, canvas.height / 2 - 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  ctx.textAlign = 'left';
};

showLoading('Loading...');
await game.loadAllAssets();
showLoading('Ready!');
await new Promise(r => setTimeout(r, 500));
if (game.audioLoadReport?.skippedPreload) {
  console.info('Audio preload skipped: no audio files found yet.');
}
await performanceManager.benchmark();
game.start();

document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.state === 'running') {
    game.pause();
    game.audio.stopLoop('assets/sounds/movement/footsteps_loop.mp3');
    if (game.audio.ambientSource) {
      try { game.audio.ambientSource.stop(); } catch {}
      game.audio.ambientSource = null;
    }
  }
});

document.addEventListener('pointerdown', () => {
  if (game.audio.ctx && game.audio.ctx.state === 'suspended') {
    game.audio.ctx.resume();
  }
}, { once: true });

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
