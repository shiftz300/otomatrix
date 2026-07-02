<script>
  // Shared node frame: position, drag, head, ports
  // Renders slot content for params in the node body

  let { node, index = 0, drawing, hoverTarget, onRemove, onNodeDown, onOutDown, onInEnter, onInLeave, children } = $props();
</script>

<div
  class="node" data-pid={node.id}
  style="left:{node.x}px;top:{node.y}px;border-color:{node.color}"
  class:hover-target={drawing && hoverTarget?.nodeId === node.id}
  onpointerdown={(e) => onNodeDown(e, node.id)}
  role="button" tabindex="0"
  onkeydown={(e) => { if (e.key === 'Delete' || e.key === 'Backspace') onRemove(node.id); }}
>
  <div class="node-head">
    <span class="node-idx">{index}</span>
    <span class="node-dot on" style="background:{node.color}"></span>
    <span class="node-label">{node.label}</span>
    <button class="node-del" onclick={(e) => { e.stopPropagation(); onRemove(node.id); }}>x</button>
  </div>
  <div class="node-body">
    {#if node.outputs > 0}
      <div class="node-ports">
        {#each Array(node.outputs) as _, i}
          <div
            class="port port-out"
            data-port="{node.id}-out-{i}"
            class:active={drawing?.nodeId === node.id && drawing?.port === i}
            onpointerdown={(e) => onOutDown(e, node.id, i)}
            role="button" tabindex="0"
          ></div>
        {/each}
      </div>
    {/if}
    <div class="node-params">
      {@render children?.()}
    </div>
    {#if node.inputs > 0}
      <div class="node-ports">
        {#each Array(node.inputs) as _, i}
          <div
            class="port port-in"
            data-port="{node.id}-in-{i}"
            class:hover={drawing && hoverTarget?.nodeId === node.id && hoverTarget?.port === i}
            onpointerenter={() => onInEnter(node.id, i)}
            onpointerleave={() => onInLeave()}
            role="button" tabindex="0"
          ></div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .node { position:absolute; background:#111; border:1px solid #333; min-width:120px; z-index:10; cursor:grab; transition:border-color 0.15s, box-shadow 0.15s; }
  .node.hover-target { border-color:#00cc44 !important; box-shadow:0 0 14px rgba(0,204,68,0.35); }
  .node:active { cursor:grabbing; }
  .node-head { display:flex; align-items:center; gap:4px; padding:4px 6px; background:#0d0d0d; border-bottom:1px solid #222; }
  .node-idx { font-family:"Menlo","Consolas",monospace; font-size:8px; color:#555; font-weight:bold; min-width:12px; text-align:right; }
  .node-dot { width:6px; height:6px; flex-shrink:0; opacity:0.3; }
  .node-dot.on { opacity:1; box-shadow:0 0 5px currentColor; }
  .node-label { font-family:"Menlo","Consolas",monospace; font-size:10px; font-weight:bold; color:#999; letter-spacing:1px; flex:1; }
  .node-del { font-family:"Menlo","Consolas",monospace; font-size:8px; font-weight:bold; padding:0 4px; border:1px solid #333; background:transparent; color:#444; cursor:pointer; }
  .node-del:hover { border-color:#c22; color:#f44; }
  .node-body { display:flex; align-items:stretch; gap:4px; padding:4px 6px; }
  .node-ports { display:flex; flex-direction:column; gap:3px; justify-content:center; }
  .port { width:14px; height:14px; border-radius:50%; border:2px solid #555; background:#0a0a0a; cursor:crosshair; flex-shrink:0; transition:all 0.1s; }
  .port-in { border-color:#4488cc; }
  .port-in.hover { border-color:#00cc44; background:#0a2a0a; box-shadow:0 0 10px #00cc44; transform:scale(1.4); }
  .port-out { border-color:#cc8844; }
  .port-out:hover { border-color:#ffaa44; }
  .port-out.active { background:#cc8844; box-shadow:0 0 8px #cc8844; }
  .node-params { flex:1; display:flex; flex-direction:column; gap:2px; min-width:0; }
</style>
