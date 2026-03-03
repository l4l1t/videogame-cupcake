import { loadAudio } from './utils.js';

export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.enabled = false;
    this.buffers = new Map();
    this.comboPlaybackRate = 1;
    this.missingFiles = [];
    this.skippedPreload = false;
  }

  ensureContext() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.musicGain = this.ctx.createGain();
    this.sfxGain = this.ctx.createGain();
    this.musicGain.connect(this.ctx.destination);
    this.sfxGain.connect(this.ctx.destination);
    this.enabled = true;
  }

  getManifest() {
    return [
      'assets/sounds/movement/jump.mp3', 'assets/sounds/movement/dash.mp3', 'assets/sounds/movement/slide.mp3', 'assets/sounds/movement/land.mp3',
      'assets/sounds/collectibles/coin.mp3', 'assets/sounds/collectibles/coin_combo.mp3', 'assets/sounds/collectibles/pickup.mp3', 'assets/sounds/collectibles/chime.mp3',
      'assets/sounds/powerups/invincible.mp3', 'assets/sounds/powerups/magnet.mp3', 'assets/sounds/powerups/speed.mp3', 'assets/sounds/powerups/expire.mp3',
      'assets/sounds/damage/hit.mp3', 'assets/sounds/damage/fall.mp3', 'assets/sounds/damage/fail.mp3', 'assets/sounds/damage/warn.mp3',
      'assets/sounds/tutorial/prompt1.mp3', 'assets/sounds/tutorial/prompt2.mp3', 'assets/sounds/tutorial/prompt3.mp3', 'assets/sounds/tutorial/prompt4.mp3',
      'assets/sounds/celebration/win.mp3', 'assets/sounds/celebration/streak.mp3', 'assets/sounds/celebration/unlock.mp3', 'assets/sounds/celebration/applause.mp3',
      'assets/sounds/ui/click.mp3', 'assets/sounds/ui/pause.mp3', 'assets/sounds/ui/resume.mp3', 'assets/sounds/ui/gameover.mp3',
      'assets/sounds/ambient/grassland.mp3', 'assets/sounds/ambient/city.mp3', 'assets/sounds/ambient/neon.mp3', 'assets/sounds/ambient/lava.mp3',
      'assets/sounds/ambient/wind.mp3', 'assets/sounds/ambient/riser.mp3'
    ];
  }

  async hasAnyAudioAsset() {
    const probe = this.getManifest()[0];
    try {
      const response = await fetch(probe, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  async loadAll() {
    const files = this.getManifest();
    this.missingFiles = [];

    if (!(await this.hasAnyAudioAsset())) {
      this.skippedPreload = true;
      return { loaded: 0, missing: files.length, missingFiles: [...files], skippedPreload: true };
    }

    this.ensureContext();

    await Promise.all(
      files.map(async (path) => {
        try {
          const arrayBuffer = await loadAudio(path);
          const buffer = await this.ctx.decodeAudioData(arrayBuffer);
          this.buffers.set(path, buffer);
        } catch {
          this.missingFiles.push(path);
        }
      })
    );

    return {
      loaded: this.buffers.size,
      missing: this.missingFiles.length,
      missingFiles: [...this.missingFiles],
      skippedPreload: false
    };
  }

  play(path, { music = false, playbackRate = 1, pan = 0 } = {}) {
    const buffer = this.buffers.get(path);
    if (!buffer) return;

    this.ensureContext();

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;

    const panner = this.ctx.createStereoPanner();
    panner.pan.value = pan;

    source.connect(panner);
    panner.connect(music ? this.musicGain : this.sfxGain);
    source.start();
  }

  playCoinCombo(combo) {
    this.comboPlaybackRate = Math.min(2, 1 + combo * 0.05);
    this.play('assets/sounds/collectibles/coin_combo.mp3', { playbackRate: this.comboPlaybackRate });
  }
}
