// Nhạc nền chiptune 8-bit: 132 BPM, mỗi ô nhịp 8 nốt móc đơn, vòng hợp âm C - Am - F - G lặp 2 lần
const BGM_STEP_SEC = 60 / 132 / 2;
const BGM_LOOKAHEAD_SEC = 0.12;
const BGM_TICK_MS = 25;
// Nốt gốc bè trầm theo từng ô nhịp (số MIDI)
const BGM_BASS_ROOTS = [48, 45, 41, 43, 48, 45, 41, 43];
// Giai điệu rải hợp âm, null là nghỉ
const BGM_MELODY = [
  [64, 67, 72, 67, 64, 67, 72, 74],
  [64, 69, 72, 69, 64, 69, 72, 71],
  [65, 69, 72, 69, 65, 69, 72, 74],
  [67, 71, 74, 71, 74, null, 71, null],
  [72, null, 72, 74, 76, null, 74, 72],
  [69, null, 69, 71, 72, null, 71, 69],
  [65, null, 69, 72, 77, null, 76, 74],
  [74, null, 71, 67, 71, 74, null, null],
];
const BGM_STEPS = BGM_MELODY.length * 8;

const midiToFreq = (note) => 440 * 2 ** ((note - 69) / 12);

// Âm lượng nhạc nền ở mức 100% (mặc định 70% bằng khoảng 56% độ lớn tiếng hiệu ứng)
const BGM_LEVEL = 0.65;
const DEFAULT_SFX_VOLUME = 1;
const DEFAULT_BGM_VOLUME = 0.7;

const clampVolume = (value) => (Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0);
// Tai người cảm nhận âm lượng theo thang lũy thừa nên thanh trượt dùng bình phương
const toGain = (volume) => volume * volume;

// Đọc âm lượng đã lưu (0..1); bản cũ chỉ lưu bật/tắt nên quy về 0 nếu người chơi đã tắt
function readVolume(key, legacyKey, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) return clampVolume(Number(saved));
    if (localStorage.getItem(legacyKey) === 'false') return 0;
  } catch {
    // Không đọc được bộ nhớ thì dùng mặc định
  }
  return fallback;
}

function saveVolume(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // Ignore storage error
  }
}

class SoundController {
  constructor() {
    this.ctx = null;
    this.sfxBus = null;
    this.sfxVolume = readVolume('egd_sfx_volume', 'egd_sound_enabled', DEFAULT_SFX_VOLUME);
    this.bgmVolume = readVolume('egd_bgm_volume', 'egd_bgm_enabled', DEFAULT_BGM_VOLUME);
    this.bgmTimerId = null;
    this.bgmStepIndex = 0;
    this.bgmNextTime = 0;
    this.bgmMasterGain = null;
    this.noiseBuffer = null;

    // Tắt tiếng khi người chơi chuyển ứng dụng/tab, bật lại khi quay về
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        const action = document.hidden ? this.ctx.suspend() : this.ctx.resume();
        action.catch(() => {});
      });
    }
  }

  ensureAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        // Mọi hiệu ứng đi qua một nút âm lượng chung
        this.sfxBus = this.ctx.createGain();
        this.sfxBus.gain.value = toGain(this.sfxVolume);
        this.sfxBus.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // --- SOUND FX (HIỆU ỨNG ÂM THANH) ---

  isEnabled() {
    return this.sfxVolume > 0;
  }

  getSfxVolume() {
    return this.sfxVolume;
  }

  setSfxVolume(value) {
    this.sfxVolume = clampVolume(value);
    saveVolume('egd_sfx_volume', this.sfxVolume);
    if (this.sfxBus) {
      this.sfxBus.gain.setTargetAtTime(toGain(this.sfxVolume), this.ctx.currentTime, 0.02);
    }
  }

  getSfxContext() {
    if (this.sfxVolume === 0) return null;
    return this.ensureAudioContext();
  }

  // --- NHẠC NỀN (CHIPTUNE 8-BIT) ---

  isBgmEnabled() {
    return this.bgmVolume > 0;
  }

  getBgmVolume() {
    return this.bgmVolume;
  }

  setBgmVolume(value) {
    this.bgmVolume = clampVolume(value);
    saveVolume('egd_bgm_volume', this.bgmVolume);

    if (this.bgmVolume === 0) {
      this.stopBgm();
    } else if (this.bgmTimerId === null) {
      this.startBgm();
    } else if (this.bgmMasterGain) {
      this.bgmMasterGain.gain.setTargetAtTime(
        BGM_LEVEL * toGain(this.bgmVolume),
        this.ctx.currentTime,
        0.02
      );
    }
  }

  startBgm() {
    if (this.bgmVolume === 0) return;
    const ctx = this.ensureAudioContext();
    if (!ctx || this.bgmTimerId !== null) return;

    this.bgmMasterGain = ctx.createGain();
    this.bgmMasterGain.gain.setValueAtTime(BGM_LEVEL * toGain(this.bgmVolume), ctx.currentTime);
    this.bgmMasterGain.connect(ctx.destination);
    this.bgmStepIndex = 0;
    this.bgmNextTime = ctx.currentTime + 0.05;
    // Hẹn giờ theo đồng hồ âm thanh để nhịp đều, không phụ thuộc độ trễ của setInterval
    this.bgmTimerId = window.setInterval(() => this.scheduleBgm(), BGM_TICK_MS);
  }

  stopBgm() {
    if (this.bgmTimerId !== null) {
      window.clearInterval(this.bgmTimerId);
      this.bgmTimerId = null;
    }
    if (this.bgmMasterGain && this.ctx) {
      const master = this.bgmMasterGain;
      master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
      window.setTimeout(() => master.disconnect(), 400);
      this.bgmMasterGain = null;
    }
  }

  scheduleBgm() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running' || !this.bgmMasterGain) return;

    // Bị trễ nhiều (máy chậm, tab bị treo) thì bắt nhịp lại thay vì phát dồn các nốt cũ
    if (this.bgmNextTime < ctx.currentTime - 0.25) {
      this.bgmNextTime = ctx.currentTime + 0.05;
    }
    while (this.bgmNextTime < ctx.currentTime + BGM_LOOKAHEAD_SEC) {
      this.playBgmStep(this.bgmStepIndex, this.bgmNextTime);
      this.bgmStepIndex = (this.bgmStepIndex + 1) % BGM_STEPS;
      this.bgmNextTime += BGM_STEP_SEC;
    }
  }

  playBgmStep(step, time) {
    const bar = Math.floor(step / 8);
    const beat = step % 8;
    const out = this.bgmMasterGain;

    // Bè trầm nhảy quãng tám, giai điệu sóng vuông, trống ở phách 1 & 3, hi-hat ở phách lẻ
    const bass = BGM_BASS_ROOTS[bar] + (beat % 2 === 1 ? 12 : 0);
    this.playTone(out, 'triangle', midiToFreq(bass), time, BGM_STEP_SEC * 0.9, 0.2);

    const note = BGM_MELODY[bar][beat];
    if (note !== null) {
      this.playTone(out, 'square', midiToFreq(note), time, BGM_STEP_SEC * 0.6, 0.045);
    }
    if (beat === 0 || beat === 4) {
      this.playKick(out, time);
    }
    if (beat % 2 === 1) {
      this.playHat(out, time);
    }
  }

  playTone(destination, type, freq, time, duration, volume) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  playKick(destination, time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(50, time + 0.12);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(time);
    osc.stop(time + 0.15);
  }

  playHat(destination, time) {
    if (!this.noiseBuffer) {
      const length = Math.floor(this.ctx.sampleRate * 0.05);
      this.noiseBuffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    noise.buffer = this.noiseBuffer;
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);
    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    noise.start(time);
    noise.stop(time + 0.05);
  }

  // --- CÁC HIỆU ỨNG ÂM THANH (SFX) ---

  playJump() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.14);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxBus);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playCorrect() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.12, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.16);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.16);
    });
  }

  playWrong() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.28);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.sfxBus);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playMilestonePass() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.24);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.24);
    });
  }

  // Arpeggio đi lên kiểu nhặt vật phẩm 8-bit
  playPowerUp() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [392, 523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      this.playTone(this.sfxBus, 'square', freq, now + idx * 0.05, 0.09, 0.06);
    });
  }

  // Tiếng vỡ khi khiên/bất tử phá chướng ngại vật
  playShieldBreak() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(this.sfxBus);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  playClick() {
    const ctx = this.getSfxContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxBus);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const soundFX = new SoundController();
