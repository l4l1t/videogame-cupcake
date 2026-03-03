import { loadImage } from './utils.js';

export class Player {
  constructor() {
    this.spriteSheet = null;
    this.frameWidth = 128;
    this.frameHeight = 128;
    this.animationRows = 18;
    this.position = { x: 200, y: 360 };
    this.velocity = { x: 0, y: 0 };
    this.gravity = 2200;
    this.jumpForce = -900;
    this.width = 128;
    this.height = 128;
    this.hitbox = { offsetX: 40, offsetY: 10, width: 48, height: 110 };
    this.state = 'idle';
    this.currentFrame = 0;
    this.animAccumulator = 0;
    this.frameDuration = 1 / 6;
  }

  async load() {
    this.spriteSheet = await loadImage('assets/sprites/character_sheet.png');
  }

  update(deltaTime, input) {
    if (input.jumpPressed) this.velocity.y = this.jumpForce;
    this.velocity.y += this.gravity * deltaTime;
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    this.animAccumulator += deltaTime;
    if (this.animAccumulator >= this.frameDuration) {
      this.currentFrame = (this.currentFrame + 1) % this.animationRows;
      this.animAccumulator -= this.frameDuration;
    }
  }

  getHitbox() {
    return {
      x: this.position.x + this.hitbox.offsetX,
      y: this.position.y + this.hitbox.offsetY,
      width: this.hitbox.width,
      height: this.hitbox.height
    };
  }
}
