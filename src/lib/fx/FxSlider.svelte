<script>
  import { synthEngine, params } from "../SynthEngine.js";
  let { label, paramKey, min, max, step = 0.01 } = $props();
</script>

<div class="np-row">
  <span class="np-label">{label}</span>
  <input
    type="range" min={min} max={max} step={step}
    value={$params[paramKey] ?? min}
    oninput={(e) => synthEngine.updateParam(paramKey, parseFloat(e.target.value))}
    onpointerdown={(e) => e.stopPropagation()}
  />
</div>

<style>
  .np-row { display:flex; align-items:center; gap:3px; }
  .np-label { font-family:"Menlo","Consolas",monospace; font-size:7px; color:#555; min-width:24px; }
  .np-row input[type="range"] { -webkit-appearance:none; flex:1; height:3px; background:#1a1a1a; outline:none; cursor:pointer; }
  .np-row input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; width:8px; height:8px; background:#333; border:2px solid #0c4; cursor:pointer; }
</style>
