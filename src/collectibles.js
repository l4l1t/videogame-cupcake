import { loadImage } from './utils.js';

export class Collectibles {
  constructor(audio) {
    this.audio = audio;
    this.coinSheet = null;
    this.powerupImages = new Map();
    this.items = [];
    this.animAccumulator = 0;
    this.frame = 0;
    this.frameDuration = 0.08;
    this.spawnTimer = 0;
    this.powerupSpawnTimer = 0;
  }

  async load() {
    this.coinSheet = await loadImage('assets/collectibles/coin_spin.png');
    const paths = [
      'assets/collectibles/power_invincible.png',
      'assets/collectibles/power_speed.png',
      'assets/collectibles/power_magnet.png',
    ];
    const loaded = await Promise.all(paths.map(loadImage));
    paths.forEach((path, i) => this.powerupImages.set(path, loaded[i]));
  }

  update(deltaTime, speed, combo, magnetActive = false, playerX = 0, playerY = 0) {
    // Move items
    this.items.forEach((item) => { item.x -= speed * deltaTime; });
    this.items = this.items.filter((item) => item.x + (item.width ?? 32) > -100);

    // Coin magnet pull
    if (magnetActive) {
      this.items.forEach((item) => {
        if (item.type !== 'coin') return;
        const dx = playerX - item.x;
        const dy = playerY - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 300 && dist > 0) {
          item.x += (dx / dist) * 400 * deltaTime;
          item.y += (dy / dist) * 400 * deltaTime;
        }
      });
    }

    // Coin animation
    this.animAccumulator += deltaTime;
    if (this.animAccumulator >= this.frameDuration) {
      this.frame = (this.frame + 1) % 8;
      this.animAccumulator -= this.frameDuration;
    }

    // Coin spawn patterns
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= 1.2) {
      this.spawnTimer = 0;
      const patterns = [
        () => {
          for (let i = 0; i < 5; i++)
            this.items.push({ x: 1380 + i * 50, y: 460, width: 32, height: 32, type: 'coin' });
        },
        () => {
          for (let i = 0; i < 4; i++)
            this.items.push({ x: 1380 + i * 50, y: 460 - i * 30, width: 32, height: 32, type: 'coin' });
        },
        () => {
          for (let i = 0; i < 5; i++)
            this.items.push({ x: 1380 + i * 50, y: 460 - Math.sin((i / 4) * Math.PI) * 100, width: 32, height: 32, type: 'coin' });
        },
        () => {
          for (let i = 0; i < 3; i++)
            this.items.push({ x: 1380 + i * 80, y: 320, width: 32, height: 32, type: 'coin' });
        },
      ];
      patterns[Math.floor(Math.random() * patterns.length)]();
    }

    // Powerup spawn
    this.powerupSpawnTimer += deltaTime;
    if (this.powerupSpawnTimer >= 15) {
      this.powerupSpawnTimer = 0;
      const types = ['invincibility', 'speed', 'magnet'];
      const type = types[Math.floor(Math.random() * types.length)];
      this.items.push({ x: 1380, y: 440, width: 48, height: 48, type });
    }

    if (combo > 1) this.audio.playCoinCombo(combo);
  }
}
