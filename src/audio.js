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
    this.ambientSource = null;
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
      'assets/sounds/movement/jump.mp3',
      'assets/sounds/movement/dash.mp3',
      'assets/sounds/movement/slide.mp3',
      'assets/sounds/movement/double_jump.mp3',
      'assets/sounds/movement/footsteps_loop.mp3',
      'assets/sounds/movement/high_jump_charge.mp3',
      'assets/sounds/movement/high_jump_release.mp3',
      'assets/sounds/movement/land_hard.mp3',
      'assets/sounds/movement/land_soft.mp3',
      'assets/sounds/collectibles/coin.mp3',
      'assets/sounds/collectibles/coin_combo.mp3',
      'assets/sounds/collectibles/coin_first.mp3',
      'assets/sounds/powerups/coin_magnet.mp3',
      'assets/sounds/powerups/invincibility.mp3',
      'assets/sounds/powerups/invincibility_loop.mp3',
      'assets/sounds/powerups/speed_boost.mp3',
      'assets/sounds/damage/death.mp3',
      'assets/sounds/damage/hurt.mp3',
      'assets/sounds/tutorial/mechanic_mastered.mp3',
      'assets/sounds/tutorial/prompt_appear.mp3',
      'assets/sounds/celebration/fist_pump.mp3',
      'assets/sounds/celebration/flex.mp3',
      'assets/sounds/celebration/happy_dance.mp3',
      'assets/sounds/celebration/jump_spin.mp3',
      'assets/sounds/celebration/vsign.mp3',
      'assets/sounds/ui/button_tap.mp3',
      'assets/sounds/ui/game_over.mp3',
      'assets/sounds/ui/high_score.mp3',
      'assets/sounds/ui/pause.mp3',
      'assets/sounds/ui/resume.mp3',
      'assets/sounds/ambient/strawberry_loop.mp3',
      'assets/sounds/ambient/castle_loop.mp3',
      'assets/sounds/ambient/candy_loop.mp3',
      'assets/sounds/ambient/snow_loop.mp3'
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
          if (!arrayBuffer) throw new Error('Missing audio buffer');
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

  playAmbient(theme) {
    if (this.ambientSource) {
      this.ambientSource.stop();
      this.ambientSource.disconnect();
      this.ambientSource = null;
    }

    const path = `assets/sounds/ambient/${theme}_loop.mp3`;
    const buffer = this.buffers.get(path);
    if (!buffer) return;

    this.ensureContext();

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.musicGain);
    source.start();
    this.ambientSource = source;
  }

  playCoinCombo(combo) {
    this.comboPlaybackRate = Math.min(2, 1 + combo * 0.05);
    this.play('assets/sounds/collectibles/coin_combo.mp3', { playbackRate: this.comboPlaybackRate });
  }
}
