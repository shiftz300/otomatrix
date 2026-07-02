<script>
  import { playing, bpm, scaleIndex } from "./stores.js";
  import { SCALES } from "./scales.js";
  import { startSequencer, stopSequencer, restartSequencer, clearAll, getStateURL, loadFromURL } from "./Sequencer.js";
  import { synthEngine } from "./SynthEngine.js";
  import Dropdown from "./Dropdown.svelte";

  let scaleOptions = $derived(SCALES.map((s, i) => ({ value: String(i), label: s.name })));

  let initializing = $state(false);

  async function togglePlay() {
    if (initializing) return;
    if (!synthEngine.initialized) {
      initializing = true;
      try { await synthEngine.init(); } catch(e) {}
      initializing = false;
      if (!synthEngine.initialized) return;
    }
    playing.update((v) => { const n = !v; if (n) startSequencer(); else stopSequencer(); return n; });
  }
  function handleClear() {
    if ($playing) return;
    stopSequencer(); playing.set(false); clearAll();
  }
  function handleBpmChange(e) {
    const val = Math.max(30, Math.min(300, parseInt(e.target.value) || 120));
    bpm.set(val); if ($playing) restartSequencer();
  }
  function handleScaleChange(val) { scaleIndex.set(parseInt(val)); }
  function handleGetURL() { const url = getStateURL(); navigator.clipboard.writeText(url).catch(() => {}); prompt("URL (copied):", url); }
  function handleLoadURL() { const url = prompt("Paste Otomata URL:"); if (url) loadFromURL(url); }
</script>

<div class="ctrl">
  <div class="section">
    <div class="section-label">// TRANSPORT</div>
    <div class="btn-row">
      <button class="btn {$playing ? 'btn-stop' : 'btn-play'}" class:btn-disabled={initializing} onclick={togglePlay} disabled={initializing}>
        <span class="btn-led {$playing ? 'led-on' : 'led-off'}"></span>
        {initializing ? "[ INIT... ]" : ($playing ? "[ STOP ]" : "[ PLAY ]")}
      </button>
      <button class="btn btn-clear" class:btn-disabled={$playing} onclick={handleClear} disabled={$playing}>
        <span class="btn-led led-warn"></span>
        [ CLEAR ]
      </button>
    </div>
  </div>
  <div class="separator"></div>
  <div class="section">
    <div class="section-label">// CLOCK</div>
    <div class="param"><span class="param-key">BPM</span><input type="number" class="param-val num" min="30" max="300" value={$bpm} onchange={handleBpmChange} /></div>
  </div>
  <div class="separator"></div>
  <div class="section">
    <div class="section-label">// SCALE</div>
    <Dropdown options={scaleOptions} value={String($scaleIndex)} onChange={handleScaleChange} />
  </div>
  <div class="separator"></div>
  <div class="section">
    <div class="section-label">// URL</div>
    <div class="btn-row">
      <button class="btn btn-url" onclick={handleGetURL}>[ GET URL ]</button>
      <button class="btn btn-url" onclick={handleLoadURL}>[ LOAD URL ]</button>
    </div>
  </div>
</div>

<style>
  .ctrl { display:flex; flex-direction:column; padding:10px; }
  .section { display:flex; flex-direction:column; gap:6px; }
  .section-label { font-size:9px; font-weight:bold; color:#555; letter-spacing:1px; margin-bottom:2px; }
  .separator { height:1px; background:#1a1a1a; margin:10px 0; }
  .btn-row { display:flex; flex-direction:column; gap:4px; }
  .btn { display:flex; align-items:center; gap:8px; width:100%; padding:8px 10px; border:2px solid #2a2a2a; background:#141414; color:#ccc; font-family:"Menlo","Consolas",monospace; font-size:11px; font-weight:bold; letter-spacing:2px; cursor:pointer; transition:all 0.1s; }
  .btn:hover { border-color:#555; background:#1a1a1a; color:#fff; }
  .btn-play { border-color:#0c4; color:#0f4; }
  .btn-play:hover { background:#0a1a0a; border-color:#0e5; }
  .btn-stop { border-color:#0c4; color:#0c4; }
  .btn-stop:hover { background:#0a1a0a; border-color:#0e5; }
  .btn-clear { border-color:#c22; color:#f44; }
  .btn-clear:hover { background:#1a0505; border-color:#f44; }
  .btn-disabled { opacity:0.35; pointer-events:none; border-color:#333 !important; color:#444 !important; }
  .btn-disabled:hover { background:transparent; border-color:#333 !important; }
  .btn-disabled .btn-led { background:#333 !important; box-shadow:none !important; }
  .btn-url { border-color:#448; color:#88c; }
  .btn-url:hover { background:#0a0a1a; border-color:#66a; }
  .btn-led { width:6px; height:6px; flex-shrink:0; background:#222; }
  .led-on { background:#0f4; box-shadow:0 0 6px #0f4; }
  .led-off { background:#333; }
  .led-warn { background:#f44; box-shadow:0 0 6px #f44; }
  .param { display:flex; align-items:center; justify-content:space-between; padding:4px 8px; background:#111; border:1px solid #1a1a1a; }
  .param-key { font-size:10px; font-weight:bold; color:#777; letter-spacing:1px; }
  .param-val { font-family:"Menlo","Consolas",monospace; font-size:11px; color:#fff; background:#0a0a0a; border:1px solid #2a2a2a; padding:2px 6px; text-align:right; width:60px; outline:none; }
  .param-val.num { -moz-appearance:textfield; }
  .param-val.num::-webkit-outer-spin-button, .param-val.num::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
</style>
