// 절차적 사운드 (Web Audio API) — 외부 음원 파일 없음
const AudioFX = {
  ctx: null, master: null, nb: null,
  init() {
    if (this.ctx) { this.ctx.resume && this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    this.ctx = new C();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.9;
    this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate * 2, b = this.ctx.createBuffer(1, len, this.ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.nb = b;
    this.ambience();
  },
  setVolume(v) { if (this.master) this.master.gain.value = v; },
  out(pan) {
    if (pan == null || !this.ctx.createStereoPanner) return this.master;
    const p = this.ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); p.connect(this.master); return p;
  },
  env(g, t0, a, peak, dur) {
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t0 + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  },
  noise({ dur = 0.3, type = 'lowpass', freq = 1000, q = 1, gain = 0.3, pan, attack = 0.005, delay = 0, sweep }) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay, s = this.ctx.createBufferSource(), f = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
    s.buffer = this.nb; s.loop = true; f.type = type; f.frequency.setValueAtTime(freq, t0); f.Q.value = q;
    if (sweep) f.frequency.exponentialRampToValueAtTime(sweep, t0 + dur);
    this.env(g, t0, attack, gain, dur);
    s.connect(f); f.connect(g); g.connect(this.out(pan));
    s.start(t0, Math.random()); s.stop(t0 + dur + 0.05);
  },
  tone({ f = 440, f2, dur = 0.4, type = 'sine', gain = 0.2, pan, attack = 0.01, delay = 0 }) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    this.env(g, t0, attack, gain, dur);
    o.connect(g); g.connect(this.out(pan)); o.start(t0); o.stop(t0 + dur + 0.05);
  },
  ambience() {
    const c = this.ctx, lp = c.createBiquadFilter(), g = c.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 160; g.gain.value = 0.05;
    [55, 55.6, 82.4].forEach(fr => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(lp); o.start(); });
    lp.connect(g); g.connect(this.master);
    const w = c.createBufferSource(), bp = c.createBiquadFilter(), wg = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    w.buffer = this.nb; w.loop = true; bp.type = 'bandpass'; bp.frequency.value = 380; bp.Q.value = 0.6; wg.gain.value = 0.035;
    lfo.frequency.value = 0.08; lg.gain.value = 0.03; lfo.connect(lg); lg.connect(wg.gain);
    w.connect(bp); bp.connect(wg); wg.connect(this.master); w.start(); lfo.start();
    this.drone = g;
  },
  tension(v) { if (this.drone) this.drone.gain.setTargetAtTime(0.05 + v * 0.08, this.ctx.currentTime, 0.5); },
  footstep(run, pan) { this.noise({ dur: run ? 0.09 : 0.12, type: 'lowpass', freq: run ? 900 : 600, gain: run ? 0.14 : 0.09, pan }); },
  sting(v = 1) {
    [233, 247, 349, 370].forEach((f, i) => this.tone({ f, f2: f * 0.97, dur: 1.6, type: i % 2 ? 'sawtooth' : 'square', gain: 0.05 * v, attack: 0.005 }));
    this.noise({ dur: 0.8, type: 'highpass', freq: 3000, gain: 0.12 * v });
  },
  scream() {
    for (let i = 0; i < 4; i++) this.tone({ f: 600 + i * 170, f2: 1500 + i * 230, dur: 1.1, type: 'sawtooth', gain: 0.07, attack: 0.01 });
    this.noise({ dur: 1.1, type: 'bandpass', freq: 2200, q: 2, gain: 0.5, sweep: 900 });
    this.tone({ f: 60, f2: 30, dur: 0.8, type: 'square', gain: 0.3 });
  },
  slam(pan, v = 1) {
    this.noise({ dur: 0.6, type: 'lowpass', freq: 400, gain: 0.7 * v, pan });
    this.tone({ f: 70, f2: 35, dur: 0.5, type: 'sine', gain: 0.5 * v, pan });
    this.noise({ dur: 0.2, type: 'highpass', freq: 2500, gain: 0.15 * v, pan, delay: 0.01 });
  },
  musicBox(pan, slow = 1) {
    const mel = [76, 79, 83, 81, 79, 76, 74, 76, 71, 72, 74, 76];
    mel.forEach((m, i) => {
      const f = 440 * Math.pow(2, (m - 69) / 12) * (1 - i * 0.004);
      this.tone({ f, dur: 1.2, type: 'sine', gain: 0.07, pan, delay: i * 0.38 * slow, attack: 0.002 });
      this.tone({ f: f * 2.01, dur: 0.5, type: 'sine', gain: 0.02, pan, delay: i * 0.38 * slow, attack: 0.002 });
    });
  },
  heartbeat(n = 6, rate = 0.85) {
    for (let i = 0; i < n; i++) {
      this.tone({ f: 55, f2: 40, dur: 0.18, gain: 0.5, delay: i * rate });
      this.tone({ f: 50, f2: 38, dur: 0.15, gain: 0.35, delay: i * rate + 0.22 });
    }
  },
  laugh(pan) {
    for (let i = 0; i < 6; i++) this.tone({ f: 520 - i * 15, f2: 380, dur: 0.16, type: 'triangle', gain: 0.08, pan, delay: i * 0.19 });
  },
  whisper(pan) { for (let i = 0; i < 5; i++) this.noise({ dur: 0.35, type: 'bandpass', freq: 2500 + Math.random() * 2000, q: 4, gain: 0.12, pan, delay: i * 0.3, attack: 0.1 }); },
  ring(pan) {
    for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) this.tone({ f: i % 2 ? 1250 : 1000, dur: 0.05, type: 'square', gain: 0.04, pan, delay: r * 2 + i * 0.06 });
  },
  staticBurst(dur = 1) { this.noise({ dur, type: 'highpass', freq: 800, gain: 0.25 }); },
  chime() { this.tone({ f: 659, dur: 1.2, gain: 0.12 }); this.tone({ f: 523, dur: 1.5, gain: 0.12, delay: 0.5 }); },
  creak(pan) { this.tone({ f: 180 + Math.random() * 80, f2: 120, dur: 1.2, type: 'sawtooth', gain: 0.025, pan, attack: 0.3 }); },
  powerUp() {
    this.tone({ f: 40, f2: 220, dur: 2.5, type: 'sawtooth', gain: 0.12, attack: 0.3 });
    this.noise({ dur: 0.3, type: 'lowpass', freq: 300, gain: 0.5, delay: 0 });
    this.tone({ f: 880, dur: 0.15, type: 'square', gain: 0.05, delay: 2.4 });
  },
  powerDown() {
    this.tone({ f: 220, f2: 30, dur: 2.5, type: 'sawtooth', gain: 0.12 });
    this.noise({ dur: 0.4, type: 'lowpass', freq: 300, gain: 0.5 });
  },
  pickup() { this.tone({ f: 660, f2: 990, dur: 0.25, type: 'triangle', gain: 0.12 }); },
  correct() { this.tone({ f: 523, dur: 0.2, type: 'triangle', gain: 0.12 }); this.tone({ f: 784, dur: 0.4, type: 'triangle', gain: 0.12, delay: 0.15 }); },
  wrong() { this.tone({ f: 120, f2: 80, dur: 0.6, type: 'sawtooth', gain: 0.2 }); },
  click() { this.tone({ f: 1800, dur: 0.03, type: 'square', gain: 0.04 }); },
  speak(text, weird) {
    if (!('speechSynthesis' in window)) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ko-KR'; u.rate = weird ? 0.7 : 0.92; u.pitch = weird ? 0.1 : 0.8; u.volume = 0.8;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) { }
  }
};
