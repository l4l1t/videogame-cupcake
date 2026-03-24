import { loadImage } from './utils.js';

export class Obstacles {
  constructor() {
    this.pool = [];
    this.sprites = new Map();
    this.currentTheme = 'strawberry';
    this.spawnTimer = 0;
  }

  async load() {
    const themes = ['strawberry', 'castle', 'candy', 'snow'];
    const paths = themes.flatMap((theme) => [1, 2, 3].map((i) => `assets/obstacles/${theme}/obstacle_${i}.png`));
    const images = await Promise.all(paths.map(loadImage));
    paths.forEach((path, i) => this.sprites.set(path, images[i]));
  }

  update(deltaTime, speed, theme = this.currentTheme) {
    this.currentTheme = theme;
    this.pool.forEach((obstacle) => { obstacle.x -= speed * deltaTime; });
    this.pool = this.pool.filter((o) => o.x + o.width > -100);
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= 1.8) {
      this.spawnTimer = 0;
      const variants = [
        { width: 60, height: 168 },
        { width: 120, height: 80 },
        { width: 40, height: 220 },
      ];
      const variant = variants[Math.floor(Math.random() * variants.length)];
      const y = 628 - variant.height;
      this.pool.push({
        x: 1380, y,
        width: variant.width,
        height: variant.height,
        theme: this.currentTheme,
        type: Math.ceil(Math.random() * 3)
      });
    }
  }

  collides(playerHitbox) {
    return this.pool.some((o) => playerHitbox.x < o.x + o.width && playerHitbox.x + playerHitbox.width > o.x && playerHitbox.y < o.y + o.height && playerHitbox.y + playerHitbox.height > o.y);
  }
}
