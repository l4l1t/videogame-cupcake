import { DeltaTimeManager } from './utils.js';
import { PerformanceManager } from './performance.js';
import { Game } from './game.js';

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
ctx.imageSmoothingEnabled = false;

const deltaManager = new DeltaTimeManager();
const performanceManager = new PerformanceManager(deltaManager);
const game = new Game(performanceManager);

await game.loadAllAssets();
if (game.audioLoadReport?.skippedPreload) {
  console.info('Audio preload skipped: no audio files found yet.');
}
await performanceManager.benchmark();
game.start();

function loop(timestamp) {
  const delta = deltaManager.update(timestamp);

  deltaManager.runFixedPhysics((fixedStep) => {
    game.update(fixedStep);
  });

  performanceManager.update(delta);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
