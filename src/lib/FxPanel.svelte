<script>
  import { patchNodes } from "./stores.js";
  import { synthEngine, params } from "./SynthEngine.js";
  import Dropdown from "./Dropdown.svelte";

  let nodesOf = (t) => $patchNodes.filter(n => n.type === t);
  let countOf = (t) => nodesOf(t).length;
  let idxOpts = (t) => nodesOf(t).map(n => ({ value: String(n.index), label: String(n.index) }));

  function u(key, val) { synthEngine.updateParam(key, val); }
  function t(key) {
    synthEngine.updateParam(key, !$params[key]);
  }
</script>

<div class="fx">
  {#if countOf('drive')}
    <div class="fx-block">
      {#if countOf('drive') > 1}
        <Dropdown options={idxOpts('drive')} value="1" onChange={() => {}} />
      {/if}
      <div class="fx-row">
        <button class="fx-on" class:active={$params.driveOn} onclick={() => t('driveOn')}>DRV</button>
        <input type="range" min="1" max="20" value={$params.driveGain} oninput={(e) => u('driveGain', +e.target.value)} />
      </div>
    </div>
  {/if}

  {#if countOf('delay')}
    <div class="fx-block">
      {#if countOf('delay') > 1}
        <Dropdown options={idxOpts('delay')} value="1" onChange={() => {}} />
      {/if}
      <div class="fx-row">
        <button class="fx-on" class:active={$params.delayOn} onclick={() => t('delayOn')}>DLY</button>
        <input type="range" min="0.05" max="1" step="0.05" value={$params.delayTime} oninput={(e) => u('delayTime', +e.target.value)} />
      </div>
      <div class="fx-row"><span class="fx-k">FB</span><input type="range" min="0" max="0.9" step="0.05" value={$params.delayFB} oninput={(e) => u('delayFB', +e.target.value)} /></div>
      <div class="fx-row"><span class="fx-k">MX</span><input type="range" min="0" max="0.8" step="0.05" value={$params.delayMix} oninput={(e) => u('delayMix', +e.target.value)} /></div>
    </div>
  {/if}

  {#if countOf('reverb')}
    <div class="fx-block">
      {#if countOf('reverb') > 1}
        <Dropdown options={idxOpts('reverb')} value="1" onChange={() => {}} />
      {/if}
      <div class="fx-row">
        <button class="fx-on" class:active={$params.reverbOn} onclick={() => t('reverbOn')}>REV</button>
        <input type="range" min="0.1" max="1" step="0.05" value={$params.reverbSize} oninput={(e) => u('reverbSize', +e.target.value)} />
      </div>
      <div class="fx-row"><span class="fx-k">MX</span><input type="range" min="0" max="0.6" step="0.05" value={$params.reverbMix} oninput={(e) => u('reverbMix', +e.target.value)} /></div>
    </div>
  {/if}

  {#if countOf('filter')}
    <div class="fx-block">
      {#if countOf('filter') > 1}
        <Dropdown options={idxOpts('filter')} value="1" onChange={() => {}} />
      {/if}
      <div class="fx-row">
        <button class="fx-on" class:active={$params.filterOn} onclick={() => t('filterOn')}>FLT</button>
        <input type="range" min="200" max="8000" step="100" value={$params.filterFreq} oninput={(e) => u('filterFreq', +e.target.value)} />
      </div>
      <div class="fx-row"><span class="fx-k">RS</span><input type="range" min="0.5" max="15" step="0.5" value={$params.filterRes} oninput={(e) => u('filterRes', +e.target.value)} /></div>
    </div>
  {/if}

  <div class="fx-sep"></div>
  <div class="fx-row">
    <span class="fx-k">VOL</span>
    <input type="range" min="0" max="1" step="0.05" value={$params.volume} oninput={(e) => u('volume', +e.target.value)} />
  </div>
</div>

<style>
  .fx { display:flex; flex-direction:column; gap:6px; padding:8px; }
  .fx-block { display:flex; flex-direction:column; gap:4px; padding:6px; border:1px solid #1a1a1a; background:#0d0d0d; }
  .fx-row { display:flex; align-items:center; gap:6px; }
  .fx-sep { height:1px; background:#1a1a1a; }
  .fx-on { font-family:"Menlo","Consolas",monospace; font-size:9px; font-weight:bold; padding:3px 8px; border:1px solid #333; background:#0a0a0a; color:#444; cursor:pointer; letter-spacing:1px; min-width:36px; }
  .fx-on.active { border-color:#0c4; color:#0c4; background:#0a1a0a; }
  .fx-k { font-family:"Menlo","Consolas",monospace; font-size:9px; font-weight:bold; color:#666; min-width:22px; letter-spacing:1px; }
  .fx-row input[type="range"] { -webkit-appearance:none; flex:1; height:4px; background:#1a1a1a; outline:none; cursor:pointer; min-width:0; }
  .fx-row input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; width:10px; height:10px; background:#333; border:2px solid #0c4; cursor:pointer; }
</style>
