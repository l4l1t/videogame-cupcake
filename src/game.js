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
    this.lastDash = false;
    this.worldBanner = null;
    this.popups = [];

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
      this.ui.load(),
    ];
    await Promise.all(loaders);
    this.audioLoadReport = await this.audio.loadAll();
  }

  start() {
    this.state = 'running';
  }

  pause() {
    this.state = 'paused';
    this.audio.play('assets/sounds/ui/pause.mp3');
    this.audio.stopLoop('assets/sounds/movement/footsteps_loop.mp3');
  }

  resume() {
    this.state = 'running';
    this.audio.play('assets/sounds/ui/resume.mp3');
  }

  gameOver() {
    this.state = 'dying';
    this.audio.play('assets/sounds/damage/hurt.mp3');
    this.audio.stopLoop('assets/sounds/movement/footsteps_loop.mp3');
    this.particles.spawn('death', this.player.position.x + 40, this.player.position.y + 50);
    setTimeout(() => {
      if (this.state !== 'dying') return;
      this.audio.play('assets/sounds/damage/death.mp3');
      this.audio.play('assets/sounds/ui/game_over.mp3');
      this.scoring.save();
      this.state = 'gameover';
    }, 600);
  }

  restart() {
    this.state = 'running';
    this.speed = 320;
    this.player.position = { x: 200, y: 500 };
    this.player.velocity = { x: 0, y: 0 };
    this.player.jumpCount = 0;
    this.player.onGround = false;
    this.player.height = 100;
    this.player.hitbox.height = 90;
    this.obstacles.pool = [];
    this.collectibles.items = [];
    this.scoring.score = 0;
    this.scoring.combo = 1;
    this.scoring.comboTimer = 0;
    this.scoring.distance = 0;
    this.scoring.newHighScore = false;
    this.powerups.invincibility = 0;
    this.powerups.speedBoost = 0;
    this.powerups.coinMagnet = 0;
    this.lastTheme = null;
    this.lastDash = false;
    this.worldBanner = null;
    this.popups = [];
    this.particles.pool = [];
    this.camera.reset();
  }

  update(deltaTime) {
    // Always update particles and popups so death animation plays
    if (this.state === 'dying') {
      this.particles.update(deltaTime);
      this.popups.forEach((p) => { p.life -= deltaTime; });
      this.popups = this.popups.filter((p) => p.life > 0);
      return;
    }

    if (this.state !== 'running') return;

    // Gamepad
    this.controls.pollGamepad();

    // Player
    this.player.update(deltaTime, this.controls.state);

    // Audio triggers from player state
    if (this.player.justJumped) this.audio.play('assets/sounds/movement/jump.mp3');
    if (this.player.justDoubleJumped) this.audio.play('assets/sounds/movement/double_jump.mp3');
    if (this.player.justLanded) this.audio.play('assets/sounds/movement/land_soft.mp3');
    if (this.player.justSlid) this.audio.play('assets/sounds/movement/slide.mp3');

    // Dash SFX — trigger on first frame of dash
    if (this.controls.state.dash && !this.lastDash) {
      this.audio.play('assets/sounds/movement/dash.mp3');
    }
    this.lastDash = this.controls.state.dash;

    // Footstep loop
    if (this.player.onGround && this.player.state !== 'sliding') {
      this.audio.playLoop('assets/sounds/movement/footsteps_loop.mp3');
    } else {
      this.audio.stopLoop('assets/sounds/movement/footsteps_loop.mp3');
    }

    // World update + theme change detection
    this.world.update(deltaTime, this.speed);
    const theme = this.world.getTheme();
    if (theme !== this.lastTheme) {
      this.audio.playAmbient(theme);
      this.worldBanner = { text: theme.toUpperCase() + ' WORLD', life: 2.5 };
      this.lastTheme = theme;
    }

    // World banner countdown
    if (this.worldBanner) {
      this.worldBanner.life -= deltaTime;
      if (this.worldBanner.life <= 0) this.worldBanner = null;
    }

    // Obstacles
    this.obstacles.setTheme(theme);
    this.obstacles.update(deltaTime, this.speed);

    // Collectibles
    this.collectibles.update(
      deltaTime,
      this.speed,
      this.scoring.combo,
      this.powerups.coinMagnet > 0,
      this.player.position.x,
      this.player.position.y
    );

    // Coin + powerup collection detection
    const playerHB = this.player.getHitbox();
    this.collectibles.items = this.collectibles.items.filter((item) => {
      const hit =
        playerHB.x < item.x + item.width &&
        playerHB.x + playerHB.width > item.x &&
        playerHB.y < item.y + item.height &&
        playerHB.y + playerHB.height > item.y;

      if (hit) {
        if (item.type === 'coin') {
          this.scoring.collectCoin();
          this.audio.play('assets/sounds/collectibles/coin.mp3');
          this.particles.spawn('coin', item.x + 16, item.y + 16);
          this.popups.push({
            x: item.x + 16,
            y: item.y,
            text: '+' + (10 * this.scoring.combo),
            life: 0.8,
            maxLife: 0.8,
          });
        } else if (item.type === 'invincibility') {
          this.powerups.invincibility = 8;
          this.audio.play('assets/sounds/powerups/invincibility.mp3');
          this.particles.spawn('powerup', item.x + 24, item.y + 24);
        } else if (item.type === 'speed') {
          this.powerups.speedBoost = 6;
          this.audio.play('assets/sounds/powerups/speed_boost.mp3');
          this.particles.spawn('powerup', item.x + 24, item.y + 24);
        } else if (item.type === 'magnet') {
          this.powerups.coinMagnet = 10;
          this.audio.play('assets/sounds/powerups/coin_magnet.mp3');
          this.particles.spawn('powerup', item.x + 24, item.y + 24);
        }
      }
      return !hit;
    });

    // Powerups tick down
    this.powerups.update(deltaTime);

    // Speed progression — affected by speed boost powerup
    const baseSpeed = Math.min(900, 320 + this.scoring.distance / 80);
    this.speed = this.powerups.speedBoost > 0 ? baseSpeed * 1.5 : baseSpeed;

    // Tutorial
    this.tutorial.update(deltaTime, this.performanceManager.tier);

    // Particles
    this.particles.update(deltaTime);

    // Scoring
    this.scoring.update(deltaTime, this.speed);

    // High score SFX — fire once
    if (this.scoring.newHighScore) {
      this.audio.play('assets/sounds/ui/high_score.mp3');
      this.scoring.newHighScore = false;
    }

    // Popups countdown
    this.popups.forEach((p) => { p.life -= deltaTime; });
    this.popups = this.popups.filter((p) => p.life > 0);

    // Camera
    this.camera.update(this.player, deltaTime);

    // Collision check — only while running, not invincible
    if (
      this.obstacles.collides(this.player.getHitbox()) &&
      this.powerups.invincibility <= 0 &&
      this.state === 'running'
    ) {
      this.gameOver();
    }
  }
}
