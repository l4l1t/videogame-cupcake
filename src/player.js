import { loadImage } from './utils.js';

export const GROUND_Y = 500;

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
    this.width = 80;
    this.height = 100;
    this.hitbox = { offsetX: 10, offsetY: 5, width: 60, height: 90 };
    this.state = 'idle';
    this.currentFrame = 0;
    this.animAccumulator = 0;
    this.frameDuration = 1 / 6;
    this.onGround = false;
    this.jumpCount = 0;
    this.justJumped = false;
    this.justDoubleJumped = false;
    this.justLanded = false;
    this.justSlid = false;
  }

  async load() {
    this.spriteSheet = await loadImage('assets/sprites/character_sheet.png');
  }

  update(deltaTime, input) {
    const wasOnGround = this.onGround;

    // Reset one-frame flags
    this.justJumped = false;
    this.justDoubleJumped = false;
    this.justLanded = false;
    this.justSlid = false;

    // Jump
    if (input.jumpPressed && this.jumpCount < 2) {
      this.velocity.y = this.jumpForce;
      this.jumpCount++;
      this.justJumped = true;
      if (this.jumpCount === 2) this.justDoubleJumped = true;
    }

    // Gravity
    this.velocity.y += this.gravity * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Ground clamp
    this.onGround = false;
    if (this.position.y >= GROUND_Y) {
      this.position.y = GROUND_Y;
      this.velocity.y = 0;
      this.onGround = true;
      this.jumpCount = 0;
    }

    // Land detection
    if (!wasOnGround && this.onGround) this.justLanded = true;

    // Slide
    if (input.slide && this.onGround) {
      if (this.state !== 'sliding') {
        this.state = 'sliding';
        this.height = 50;
        this.hitbox.height = 45;
        this.justSlid = true;
      }
    } else if (this.state === 'sliding' && !input.slide) {
      this.state = 'running';
      this.height = 100;
      this.hitbox.height = 90;
    }

    // State
    if (this.state !== 'sliding') {
      this.state = this.onGround ? 'running' : 'jumping';
    }

    // Animation
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
      height: this.hitbox.height,
    };
  }
}
