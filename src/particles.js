import { loadImage } from './utils.js';

export class Particles {
  constructor() {
    this.pool = [];
    this.textures = [];
  }

  async load() {
    const paths = ['assets/effects/sparkle.png','assets/effects/dust.png','assets/effects/hearts.png','assets/effects/ring.png','assets/effects/confetti.png','assets/effects/speed_lines.png','assets/effects/shimmer.png','assets/effects/stars.png','assets/effects/glow.png','assets/effects/trail.png'];
    this.textures = await Promise.all(paths.map(loadImage));
  }

  update(deltaTime) {
    this.pool.forEach((p) => {
      p.lifetime -= deltaTime;
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
    });
    this.pool = this.pool.filter((p) => p.lifetime > 0);
  }
}
