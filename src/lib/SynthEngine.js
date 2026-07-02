// OTOMATRIX Synth Engine - Simple effects chain with bypass
import { writable, get } from "svelte/store";

const defaults = {
  driveOn:false, driveGain:2,
  delayOn:true, delayTime:0.5, delayFB:0.35, delayMix:0.3,
  reverbOn:true, reverbSize:0.7, reverbMix:0.25,
  filterOn:false, filterFreq:2000, filterRes:1,
  modOn:false, modRate:4, modDepth:0,
  oscType:"sine",
  voiceMode:"osc",
  fmCarrierRatio:1, fmModulatorRatio:2, fmModIndex:8, fmModEnv:0.5,
  attack:0.001, decay:0.25, sustain:0.05, release:0.4,
  volume:0.45,
};

export const params = writable({ ...defaults });

export class SynthEngine {
  constructor() {
    this.ctx = null; this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    const C = this.ctx = new AudioContext();

    // Master
    this.master = C.createGain(); this.master.gain.value = 0.45;
    this.master.connect(C.destination);

    // Dry/wet mixer for time FX
    this.dry = C.createGain(); this.dry.gain.value = 0.7;
    this.dry.connect(this.master);
    this.wet = C.createGain(); this.wet.gain.value = 0.3;
    this.wet.connect(this.master);

    // --- DRIVE: pre-gain + waveshaper ---
    this.drivePre = C.createGain(); this.drivePre.gain.value = 3;
    this.driveWS = C.createWaveShaper(); this.driveWS.curve = this._drive(3);
    this.driveDry = C.createGain(); this.driveDry.gain.value = 1; // bypass on by default
    this.driveOut = C.createGain(); this.driveOut.gain.value = 0;
    this.drivePre.connect(this.driveWS);
    this.driveWS.connect(this.driveOut);
    this.drivePre.connect(this.driveDry);
    // Merge point after drive
    this.postDrive = C.createGain(); this.postDrive.gain.value = 1;
    this.driveOut.connect(this.postDrive);
    this.driveDry.connect(this.postDrive);

    // --- DELAY ---
    this.dly = C.createDelay(1.5); this.dly.delayTime.value = 0.5;
    this.dlyFB = C.createGain(); this.dlyFB.gain.value = 0.35;
    this.dly.connect(this.dlyFB); this.dlyFB.connect(this.dly);
    this.dlyWet = C.createGain(); this.dlyWet.gain.value = 0.3;
    this.dlyWetEn = C.createGain(); this.dlyWetEn.gain.value = 1;
    this.dly.connect(this.dlyWet); this.dlyWet.connect(this.dlyWetEn); this.dlyWetEn.connect(this.wet);
    this.dlyDry = C.createGain(); this.dlyDry.gain.value = 0; // delay on
    this.postDrive.connect(this.dly);
    this.postDrive.connect(this.dlyDry);
    this.postDly = C.createGain(); this.postDly.gain.value = 1;
    this.dly.connect(this.postDly);
    this.dlyDry.connect(this.postDly);

    // --- REVERB ---
    this.rvb = C.createConvolver(); this.rvb.buffer = this._reverb(1.7);
    this.rvbWet = C.createGain(); this.rvbWet.gain.value = 0.25;
    this.rvbWetEn = C.createGain(); this.rvbWetEn.gain.value = 1;
    this.rvb.connect(this.rvbWet); this.rvbWet.connect(this.rvbWetEn); this.rvbWetEn.connect(this.wet);
    this.rvbDry = C.createGain(); this.rvbDry.gain.value = 0; // reverb on
    this.postDly.connect(this.rvb);
    this.postDly.connect(this.rvbDry);
    this.postRvb = C.createGain(); this.postRvb.gain.value = 1;
    this.rvb.connect(this.postRvb);
    this.rvbDry.connect(this.postRvb);

    // --- FILTER ---
    this.flt = C.createBiquadFilter();
    this.flt.type = "lowpass"; this.flt.frequency.value = 2000; this.flt.Q.value = 1;
    this.fltDry = C.createGain(); this.fltDry.gain.value = 1; // bypass on by default
    this.fltOut = C.createGain(); this.fltOut.gain.value = 0;
    this.postRvb.connect(this.flt);
    this.flt.connect(this.fltOut);
    this.postRvb.connect(this.fltDry);
    this.postFlt = C.createGain(); this.postFlt.gain.value = 1;
    this.fltOut.connect(this.postFlt);
    this.fltDry.connect(this.postFlt);

    // To dry output
    this.postFlt.connect(this.dry);

    // --- LFO ---
    this.lfo = C.createOscillator(); this.lfo.type = "sine"; this.lfo.frequency.value = 4;
    this.lfoGain = C.createGain(); this.lfoGain.gain.value = 0;
    this.lfo.connect(this.lfoGain);
    this.lfo.start();

    this.initialized = true;
    // Apply initial on/off states
    this._initState();
  }

  _initState() {
    const p = get(params);
    // DRIVE: default OFF → dry=1, out=0
    this.driveDry.gain.value = p.driveOn ? 0 : 1;
    this.driveOut.gain.value = p.driveOn ? 1 : 0;
    // DELAY: default ON → dry=0, wetEn=1
    this.dlyDry.gain.value = p.delayOn ? 0 : 1;
    this.dlyWetEn.gain.value = p.delayOn ? 1 : 0;
    // REVERB: default ON → dry=0, wetEn=1
    this.rvbDry.gain.value = p.reverbOn ? 0 : 1;
    this.rvbWetEn.gain.value = p.reverbOn ? 1 : 0;
    // FILTER: default OFF → dry=1, out=0
    this.fltDry.gain.value = p.filterOn ? 0 : 1;
    this.fltOut.gain.value = p.filterOn ? 1 : 0;
  }

  _drive(g) {
    const n = 256, c = new Float32Array(n);
    const gm = Math.max(1, g);
    for (let i = 0; i < n; i++) c[i] = Math.tanh(((i*2)/n-1) * gm) / Math.tanh(gm);
    return c;
  }
  _reverb(d) {
    const sr = this.ctx.sampleRate, len = sr * d;
    const b = this.ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const a = b.getChannelData(ch);
      for (let i = 0; i < len; i++) a[i] = (Math.random()*2-1) * Math.pow(1-i/len, 1.5);
    }
    return b;
  }

  playFreq(freq) {
    if (!this.initialized) return;
    const p = get(params);
    const now = this.ctx.currentTime;
    const end = now + 0.2;

    if (p.voiceMode === "fm") return this._playFM(freq, p, now, end);

    const osc = this.ctx.createOscillator();
    osc.type = p.oscType;
    osc.frequency.value = freq;
    osc.detune.value = (Math.random()-0.5)*3;
    const vca = this.ctx.createGain();
    vca.gain.setValueAtTime(0, now);
    vca.gain.linearRampToValueAtTime(0.25, now + p.attack);
    vca.gain.linearRampToValueAtTime(p.sustain*0.25, now + p.attack + p.decay);
    vca.gain.setValueAtTime(vca.gain.value, end);
    vca.gain.linearRampToValueAtTime(0.001, end + p.release);
    osc.connect(vca);
    vca.connect(this.drivePre);
    osc.start(now);
    osc.stop(end + p.release + 0.05);
  }

  _playFM(freq, p, now, end) {
    const C = this.ctx;
    // Carrier
    const car = C.createOscillator();
    car.type = "sine";
    car.frequency.value = freq * p.fmCarrierRatio;
    // Modulator
    const mod = C.createOscillator();
    mod.type = "sine";
    mod.frequency.value = freq * p.fmModulatorRatio;
    // Modulator depth
    const modGain = C.createGain();
    modGain.gain.setValueAtTime(p.fmModIndex * freq * p.fmModulatorRatio, now);
    modGain.gain.linearRampToValueAtTime(
      p.fmModIndex * freq * p.fmModulatorRatio * p.fmModEnv,
      now + p.attack + p.decay * 0.5
    );
    modGain.gain.linearRampToValueAtTime(0.001, end + p.release);
    mod.connect(modGain);
    modGain.connect(car.frequency);
    // Envelope via VCA on carrier
    const vca = C.createGain();
    vca.gain.setValueAtTime(0, now);
    vca.gain.linearRampToValueAtTime(0.2, now + p.attack);
    vca.gain.linearRampToValueAtTime(p.sustain*0.2, now + p.attack + p.decay);
    vca.gain.setValueAtTime(vca.gain.value, end);
    vca.gain.linearRampToValueAtTime(0.001, end + p.release);
    car.connect(vca);
    vca.connect(this.drivePre);
    car.start(now); mod.start(now);
    car.stop(end + p.release + 0.1);
    mod.stop(end + p.release + 0.1);
  }

  async updateParam(key, value) {
    if (!this.initialized) await this.init();
    params.update(p => ({ ...p, [key]: value }));
    const p = get(params);
    const now = this.ctx.currentTime;
    const R = (n, param, v) => { if (n) n[param].linearRampToValueAtTime(v, now+0.02); };

    switch (key) {
      case "driveOn":
        R(this.driveDry, "gain", value ? 0 : 1);
        R(this.driveOut, "gain", value ? 1 : 0);
        break;
      case "driveGain": R(this.drivePre, "gain", value); this.driveWS.curve = this._drive(value); break;
      case "delayOn":
        R(this.dlyDry, "gain", value ? 0 : 1);
        R(this.dlyWetEn, "gain", value ? 1 : 0);
        break;
      case "delayTime": R(this.dly, "delayTime", value); break;
      case "delayFB": R(this.dlyFB, "gain", value); break;
      case "delayMix": R(this.dlyWet, "gain", value); break;
      case "reverbOn":
        R(this.rvbDry, "gain", value ? 0 : 1);
        R(this.rvbWetEn, "gain", value ? 1 : 0);
        break;
      case "reverbSize": this.rvb.buffer = this._reverb(value*2+0.3); break;
      case "reverbMix": R(this.rvbWet, "gain", value); break;
      case "filterOn":
        R(this.fltDry, "gain", value ? 0 : 1);
        R(this.fltOut, "gain", value ? 1 : 0);
        break;
      case "filterFreq": R(this.flt, "frequency", value); break;
      case "filterRes": R(this.flt, "Q", value); break;
      case "modOn":
        if (value) this.lfoGain.connect(this.flt.frequency);
        else { try { this.lfoGain.disconnect(); } catch(e){} }
        break;
      case "modRate": R(this.lfo, "frequency", value); break;
      case "modDepth": R(this.lfoGain, "gain", value*500); break;
      case "volume": R(this.master, "gain", value); break;
    }
  }

  dispose() {
    if (this.lfo) try { this.lfo.stop(); } catch(e){}
    if (this.ctx) this.ctx.close();
    this.initialized = false;
  }
}

export const synthEngine = new SynthEngine();
