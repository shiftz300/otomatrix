// Node type definitions for the modular synth
// Each type defines: label, color, I/O port counts, and params

export const NODE_TYPES = {
  osc: {
    label: "INPUT",
    color: "#44ff88",
    inputs: 0,
    outputs: 1,
    params: [],
  },
  drive: {
    label: "DRIVE",
    color: "#ff6644",
    inputs: 1,
    outputs: 1,
    params: [
      { k: "driveGain", l: "GAIN", min: 1, max: 20 },
    ],
  },
  delay: {
    label: "DELAY",
    color: "#44aaff",
    inputs: 1,
    outputs: 1,
    params: [
      { k: "delayTime", l: "TIME", min: 0.05, max: 1 },
      { k: "delayFB", l: "FB", min: 0, max: 0.9 },
      { k: "delayMix", l: "MIX", min: 0, max: 0.8 },
    ],
  },
  reverb: {
    label: "VERB",
    color: "#aa66ff",
    inputs: 1,
    outputs: 1,
    params: [
      { k: "reverbSize", l: "SIZE", min: 0.1, max: 1 },
      { k: "reverbMix", l: "MIX", min: 0, max: 0.6 },
    ],
  },
  filter: {
    label: "FILTER",
    color: "#ffaa22",
    inputs: 1,
    outputs: 1,
    params: [
      { k: "filterFreq", l: "FREQ", min: 200, max: 8000, step: 50 },
      { k: "filterRes", l: "RES", min: 0.5, max: 15 },
    ],
  },
  lfo: {
    label: "LFO",
    color: "#22ddaa",
    inputs: 0,
    outputs: 1,
    params: [
      { k: "modRate", l: "RATE", min: 0.5, max: 15 },
      { k: "modDepth", l: "DEP", min: 0, max: 1 },
    ],
  },
  out: {
    label: "OUT",
    color: "#00cc44",
    inputs: 1,
    outputs: 0,
    params: [
      { k: "volume", l: "VOL", min: 0, max: 1 },
    ],
  },
};
