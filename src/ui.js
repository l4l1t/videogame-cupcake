import { loadImage } from './utils.js';

export class UI {
  constructor() {
    this.assets = new Map();
    this.loadingProgress = 0;
  }

  async load() {
    const paths = Array.from({ length: 18 }, (_, i) => `assets/ui/ui_${i + 1}.png`);
    const images = await Promise.all(paths.map(loadImage));
    paths.forEach((path, i) => this.assets.set(path, images[i]));
  }

  setProgress(value) {
    this.loadingProgress = value;
  }
}
