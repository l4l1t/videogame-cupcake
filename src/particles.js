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

  spawn(type, x, y) {
    const count = type === 'death' ? 12 : type === 'coin' ? 4 : 6;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 80 + Math.random() * 120;
      this.pool.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        lifetime: 0.4 + Math.random() * 0.3,
        maxLifetime: 0.7,
        type,
        size: type === 'death' ? 10 : 6,
        color: type === 'coin' ? '#ffd700' : type === 'death' ? '#ff4444' : '#ffffff'
      });
    }
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
