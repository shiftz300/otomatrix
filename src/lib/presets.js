// Synth voice presets — quick instrument approximations

export const OSC_PRESETS = [
  { name:"Pluck", oscType:"sine", attack:0.001, decay:0.15, sustain:0.01, release:0.3 },
  { name:"Marimba", oscType:"sine", attack:0.001, decay:0.25, sustain:0.02, release:0.5 },
  { name:"Vibes", oscType:"triangle", attack:0.001, decay:0.35, sustain:0.05, release:0.6 },
  { name:"Soft Lead", oscType:"sawtooth", attack:0.02, decay:0.15, sustain:0.4, release:0.3 },
  { name:"Bright Lead", oscType:"sawtooth", attack:0.005, decay:0.1, sustain:0.5, release:0.2 },
  { name:"Square Bass", oscType:"square", attack:0.002, decay:0.1, sustain:0.3, release:0.15 },
  { name:"Soft Pad", oscType:"triangle", attack:0.15, decay:0.3, sustain:0.6, release:0.8 },
  { name:"Organ", oscType:"square", attack:0.01, decay:0.05, sustain:0.7, release:0.1 },
];

export const FM_PRESETS = [
  { name:"Bell", fmCarrierRatio:1, fmModulatorRatio:3.5, fmModIndex:10, fmModEnv:0.4, attack:0.001, decay:0.3, sustain:0.01, release:0.6 },
  { name:"Rhodes", fmCarrierRatio:1, fmModulatorRatio:1.01, fmModIndex:12, fmModEnv:0.5, attack:0.002, decay:0.4, sustain:0.1, release:0.4 },
  { name:"Steel Drum", fmCarrierRatio:1, fmModulatorRatio:4, fmModIndex:14, fmModEnv:0.3, attack:0.001, decay:0.2, sustain:0.02, release:0.5 },
  { name:"Brass", fmCarrierRatio:1, fmModulatorRatio:1, fmModIndex:8, fmModEnv:0.7, attack:0.03, decay:0.2, sustain:0.5, release:0.3 },
  { name:"Clav", fmCarrierRatio:1, fmModulatorRatio:3, fmModIndex:16, fmModEnv:0.2, attack:0.001, decay:0.1, sustain:0.01, release:0.2 },
  { name:"Wood Bass", fmCarrierRatio:1, fmModulatorRatio:0.5, fmModIndex:6, fmModEnv:0.6, attack:0.003, decay:0.15, sustain:0.2, release:0.15 },
  { name:"Harp", fmCarrierRatio:1, fmModulatorRatio:2.5, fmModIndex:5, fmModEnv:0.5, attack:0.001, decay:0.5, sustain:0.05, release:0.7 },
  { name:"FM Lead", fmCarrierRatio:1, fmModulatorRatio:2, fmModIndex:15, fmModEnv:0.8, attack:0.01, decay:0.1, sustain:0.6, release:0.3 },
];
