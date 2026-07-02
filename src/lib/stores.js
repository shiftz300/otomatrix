import { writable, derived } from "svelte/store";

export const GRID_SIZE = 9;

export const cells = writable({});
export const cellCounter = writable(0);
export const playing = writable(false);
export const bpm = writable(120);
export const patchNodes = writable([
  { id:"osc", type:"osc", label:"INPUT", color:"#44ff88", index:1, inputs:0, outputs:1, params:[] },
  { id:"drive", type:"drive", label:"DRIVE", color:"#ff6644", index:1, inputs:1, outputs:1, params:[{k:"driveGain",l:"GAIN",min:1,max:20}] },
  { id:"delay", type:"delay", label:"DELAY", color:"#44aaff", index:1, inputs:1, outputs:1, params:[{k:"delayTime",l:"TIME",min:0.05,max:1},{k:"delayFB",l:"FB",min:0,max:0.9},{k:"delayMix",l:"MIX",min:0,max:0.8}] },
  { id:"reverb", type:"reverb", label:"VERB", color:"#aa66ff", index:1, inputs:1, outputs:1, params:[{k:"reverbSize",l:"SIZE",min:0.1,max:1},{k:"reverbMix",l:"MIX",min:0,max:0.6}] },
  { id:"filter", type:"filter", label:"FILTER", color:"#ffaa22", index:1, inputs:1, outputs:1, params:[{k:"filterFreq",l:"FREQ",min:200,max:8000,step:50},{k:"filterRes",l:"RES",min:0.5,max:15}] },
  { id:"out", type:"out", label:"OUT", color:"#00cc44", index:1, inputs:1, outputs:0, params:[{k:"volume",l:"VOL",min:0,max:1}] },
]);
import { DEFAULT_SCALE_INDEX } from "./scales.js";
export const scaleIndex = writable(DEFAULT_SCALE_INDEX);

export const synthParams = writable({
  oscType: "sawtooth",
  filterType: "lowpass",
  filterCutoff: 2000,
  filterResonance: 5,
  attack: 0.01,
  decay: 0.15,
  sustain: 0.3,
  release: 0.4,
  delayTime: 0.25,
  delayFeedback: 0.35,
  delayMix: 0.3,
  reverbDecay: 1.5,
  reverbMix: 0.25,
  lfoRate: 4,
  lfoDepth: 0,
  volume: 0.7,
});

export const flashCells = writable(new Set());
export const interval = derived(bpm, ($bpm) => 60000 / ($bpm * 2));
