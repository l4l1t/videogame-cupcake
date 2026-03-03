import { loadImage } from './utils.js';

export class Tutorial {
  constructor() {
    this.stage = 0;
    this.totalStages = 5;
    this.timer = 0;
    this.assets = [];
    this.skipped = false;
  }

  async load() {
    const paths = ['assets/ui/gesture_tap.png', 'assets/ui/gesture_double_tap.png', 'assets/ui/gesture_hold.png', 'assets/ui/gesture_swipe_down.png', 'assets/ui/gesture_swipe_forward.png'];
    this.assets = await Promise.all(paths.map(loadImage));
  }

  update(deltaTime, performanceTier) {
    this.timer += deltaTime;
    const stageDuration = performanceTier === 'LOW' ? 4 : 2.5;
    if (this.timer > stageDuration && this.stage < this.totalStages) {
      this.stage += 1;
      this.timer = 0;
    }
  }
}
