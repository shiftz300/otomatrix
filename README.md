# OTOMATRIX

Generative cellular automaton synthesizer — a modern reimagining of Batuhan Bozkurt's Otomata with modular FX patching.

## Overview

OTOMATRIX combines a 2D cellular automaton sequencer with an open-ended modular effects patch editor and a dual-mode (OSC / FM) voice engine.

- **SEQUENCER**: 9x9 grid of directional cells that move, collide, and bounce off walls, triggering notes on impact
- **SYNTH**: Configure the voice engine — choose between classic oscillator waveforms or 2-operator FM synthesis with 16 presets
- **PATCH**: Drag-and-drop modular effects routing (DRIVE, DELAY, REVERB, FILTER, LFO, OUT) with real-time parameter control

## Quick Start

```bash
bun install
bun run dev     # http://localhost:5173
```

Build for production:

```bash
bun run build   # output in dist/
```

## Architecture

```
src/
└── lib/
    ├── Sequencer.js         # Cellular automaton engine (tick/move/collide)
    ├── SynthEngine.js       # Web Audio API synthesis + FX chain
    ├── scales.js            # 47 scales (original Otomata set)
    ├── stores.js            # Svelte writable stores
    ├── presets.js           # OSC + FM voice presets
    ├── fx/
    │   ├── types.js         # Node type registry
    │   ├── index.js         # Dynamic FX component loader
    │   ├── NodeFrame.svelte # Shared node shell (drag/ports/head)
    │   ├── FxSlider.svelte  # Shared param slider
    │   ├── InputFx.svelte   # Audio input node
    │   ├── DriveFx.svelte   # Distortion
    │   ├── DelayFx.svelte   # Delay with feedback
    │   ├── ReverbFx.svelte  # Convolution reverb
    │   ├── FilterFx.svelte  # Biquad filter
    │   ├── LfoFx.svelte     # Low-frequency oscillator
    │   └── OutFx.svelte     # Master output
    ├── App.svelte           # Main layout (tabs + panels)
    ├── Controls.svelte      # Transport / BPM / scale / URL
    ├── Grid2D.svelte        # 9x9 cell grid
    ├── PatchEditor.svelte   # Modular FX canvas
    ├── FxPanel.svelte       # Per-type FX strip in sequencer
    ├── SynthTab.svelte      # Voice engine configuration
    └── Dropdown.svelte      # Generic dropdown component
```

## Tech Stack

- **Svelte 5** (runes mode) + **Vite 6**
- **Web Audio API** — no external audio libraries
- **bun** runtime

## Reference

Based on the original [Otomata](https://web.archive.org/web/20140608112555/http://www.earslap.com/page/otomata.html) by Batuhan Bozkurt, with faithful reproduction of the cellular automaton algorithm, 47 scales, and pitch-to-frequency mapping.

## License

MIT
