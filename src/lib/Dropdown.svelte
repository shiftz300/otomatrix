<script>
  let { options = [], value = "", klass = "", onChange } = $props();

  let open = $state(false);
  let wrap;

  function toggle() { open = !open; }
  function select(opt) {
    value = opt.value;
    open = false;
    onChange?.(opt.value);
  }
  function close(e) {
    if (wrap && !wrap.contains(e.target)) open = false;
  }
</script>

<svelte:window onclick={close} />

<div class="dd-wrap {klass}" class:open bind:this={wrap}>
  <button class="dd-btn" onclick={(e) => { e.stopPropagation(); toggle(); }} type="button">
    <span class="dd-label">
      {#if options.find(o => o.value === value)}
        {options.find(o => o.value === value).label}
      {:else}
        {value || options[0]?.label || ""}
      {/if}
    </span>
    <span class="dd-arrow">&#x25BC;</span>
  </button>
  {#if open}
    <div class="dd-menu">
      {#each options as opt}
        <button
          class="dd-opt"
          class:active={opt.value === value}
          onclick={(e) => { e.stopPropagation(); select(opt); }}
          type="button"
        >
          {opt.label}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .dd-wrap { position: relative; width: 100%; }
  .dd-btn {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; padding: 6px 8px;
    background: #111; color: #00cc44;
    border: 1px solid #2a2a2a;
    font-family: "Menlo","Consolas",monospace;
    font-size: 10px; font-weight: bold; letter-spacing: 1px;
    cursor: pointer; outline: none;
  }
  .dd-btn:hover { border-color: #00cc44; background: #181818; }
  .open .dd-btn { border-color: #00cc44; }
  .dd-arrow { font-size: 7px; color: #555; margin-left: 6px; }
  .dd-menu {
    position: absolute; top: 100%; left: 0; right: 0; z-index: 20;
    background: #0d0d0d; border: 1px solid #00cc44; border-top: none;
    max-height: 200px; overflow-y: auto;
  }
  .dd-opt {
    display: block; width: 100%; padding: 6px 8px;
    background: transparent; color: #999;
    border: none; border-bottom: 1px solid #1a1a1a;
    font-family: "Menlo","Consolas",monospace;
    font-size: 10px; letter-spacing: 1px;
    cursor: pointer; text-align: left; outline: none;
  }
  .dd-opt:hover { background: #1a2a1a; color: #00cc44; }
  .dd-opt.active { color: #00cc44; background: #0a1a0a; }
</style>
