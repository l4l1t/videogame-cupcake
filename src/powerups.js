export class Powerups {
  constructor() {
    this.invincibility = 0;
    this.speedBoost = 0;
    this.coinMagnet = 0;
  }

  update(deltaTime) {
    this.invincibility = Math.max(0, this.invincibility - deltaTime);
    this.speedBoost = Math.max(0, this.speedBoost - deltaTime);
    this.coinMagnet = Math.max(0, this.coinMagnet - deltaTime);
  }
}
