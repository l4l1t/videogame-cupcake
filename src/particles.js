import { loadImage } from './utils.js';

export class Particles {
  constructor() {
    this.pool = [];
    this.textures = [];
  }

  async load() {
    const paths = [
      'assets/effects/sparkle.png', 'assets/effects/dust.png', 'assets/effects/hearts.png',
      'assets/effects/ring.png', 'assets/effects/confetti.png', 'assets/effects/speed_lines.png',
      'assets/effects/shimmer.png', 'assets/effects/stars.png', 'assets/effects/glow.png',
      'assets/effects/trail.png',
    ];
    this.textures = await Promise.all(paths.map(loadImage));
  }

  spawn(type, x, y) {
    const count = type === 'death' ? 14 : type === 'coin' ? 5 : 7;
    const color = type === 'coin' ? '#ffd700' : type === 'death' ? '#ff4444' : '#cc88ff';
    const size = type === 'death' ? 10 : 6;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const spd = 80 + Math.random() * 140;
      this.pool.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 80,
        lifetime: 0.4 + Math.random() * 0.3,
        maxLifetime: 0.7,
        type,
        size,
        color,
      });
    }
  }

  update(deltaTime) {
    this.pool.forEach((p) => {
      p.lifetime -= deltaTime;
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      p.vy += 200 * deltaTime; // gravity on particles
    });
    this.pool = this.pool.filter((p) => p.lifetime > 0);
  }
}
