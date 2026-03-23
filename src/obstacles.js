import { loadImage } from './utils.js';

export class Obstacles {
  constructor() {
    this.pool = [];
    this.sprites = new Map();
    this.spawnTimer = 0;
    this.spawnInterval = 1.8;
    this.currentTheme = 'strawberry';
  }

  async load() {
    const themes = ['strawberry', 'castle', 'candy', 'snow'];
    const paths = themes.flatMap((theme) => [1, 2, 3].map((i) => `assets/obstacles/${theme}/obstacle_${i}.png`));
    const images = await Promise.all(paths.map(loadImage));
    paths.forEach((path, i) => this.sprites.set(path, images[i]));
  }

  setTheme(theme) {
    this.currentTheme = theme;
  }

  update(deltaTime, speed) {
    this.spawnTimer += deltaTime;
    this.spawnInterval = Math.max(0.8, 1.8 - speed / 2000);
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      const theme = this.currentTheme;
      const type = Math.floor(Math.random() * 3) + 1;
      this.pool.push({ x: 1380, y: 580, width: 60, height: 80, theme, type });
    }

    this.pool.forEach((obstacle) => { obstacle.x -= speed * deltaTime; });
    this.pool = this.pool.filter((o) => o.x + o.width > -100);
  }

  collides(playerHitbox) {
    return this.pool.some((o) => playerHitbox.x < o.x + o.width && playerHitbox.x + playerHitbox.width > o.x && playerHitbox.y < o.y + o.height && playerHitbox.y + playerHitbox.height > o.y);
  }
}
