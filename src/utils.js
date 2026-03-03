export class DeltaTimeManager {
  constructor() {
    this.lastTimestamp = 0;
    this.deltaTime = 1 / 60;
    this.maxDelta = 0.05;
    this.physicsAccumulator = 0;
    this.fixedStep = 1 / 60;
    this.fpsSamples = [];
    this.detectedFPS = 60;
  }

  update(currentTimestamp) {
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = currentTimestamp;
      return this.deltaTime;
    }

    this.deltaTime = Math.min((currentTimestamp - this.lastTimestamp) / 1000, this.maxDelta);
    this.lastTimestamp = currentTimestamp;
    this.physicsAccumulator += this.deltaTime;

    if (this.fpsSamples.length < 60) {
      this.fpsSamples.push(1 / Math.max(this.deltaTime, 0.0001));
      if (this.fpsSamples.length === 60) {
        const avg = this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length;
        this.detectedFPS = avg < 45 ? 30 : avg <= 75 ? 60 : 120;
      }
    }

    return this.deltaTime;
  }

  runFixedPhysics(updatePhysics) {
    while (this.physicsAccumulator >= this.fixedStep) {
      updatePhysics(this.fixedStep);
      this.physicsAccumulator -= this.fixedStep;
    }
  }

  getDelta() {
    return this.deltaTime;
  }
}

export const lerp = (start, end, factor) => start + (end - start) * factor;

export function loadImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = path;
    image.onload = () => resolve(image);
    image.onerror = reject;
  });
}

export async function loadAudio(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load audio: ${path}`);
  return response.arrayBuffer();
}
