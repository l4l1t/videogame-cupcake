import { DeltaTimeManager } from './utils.js';
import { PerformanceManager } from './performance.js';
import { Game } from './game.js';
import { Renderer } from './renderer.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false;

const deltaManager = new DeltaTimeManager();
const performanceManager = new PerformanceManager(deltaManager);
const game = new Game(performanceManager);
const renderer = new Renderer(canvas);

await game.loadAllAssets();
if (game.audioLoadReport?.skippedPreload) {
  console.info('Audio preload skipped: no audio files found yet.');
}
await performanceManager.benchmark();
game.start();
game.controls.onTap = () => {
  if (game.state === 'gameover') game.restart();
  if (game.state === 'start') game.start();
};

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
