// OTOMATRIX Scales — exact reproduction of original Otomata by Batuhan Bozkurt
// Each scale is an array of 9 semitone offsets into a chromatic frequency table starting from C3
// Cell index (x or y, 0-8) maps directly to scale[cidx]

// Chromatic frequency table starting from C3 = 130.813 Hz (MIDI 48)
const BASE = 130.81278265; // C3
const FREQ_TABLE = [];
for (let i = 0; i < 88; i++) {
  FREQ_TABLE.push(BASE * Math.pow(2, i / 12));
}

export const SCALES = [
  { name:"Chromatic",             offsets:[0,1,2,3,4,5,6,7,8] },
  { name:"Spanish 8 Tone",        offsets:[0,1,3,4,5,6,8,10,12] },
  { name:"Flamenco",              offsets:[0,1,3,4,5,6,8,10,12] },
  { name:"Symmetrical",           offsets:[0,1,3,4,6,7,9,10,12] },
  { name:"Diminished",            offsets:[0,2,3,5,6,8,9,11,12] },
  { name:"Whole Tone",            offsets:[0,2,4,6,8,10,12,14,16] },
  { name:"Augmented",             offsets:[0,3,4,7,8,11,12,15,16] },
  { name:"3 semitone",            offsets:[0,3,6,9,12,15,18,21,24] },
  { name:"4 semitone",            offsets:[0,4,8,12,16,20,24,28,32] },
  { name:"Ultra Locrian",         offsets:[0,1,3,4,6,8,9,12,13] },
  { name:"Super Locrian",         offsets:[0,1,3,4,6,8,10,12,13] },
  { name:"Indian-ish",            offsets:[0,1,3,4,7,8,10,12,13] },
  { name:"Locrian",               offsets:[0,1,3,5,6,8,10,12,13] },
  { name:"Phrygian",              offsets:[0,1,3,5,7,8,10,12,13] },
  { name:"Neapolitan Minor",      offsets:[0,1,3,5,7,8,11,12,13] },
  { name:"Javanese",              offsets:[0,1,3,5,7,9,10,12,13] },
  { name:"Neapolitan Major",      offsets:[0,1,3,5,7,9,11,12,13] },
  { name:"Todi (Indian)",         offsets:[0,1,3,6,7,8,11,12,13] },
  { name:"Persian",               offsets:[0,1,4,5,6,8,11,12,13] },
  { name:"Oriental",              offsets:[0,1,4,5,6,9,10,12,13] },
  { name:"Major Phrygian",        offsets:[0,1,4,5,7,8,10,12,13] },
  { name:"Double Harmonic",       offsets:[0,1,4,5,7,8,11,12,13] },
  { name:"Marva",                 offsets:[0,1,4,6,7,9,11,12,13] },
  { name:"Enigmatic",             offsets:[0,1,4,6,8,10,11,12,13] },
  { name:"Locrian Natural 2nd",   offsets:[0,2,3,5,6,8,10,12,14] },
  { name:"Minor (natural)",       offsets:[0,2,3,5,7,8,10,12,14] },
  { name:"Harmonic Minor",        offsets:[0,2,3,5,7,8,11,12,14] },
  { name:"Dorian",                offsets:[0,2,3,5,7,9,10,12,14] },
  { name:"Melodic Minor",         offsets:[0,2,3,5,7,9,11,12,14] },
  { name:"Hungarian Gypsy",       offsets:[0,2,3,6,7,9,10,12,14] },
  { name:"Hungarian Minor",       offsets:[0,2,3,6,7,9,11,12,14] },
  { name:"Romanian",              offsets:[0,2,3,6,7,9,10,12,14] },
  { name:"Major Locrian",         offsets:[0,2,4,5,6,8,10,12,14] },
  { name:"Hindu",                 offsets:[0,2,4,5,7,8,10,12,14] },
  { name:"Ethiopian 1",           offsets:[0,2,4,5,7,8,11,12,14] },
  { name:"Mixolydian",            offsets:[0,2,4,5,7,9,10,12,14] },
  { name:"Major",                 offsets:[0,2,4,5,7,9,11,12,14] },
  { name:"Mixolydian Augmented",  offsets:[0,2,4,5,8,9,10,12,14] },
  { name:"Harmonic Major",        offsets:[0,2,4,5,8,9,11,12,14] },
  { name:"Lydian Minor",          offsets:[0,2,4,6,7,8,10,12,14] },
  { name:"Lydian Dominant",       offsets:[0,2,4,6,7,9,10,12,14] },
  { name:"Lydian",                offsets:[0,2,4,6,7,9,11,12,14] },
  { name:"Lydian Augmented",      offsets:[0,2,4,6,8,9,10,12,14] },
  { name:"Leading Whole Tone",    offsets:[0,2,4,6,8,10,11,12,14] },
  { name:"Bluesy R&R",            offsets:[0,3,4,5,7,9,10,12,15] },
  { name:"Hungarian Major",       offsets:[0,3,4,6,7,9,10,12,15] },
  { name:"pB",                    offsets:[0,1,3,6,8,12,13,15,18] },
  { name:"Balinese",              offsets:[0,1,3,7,8,12,13,15,19] },
  { name:"Pelog (Balinese)",      offsets:[0,1,3,7,10,12,13,15,19] },
  { name:"Iwato (Japanese)",      offsets:[0,1,5,6,10,12,13,17,18] },
  { name:"Japanese",              offsets:[0,1,5,7,8,12,13,17,19] },
  { name:"Hirajoshi (Japanese)",  offsets:[0,2,3,7,8,12,14,15,19] },
  { name:"pD",                    offsets:[0,2,3,7,9,12,14,15,19] },
  { name:"Pentatonic Major",      offsets:[0,2,4,7,9,12,14,16,19] },
  { name:"Egyptian",              offsets:[0,2,5,7,10,12,14,17,19] },
  { name:"Pentatonic Minor",      offsets:[0,3,5,7,10,12,15,17,19] },
  { name:"Chinese",               offsets:[0,4,6,7,11,12,16,18,20] },
];

// Default scale index = 28 (Melodic Minor), matches original Otomata
export const DEFAULT_SCALE_INDEX = 28;

// Default octave shift (original uses octave index 1 = +12 semitones)
const OCTAVE_SHIFT = 12;

/**
 * Get frequency for a cell index (0-8) using a given scale.
 * Cell index directly maps to the scale's offset array.
 */
export function cellToFreq(scaleIndex, cellIdx) {
  const scale = SCALES[scaleIndex] || SCALES[0];
  const offset = scale.offsets[cellIdx] || 0;
  const idx = offset + OCTAVE_SHIFT;
  return idx < FREQ_TABLE.length ? FREQ_TABLE[idx] : FREQ_TABLE[FREQ_TABLE.length - 1];
}

/**
 * Legacy: get note name from scale + cell index (for display)
 */
export function cellToNote(scaleIndex, cellIdx) {
  const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
  const scale = SCALES[scaleIndex] || SCALES[0];
  const offset = scale.offsets[cellIdx] || 0;
  const midi = 48 + offset + OCTAVE_SHIFT;
  const nn = NOTE_NAMES[midi % 12];
  const oct = Math.floor(midi / 12) - 1;
  return `${nn}${oct}`;
}
