import { Player } from './player.js';
import { Controls } from './controls.js';
import { World } from './world.js';
import { Obstacles } from './obstacles.js';
import { Collectibles } from './collectibles.js';
import { Powerups } from './powerups.js';
import { Tutorial } from './tutorial.js';
import { AudioSystem } from './audio.js';
import { Particles } from './particles.js';
import { UI } from './ui.js';
import { ScoringSystem } from './scoring.js';
import { Camera } from './camera.js';

export class Game {
  constructor(performanceManager) {
    this.performanceManager = performanceManager;
    this.state = 'start';
    this.speed = 320;
    this.audioLoadReport = null;
    this.lastTheme = null;

    this.player = new Player();
    this.controls = new Controls();
    this.world = new World();
    this.audio = new AudioSystem();
    this.obstacles = new Obstacles();
    this.collectibles = new Collectibles(this.audio);
    this.powerups = new Powerups();
    this.tutorial = new Tutorial();
    this.particles = new Particles();
    this.ui = new UI();
    this.scoring = new ScoringSystem();
    this.camera = new Camera();
  }

  async loadAllAssets() {
    const loaders = [
      this.player.load(),
      this.world.load(),
      this.obstacles.load(),
      this.collectibles.load(),
      this.tutorial.load(),
      this.particles.load(),
      this.ui.load()
    ];

    await Promise.all(loaders);
    this.audioLoadReport = await this.audio.loadAll();
  }

  start() { this.state = 'running'; }
  pause() { this.state = 'paused'; }
  resume() { this.state = 'running'; }
  gameOver() { this.state = 'gameover'; }

  restart() {
    this.state = 'running';
    this.speed = 320;
    this.player.position = { x: 200, y: 360 };
    this.player.velocity = { x: 0, y: 0 };
    this.obstacles.pool = [];
    this.collectibles.items = [];
    this.scoring.score = 0;
    this.scoring.combo = 1;
    this.scoring.comboTimer = 0;
    this.scoring.distance = 0;
  }

  update(deltaTime) {
    if (this.state !== 'running') return;
    this.player.update(deltaTime, this.controls.state);
    this.world.update(deltaTime, this.speed);
    const theme = this.world.getTheme();
    if (theme !== this.lastTheme) {
      this.audio.playAmbient(theme);
      this.lastTheme = theme;
    }
    this.obstacles.setTheme(this.world.getTheme());
    this.obstacles.update(deltaTime, this.speed);
    this.collectibles.update(deltaTime, this.speed, this.scoring.combo);
    this.powerups.update(deltaTime);
    this.tutorial.update(deltaTime, this.performanceManager.tier);
    this.particles.update(deltaTime);
    this.scoring.update(deltaTime, this.speed);
    this.camera.update(this.player, deltaTime);

    if (this.obstacles.collides(this.player.getHitbox()) && this.powerups.invincibility <= 0) {
      this.gameOver();
    }
  }
}
