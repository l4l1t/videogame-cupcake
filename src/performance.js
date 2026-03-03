export class PerformanceManager {
  constructor(deltaManager) {
    this.deltaManager = deltaManager;
    this.tier = 'MEDIUM';
    this.targetFPS = 60;
    this.liveFpsWindow = [];
    this.lowFpsDuration = 0;
    this.highFpsDuration = 0;
  }

  async benchmark() {
    const memoryGB = navigator.deviceMemory ?? 4;
    const logicalCpu = navigator.hardwareConcurrency ?? 4;
    const refreshDetected = this.deltaManager.detectedFPS;

    if (memoryGB < 2 || logicalCpu <= 2 || refreshDetected <= 30) {
      this.tier = 'LOW';
      this.targetFPS = 30;
    } else if (memoryGB < 4) {
      this.tier = 'MEDIUM';
      this.targetFPS = 60;
    } else {
      this.tier = 'HIGH';
      this.targetFPS = refreshDetected >= 100 ? 120 : 60;
    }

    return { tier: this.tier, targetFPS: this.targetFPS, memoryGB, logicalCpu };
  }

  update(frameDelta) {
    const fps = 1 / Math.max(frameDelta, 0.0001);
    this.liveFpsWindow.push(fps);
    if (this.liveFpsWindow.length > 300) this.liveFpsWindow.shift();

    const avg = this.liveFpsWindow.reduce((a, b) => a + b, 0) / this.liveFpsWindow.length;

    if (avg < 25) {
      this.lowFpsDuration += frameDelta;
      if (this.lowFpsDuration >= 5) {
        this.stepDownQuality();
        this.lowFpsDuration = 0;
      }
    } else {
      this.lowFpsDuration = 0;
    }

    if (avg > 55) {
      this.highFpsDuration += frameDelta;
    } else {
      this.highFpsDuration = 0;
    }

    return { fps, avg, suggestUpgrade: this.highFpsDuration >= 10 };
  }

  stepDownQuality() {
    if (this.tier === 'HIGH') this.tier = 'MEDIUM';
    else if (this.tier === 'MEDIUM') this.tier = 'LOW';
  }
}
