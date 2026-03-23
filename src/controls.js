export class Controls {
  constructor() {
    this.state = { jumpPressed: false, slide: false, dash: false, charge: false };
    this.lastTapTime = 0;
    this.touchStart = null;
    this.onTap = null;
    this.setupKeyboard();
    this.setupTouch();
    this.setupGamepad();
  }

  vibrate(ms = 10) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') { this.state.jumpPressed = true; this.vibrate(15); this.onTap?.(); }
      if (e.code === 'ArrowDown') this.state.slide = true;
      if (e.code === 'ShiftLeft') this.state.dash = true;
    });
    window.addEventListener('keyup', () => {
      this.state.jumpPressed = false;
      this.state.slide = false;
      this.state.dash = false;
    });
  }

  setupTouch() {
    window.addEventListener('touchstart', (e) => {
      const now = performance.now();
      const isDoubleTap = now - this.lastTapTime < 280;
      if (isDoubleTap) {
        this.state.jumpPressed = true;
      } else {
        this.onTap?.();
      }
      this.lastTapTime = now;
      this.touchStart = e.touches[0];
      this.state.charge = true;
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.touchStart) return;
      const touch = e.touches[0];
      const dx = touch.clientX - this.touchStart.clientX;
      const dy = touch.clientY - this.touchStart.clientY;
      if (dy > 60) this.state.slide = true;
      if (dx > 60) this.state.dash = true;
    });

    window.addEventListener('touchend', () => {
      this.state.charge = false;
      this.touchStart = null;
    });
  }

  setupGamepad() {
    window.addEventListener('gamepadconnected', () => this.vibrate(20));
  }
}
