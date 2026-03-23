import { loadImage } from './utils.js';

export class World {
  constructor() {
    this.themes = ['strawberry', 'castle', 'candy', 'snow'];
    this.currentThemeIndex = 0;
    this.backgroundLayers = new Map();
    this.parallax = [0, 0, 0];
    this.distance = 0;
  }

  async load() {
    const layers = [];
    for (const theme of this.themes) {
      for (let i = 1; i <= 3; i += 1) layers.push(`assets/backgrounds/${theme}/layer_${i}.png`);
    }
    const loaded = await Promise.all(layers.map((p) => loadImage(p)));
    layers.forEach((path, index) => this.backgroundLayers.set(path, loaded[index]));
  }

  update(deltaTime, speed) {
    this.distance += speed * deltaTime;
    this.parallax = this.parallax.map((offset, i) => offset + speed * (0.2 + i * 0.15) * deltaTime);
    this.currentThemeIndex = Math.floor(this.distance / 3000) % this.themes.length;
  }

  getTheme() {
    return this.themes[this.currentThemeIndex];
  }
}
