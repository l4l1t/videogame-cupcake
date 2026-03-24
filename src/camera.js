import { lerp } from './utils.js';

export class Camera {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.lookAheadFactor = 0.15;
    this.smoothing = 6;
  }

  update(player, deltaTime) {
    const targetX = player.position.x + player.width * this.lookAheadFactor;
    this.x = lerp(this.x, targetX, Math.min(1, this.smoothing * deltaTime));
    this.y = lerp(this.y, player.position.y, Math.min(1, this.smoothing * deltaTime));
  }

  reset() {
    this.x = 0;
    this.y = 0;
  }
}
