import { loadImage } from './utils.js';

export const GROUND_Y = 540;

export class Player {
  constructor() {
    this.spriteSheet = null;
    this.frameWidth = 128;
    this.frameHeight = 128;
    this.animationRows = 18;
    this.position = { x: 200, y: GROUND_Y };
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
    this.onGround = false;
    this.wasOnGround = false;
    this.jumpCount = 0;
    this.justLanded = false;
    this.justJumped = false;
    this.justDoubleJumped = false;
    this.justSlid = false;
  }

  async load() {
    this.spriteSheet = await loadImage('assets/sprites/character_sheet.png');
  }

  update(deltaTime, input) {
    this.justSlid = false;
    const jumpCountBefore = this.jumpCount;
    if (input.jumpPressed && this.jumpCount < 2) {
      this.velocity.y = this.jumpForce;
      this.jumpCount++;
    }

    if (input.slide && this.onGround) {
      if (this.state !== 'sliding') this.justSlid = true;
      this.state = 'sliding';
      this.height = 64;
      this.hitbox.height = 54;
    } else if (this.state === 'sliding' && !input.slide) {
      this.state = 'running';
      this.height = 128;
      this.hitbox.height = 110;
    }

    this.velocity.y += this.gravity * deltaTime;
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    const wasGrounded = this.onGround;
    if (this.position.y >= GROUND_Y) {
      this.position.y = GROUND_Y;
      this.velocity.y = 0;
      this.onGround = true;
      this.jumpCount = 0;
    } else {
      this.onGround = false;
    }

    if (!wasGrounded && this.onGround) this.justLanded = true;
    else this.justLanded = false;
    if (input.jumpPressed && jumpCountBefore < 2 && this.jumpCount > jumpCountBefore) this.justJumped = true;
    else this.justJumped = false;
    if (jumpCountBefore === 1 && this.jumpCount === 2) this.justDoubleJumped = true;
    else this.justDoubleJumped = false;
    this.wasOnGround = wasGrounded;

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
