import { loadImage } from './utils.js';

export class Obstacles {
  constructor() {
    this.pool = [];
    this.sprites = new Map();
  }

  async load() {
    const themes = ['grassland', 'city', 'neon', 'lava'];
    const paths = themes.flatMap((theme) => [1, 2, 3].map((i) => `assets/obstacles/${theme}/obstacle_${i}.png`));
    const images = await Promise.all(paths.map(loadImage));
    paths.forEach((path, i) => this.sprites.set(path, images[i]));
  }

  update(deltaTime, speed) {
    this.pool.forEach((obstacle) => { obstacle.x -= speed * deltaTime; });
    this.pool = this.pool.filter((o) => o.x + o.width > -100);
  }

  collides(playerHitbox) {
    return this.pool.some((o) => playerHitbox.x < o.x + o.width && playerHitbox.x + playerHitbox.width > o.x && playerHitbox.y < o.y + o.height && playerHitbox.y + playerHitbox.height > o.y);
  }
}
