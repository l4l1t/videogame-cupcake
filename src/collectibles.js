import { loadImage } from './utils.js';

export class Collectibles {
  constructor(audio) {
    this.audio = audio;
    this.coinSheet = null;
    this.powerups = new Map();
    this.items = [];
    this.animAccumulator = 0;
    this.frame = 0;
    this.frameDuration = 0.08;
    this.spawnTimer = 0;
    this.spawnInterval = 1.2;
  }

  async load() {
    this.coinSheet = await loadImage('assets/collectibles/coin_spin.png');
    const paths = ['assets/collectibles/power_invincible.png', 'assets/collectibles/power_speed.png', 'assets/collectibles/power_magnet.png'];
    const loaded = await Promise.all(paths.map(loadImage));
    paths.forEach((path, i) => this.powerups.set(path, loaded[i]));
  }

  update(deltaTime, speed, combo) {
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.items.push({ x: 1380, y: 520, width: 32, height: 32, type: 'coin' });
    }

    this.items.forEach((item) => { item.x -= speed * deltaTime; });
    this.items = this.items.filter((item) => item.x + item.width > -100);
    this.animAccumulator += deltaTime;
    if (this.animAccumulator >= this.frameDuration) {
      this.frame = (this.frame + 1) % 8;
      this.animAccumulator -= this.frameDuration;
    }
    if (combo > 1) this.audio.playCoinCombo(combo);
  }
}
