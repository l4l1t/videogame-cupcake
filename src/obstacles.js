import { loadImage } from './utils.js';

export class Obstacles {
  constructor() {
    this.pool = [];
    this.sprites = new Map();
    this.spawnTimer = 0;
    this.currentTheme = 'strawberry';
  }

  async load() {
    const themes = ['strawberry', 'castle', 'candy', 'snow'];
    const paths = themes.flatMap((theme) =>
      [1, 2, 3].map((i) => `assets/obstacles/${theme}/obstacle_${i}.png`)
    );
    const images = await Promise.all(paths.map(loadImage));
    paths.forEach((path, i) => this.sprites.set(path, images[i]));
  }

  setTheme(theme) {
    this.currentTheme = theme;
  }

  update(deltaTime, speed) {
    this.pool.forEach((obstacle) => { obstacle.x -= speed * deltaTime; });
    this.pool = this.pool.filter((o) => o.x + o.width > -100);

    this.spawnTimer += deltaTime;
    const interval = Math.max(0.8, 1.8 - speed / 2000);
    if (this.spawnTimer >= interval) {
      this.spawnTimer = 0;
      const variants = [
        { width: 60, height: 128 },   // tall — must jump over
        { width: 140, height: 60 },   // wide low — jump high or slide
        { width: 45, height: 180 },   // very tall — must slide under
      ];
      const variant = variants[Math.floor(Math.random() * variants.length)];
      const groundLine = 600;
      const y = groundLine - variant.height;
      this.pool.push({
        x: 1380,
        y,
        width: variant.width,
        height: variant.height,
        theme: this.currentTheme,
        type: Math.ceil(Math.random() * 3),
      });
    }
  }

  collides(playerHitbox) {
    return this.pool.some(
      (o) =>
        playerHitbox.x < o.x + o.width &&
        playerHitbox.x + playerHitbox.width > o.x &&
        playerHitbox.y < o.y + o.height &&
        playerHitbox.y + playerHitbox.height > o.y
    );
  }
}
