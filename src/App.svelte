<script>
  import Grid2D from "./lib/Grid2D.svelte";
  import Controls from "./lib/Controls.svelte";
  import PatchEditor from "./lib/PatchEditor.svelte";
  import FxPanel from "./lib/FxPanel.svelte";
  import SynthTab from "./lib/SynthTab.svelte";
  import { loadFromURL } from "./lib/Sequencer.js";

  let mode = $state("sequencer");

  $effect(() => {
    if (window.location.search) loadFromURL(window.location.href);
  });
</script>

<div class="app">
  <div class="top-bar">
    <div class="bar-line"></div>
    <button class="mode-btn" class:active={mode==="sequencer"} onclick={() => mode="sequencer"}>SEQUENCER</button>
    <button class="mode-btn" class:active={mode==="synth"} onclick={() => mode="synth"}>SYNTH</button>
    <button class="mode-btn" class:active={mode==="patch"} onclick={() => mode="patch"}>PATCH</button>
    <div class="bar-line"></div>
  </div>

  <div class="main-area">
    <div class="panel panel-left">
      <div class="panel-header">
        <span class="header-dot on"></span>
        <span class="header-label">[ CONTROL ]</span>
      </div>
      <div class="panel-body">
        <Controls />
      </div>
    </div>

    <div class="scene-area">
      {#if mode === "sequencer"}
        <Grid2D />
      {:else if mode === "synth"}
        <div class="synth-area">
          <SynthTab />
        </div>
      {:else}
        <PatchEditor />
      {/if}
    </div>

    {#if mode === "sequencer"}
      <div class="panel panel-right">
        <div class="panel-header">
          <span class="header-dot on"></span>
          <span class="header-label">[ FX ]</span>
        </div>
        <div class="panel-body">
          <FxPanel />
        </div>
      </div>
    {/if}
  </div>

  <div class="bottom-bar">
    <div class="bar-line"></div>
    <span class="bar-label">CLICK CELL TO ADD :: CLICK AGAIN TO ROTATE/REMOVE</span>
    <div class="bar-line"></div>
  </div>
</div>

<style>
  :global(*) { margin:0; padding:0; box-sizing:border-box; }
  :global(html,body) { width:100%; height:100%; overflow:hidden; background:#0a0a0a; font-family:"Menlo","Consolas","Courier New",monospace; color:#ccc; font-size:11px; -webkit-font-smoothing:none; }
  .app { display:flex; flex-direction:column; width:100vw; height:100vh; background:#0a0a0a; }
  .top-bar { display:flex; align-items:center; gap:8px; padding:5px 16px; background:#0d0d0d; border-bottom:2px solid #2a2a2a; flex-shrink:0; }
  .bar-line { flex:1; height:1px; background:#2a2a2a; }
  .mode-btn { font-family:"Menlo","Consolas",monospace; font-size:10px; font-weight:bold; padding:4px 14px; border:1px solid #333; background:transparent; color:#555; cursor:pointer; letter-spacing:2px; }
  .mode-btn:hover { color:#888; border-color:#555; }
  .mode-btn.active { color:#00cc44; border-color:#00cc44; }
  .main-area { display:flex; flex:1; min-height:0; }
  .scene-area { flex:1; min-width:0; border-left:2px solid #1a1a1a; border-right:2px solid #1a1a1a; background:#060606; display:flex; align-items:center; justify-content:center; }
  .synth-area { width:320px; max-height:100%; overflow-y:auto; background:#0d0d0d; border:1px solid #1a1a1a; }
  .synth-area::-webkit-scrollbar { width:4px; }
  .synth-area::-webkit-scrollbar-track { background:#0a0a0a; }
  .synth-area::-webkit-scrollbar-thumb { background:#2a2a2a; }
  .panel { display:flex; flex-direction:column; width:240px; flex-shrink:0; background:#0d0d0d; overflow:hidden; }
  .panel-left { width:220px; }
  .panel-right { width:180px; }
  .panel-header { display:flex; align-items:center; gap:8px; padding:8px 12px; background:#111; border-bottom:2px solid #222; flex-shrink:0; }
  .header-dot { width:8px; height:8px; background:#222; flex-shrink:0; }
  .header-dot.on { background:#00ff41; box-shadow:0 0 6px #00ff41; }
  .header-label { font-size:10px; font-weight:bold; color:#888; letter-spacing:2px; }
  .panel-body { flex:1; overflow-y:auto; overflow-x:hidden; }
  .panel-body::-webkit-scrollbar { width:4px; }
  .panel-body::-webkit-scrollbar-track { background:#0a0a0a; }
  .panel-body::-webkit-scrollbar-thumb { background:#2a2a2a; }
  .bottom-bar { display:flex; align-items:center; gap:12px; padding:4px 16px; background:#0d0d0d; border-top:2px solid #2a2a2a; flex-shrink:0; }
  .bottom-bar .bar-label { font-size:9px; color:#444; }
</style>
