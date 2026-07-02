<script>
  import { synthEngine, params } from "./SynthEngine.js";
  import { OSC_PRESETS, FM_PRESETS } from "./presets.js";
  import Dropdown from "./Dropdown.svelte";

  function u(key, val) { synthEngine.updateParam(key, val); }

  let modeOpts = $derived([
    { value: "osc", label: "OSC" },
    { value: "fm", label: "FM" },
  ]);
  let waveOpts = $derived(["sine","triangle","sawtooth","square"].map(o => ({ value: o, label: o })));

  let oscPresetOpts = $derived(OSC_PRESETS.map((p, i) => ({ value: String(i), label: p.name })));
  let fmPresetOpts = $derived(FM_PRESETS.map((p, i) => ({ value: String(i), label: p.name })));

  function applyOscPreset(idx) {
    const p = OSC_PRESETS[parseInt(idx)];
    if (!p) return;
    u("oscType", p.oscType);
    u("attack", p.attack);
    u("decay", p.decay);
    u("sustain", p.sustain);
    u("release", p.release);
  }

  function applyFmPreset(idx) {
    const p = FM_PRESETS[parseInt(idx)];
    if (!p) return;
    u("fmCarrierRatio", p.fmCarrierRatio);
    u("fmModulatorRatio", p.fmModulatorRatio);
    u("fmModIndex", p.fmModIndex);
    u("fmModEnv", p.fmModEnv);
    u("attack", p.attack);
    u("decay", p.decay);
    u("sustain", p.sustain);
    u("release", p.release);
  }
</script>

<div class="synth">
  <div class="section">
    <div class="section-label">// VOICE MODE</div>
    <Dropdown options={modeOpts} value={$params.voiceMode} onChange={(v) => u('voiceMode', v)} />
  </div>

  <div class="separator"></div>

  {#if $params.voiceMode === "osc"}
    <div class="section">
      <div class="section-label">// OSC PRESET</div>
      <Dropdown options={oscPresetOpts} value="" onChange={(v) => applyOscPreset(v)} />
    </div>
    <div class="separator"></div>
    <div class="section">
      <div class="section-label">// OSCILLATOR</div>
      <div class="param">
        <span class="param-key">WAVE</span>
        <Dropdown options={waveOpts} value={$params.oscType} onChange={(v) => u('oscType', v)} />
      </div>
    </div>
  {:else}
    <div class="section">
      <div class="section-label">// FM PRESET</div>
      <Dropdown options={fmPresetOpts} value="" onChange={(v) => applyFmPreset(v)} />
    </div>
    <div class="separator"></div>
    <div class="section">
      <div class="section-label">// FM OPERATORS</div>
      <div class="param">
        <span class="param-key">C.R</span>
        <input type="range" min="0.25" max="4" step="0.25" value={$params.fmCarrierRatio}
          oninput={(e) => u('fmCarrierRatio', +e.target.value)} />
        <span class="param-val">{$params.fmCarrierRatio.toFixed(2)}</span>
      </div>
      <div class="param">
        <span class="param-key">M.R</span>
        <input type="range" min="0.25" max="16" step="0.25" value={$params.fmModulatorRatio}
          oninput={(e) => u('fmModulatorRatio', +e.target.value)} />
        <span class="param-val">{$params.fmModulatorRatio.toFixed(2)}</span>
      </div>
      <div class="param">
        <span class="param-key">IDX</span>
        <input type="range" min="0" max="20" step="0.5" value={$params.fmModIndex}
          oninput={(e) => u('fmModIndex', +e.target.value)} />
        <span class="param-val">{$params.fmModIndex.toFixed(1)}</span>
      </div>
      <div class="param">
        <span class="param-key">DEP</span>
        <input type="range" min="0" max="1" step="0.05" value={$params.fmModEnv}
          oninput={(e) => u('fmModEnv', +e.target.value)} />
        <span class="param-val">{$params.fmModEnv.toFixed(2)}</span>
      </div>
      <div class="fm-hint">C.R=carrier ratio  M.R=modulator ratio  IDX=mod index  DEP=envelope depth</div>
    </div>
  {/if}

  <div class="separator"></div>

  <div class="section">
    <div class="section-label">// ENVELOPE</div>
    <div class="param">
      <span class="param-key">ATK</span>
      <input type="range" min="0.001" max="0.5" step="0.001" value={$params.attack}
        oninput={(e) => u('attack', +e.target.value)} />
      <span class="param-val">{$params.attack.toFixed(3)}</span>
    </div>
    <div class="param">
      <span class="param-key">DCY</span>
      <input type="range" min="0.01" max="1" step="0.01" value={$params.decay}
        oninput={(e) => u('decay', +e.target.value)} />
      <span class="param-val">{$params.decay.toFixed(2)}</span>
    </div>
    <div class="param">
      <span class="param-key">SUS</span>
      <input type="range" min="0" max="1" step="0.01" value={$params.sustain}
        oninput={(e) => u('sustain', +e.target.value)} />
      <span class="param-val">{$params.sustain.toFixed(2)}</span>
    </div>
    <div class="param">
      <span class="param-key">REL</span>
      <input type="range" min="0.01" max="2" step="0.01" value={$params.release}
        oninput={(e) => u('release', +e.target.value)} />
      <span class="param-val">{$params.release.toFixed(2)}</span>
    </div>
  </div>

  <div class="separator"></div>

  <div class="section">
    <div class="section-label">// MASTER</div>
    <div class="param">
      <span class="param-key">VOL</span>
      <input type="range" min="0" max="1" step="0.05" value={$params.volume}
        oninput={(e) => u('volume', +e.target.value)} />
      <span class="param-val">{$params.volume.toFixed(2)}</span>
    </div>
  </div>
</div>

<style>
  .synth { display:flex; flex-direction:column; padding:10px; }
  .section { display:flex; flex-direction:column; gap:6px; }
  .section-label { font-size:9px; font-weight:bold; color:#555; letter-spacing:1px; margin-bottom:2px; }
  .separator { height:1px; background:#1a1a1a; margin:10px 0; }
  .param { display:flex; align-items:center; gap:6px; }
  .param-key { font-family:"Menlo","Consolas",monospace; font-size:9px; font-weight:bold; color:#666; min-width:28px; letter-spacing:1px; }
  .param input[type="range"] { -webkit-appearance:none; flex:1; height:4px; background:#1a1a1a; outline:none; cursor:pointer; }
  .param input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; width:10px; height:10px; background:#333; border:2px solid #0c4; cursor:pointer; }
  .param-val { font-family:"Menlo","Consolas",monospace; font-size:9px; color:#888; min-width:32px; text-align:right; }
  .fm-hint { font-family:"Menlo","Consolas",monospace; font-size:7px; color:#333; margin-top:2px; line-height:1.3; }
</style>
