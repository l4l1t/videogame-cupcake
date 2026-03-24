export class ScoringSystem {
  constructor() {
    this.distance = 0;
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.comboWindow = 2;
    this.highScore = Number(localStorage.getItem('sweetrun-high-score') ?? 0);
    this.newHighScore = false;
  }

  update(deltaTime, speed) {
    this.distance += speed * deltaTime;
    if (this.comboTimer > 0) this.comboTimer -= deltaTime;
    if (this.comboTimer <= 0) this.combo = 1;
  }

  collectCoin() {
    this.score += 10 * this.combo;
    this.combo = Math.min(10, this.combo + 1);
    this.comboTimer = this.comboWindow;
    this.save();
  }

  save() {
    this.newHighScore = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('sweetrun-high-score', String(this.highScore));
      this.newHighScore = true;
    }
  }
}
