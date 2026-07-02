<script>
  import { get } from "svelte/store";
  import { synthEngine, params } from "./SynthEngine.js";
  import { NODE_TYPES } from "./fx/types.js";
  import { FX_COMPONENTS } from "./fx/index.js";
  import { patchNodes } from "./stores.js";

  let nodes = $state([]), connections = $state([]), nextId = $state(1);
  let dragging = $state(null), drawing = $state(null), hoverTarget = $state(null), panning = $state(null);
  let mouseX = 0, mouseY = 0;
  let canvas, svgEl;
  let scale = $state(0.75);
  let rafId = null;

  // Sync nodes to store for FX panel, per-type numbering
  $effect(() => {
    const byType = {};
    const enriched = nodes.map(n => {
      byType[n.type] = (byType[n.type] || 0) + 1;
      return {
        id: n.id, type: n.type, label: n.label, color: n.color,
        index: byType[n.type], params: n.params, inputs: n.inputs, outputs: n.outputs,
      };
    });
    patchNodes.set(enriched);
  });

  function addNode(type, x, y) {
    const def = NODE_TYPES[type];
    const id = `n${nextId++}`;
    nodes = [...nodes, { id, type, label:def.label, color:def.color,
      inputs:def.inputs, outputs:def.outputs,
      params: def.params ? def.params.map(p=>({...p})) : [],
      x: x||100+Math.random()*200, y: y||100+Math.random()*150, on:true }];
    if (def.params) def.params.forEach(p => {
      if (p.k && !Object.prototype.hasOwnProperty.call(get(params), p.k) && p.type!=="sel")
        params.update(pr => ({ ...pr, [p.k]: p.min!==undefined ? p.min : 0.5 }));
    });
  }
  function removeNode(nodeId) {
    nodes = nodes.filter(n => n.id !== nodeId);
    connections = connections.filter(c => c.from !== nodeId && c.to !== nodeId);
  }

  function autoLayout() {
    if (nodes.length === 0) return;
    const outs = {}; for (const n of nodes) outs[n.id] = [];
    for (const c of connections) { if (outs[c.from]) outs[c.from].push(c.to); }
    const inDeg = {}; for (const n of nodes) inDeg[n.id] = 0;
    for (const c of connections) { if (inDeg[c.to] !== undefined) inDeg[c.to]++; }
    const queue = nodes.filter(n => inDeg[n.id] === 0 || NODE_TYPES[n.type]?.inputs === 0);
    const depth = {}; for (const n of queue) depth[n.id] = 0;
    let qi = 0;
    while (qi < queue.length) {
      const cur = queue[qi++];
      for (const nextId of (outs[cur.id] || [])) {
        if (depth[nextId] === undefined) { depth[nextId] = depth[cur.id] + 1; queue.push(nodes.find(n => n.id === nextId)); }
      }
    }
    for (const n of nodes) if (depth[n.id] === undefined) depth[n.id] = 0;

    const cols = {};
    for (const n of nodes) { const d = depth[n.id]; if (!cols[d]) cols[d] = []; cols[d].push(n); }
    const nodeW = 150, colGap = 60, rowGap = 32, padX = 40, padY = 80;
    const maxCols = 5;
    // Sources (depth 0) naturally first in ascending order → rightmost column
    // Deeper nodes (higher depth) wrap to next row when > maxCols per row
    const colKeys = Object.keys(cols).map(Number).sort((a,b)=>a-b);

    const colRow = {};
    for (let i = 0; i < colKeys.length; i++) colRow[colKeys[i]] = Math.floor(i / maxCols);
    // Build rows preserving ascending order: colIdx 0 = rightmost = source
    const rowCols = {};
    for (const d of colKeys) { const r = colRow[d]; if (!rowCols[r]) rowCols[r] = []; rowCols[r].push(d); }

    // Compute Y baseline per row (max height of all columns in that row)
    function nodeH(n) { return 28 + Math.max(1, (n.params?.length || 1)) * 14 + 16; }
    const rowH = {}, colH = {};
    for (const d of colKeys) {
      colH[d] = cols[d].reduce((h, n) => h + nodeH(n) + rowGap, 0);
    }
    for (const r of Object.keys(rowCols)) {
      rowH[r] = Math.max(...rowCols[r].map(d => colH[d]));
    }

    // Compute positions
    const rowBaseY = {};
    let cy = padY;
    for (let r = 0; r < Object.keys(rowCols).length; r++) { rowBaseY[r] = cy; cy += rowH[r] - 30; }

    nodes = nodes.map(n => {
      const d = depth[n.id];
      const r = colRow[d];
      const colList = rowCols[r];
      const colIdx = colList.indexOf(d); // 0 = rightmost
      const x = padX + (colList.length - 1 - colIdx) * (nodeW + colGap); // colIdx 0 = rightmost (source)
      let y = rowBaseY[r];
      const colNodes = cols[d];
      for (const cn of colNodes) {
        if (cn.id === n.id) break;
        y += nodeH(cn) + rowGap;
      }
      return { ...n, x, y };
    });
  }

  function nodeDown(e, nodeId) {
    e.stopPropagation(); e.preventDefault();
    const node = nodes.find(n => n.id === nodeId); if (!node) return;
    const cr = canvas.getBoundingClientRect();
    dragging = { nodeId, ox: (e.clientX-cr.left)/scale - node.x, oy: (e.clientY-cr.top)/scale - node.y };
    startCableRAF();
  }
  function onMove(e) {
    const cr = canvas?.getBoundingClientRect(); if (!cr) return;
    mouseX = (e.clientX - cr.left) / scale;
    mouseY = (e.clientY - cr.top) / scale;
    if (panning) {
      canvas.scrollLeft = panning.sl - (e.clientX - panning.sx);
      canvas.scrollTop = panning.st - (e.clientY - panning.sy);
      return;
    }
    if (dragging) {
      nodes = nodes.map(n => n.id===dragging.nodeId ? {...n, x:(e.clientX-cr.left)/scale-dragging.ox, y:(e.clientY-cr.top)/scale-dragging.oy} : n);
    }
    if (drawing) {
      // Check if hovering over a node body (for whole-module drop)
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const nodeEl = el?.closest?.('.node');
      if (nodeEl) {
        const nid = nodeEl.getAttribute('data-pid');
        const node = nodes.find(n => n.id === nid);
        if (node && node.inputs > 0) {
          // Check if hovering a specific port-in
          if (el?.classList?.contains('port-in')) {
            const portMatch = el.getAttribute('data-port')?.match(/^.+-in-(\d+)$/);
            if (portMatch) hoverTarget = { nodeId: nid, port: parseInt(portMatch[1]) };
          } else {
            hoverTarget = { nodeId: nid, port: 0 };
          }
          return;
        }
      }
      hoverTarget = null;
    }
  }
  function onUp() {
    if (dragging) { dragging = null; stopCableRAF(); return; }
    if (drawing && hoverTarget) {
      const exists = connections.find(c => c.from===drawing.nodeId&&c.fromPort===drawing.port&&c.to===hoverTarget.nodeId&&c.toPort===hoverTarget.port);
      connections = exists ? connections.filter(c => c!==exists) : [...connections, {from:drawing.nodeId,fromPort:drawing.port,to:hoverTarget.nodeId,toPort:hoverTarget.port}];
    }
    drawing = null; hoverTarget = null; panning = null; stopCableRAF();
  }

  function onWheel(e) {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    scale = Math.max(0.3, Math.min(2, scale + delta));
  }

  function scrollToCenter() {
    if (nodes.length === 0) return;
    let cx = 0, cy = 0;
    nodes.forEach(n => { cx += n.x + 75; cy += n.y + 40; });
    cx = cx / nodes.length * scale - canvas.clientWidth / 2;
    cy = cy / nodes.length * scale - canvas.clientHeight / 2;
    canvas.scrollTo({ left: Math.max(0, cx), top: Math.max(0, cy), behavior: 'smooth' });
  }

  function bgDown(e) {
    if (e.target !== canvas && !e.target.classList.contains('patch-bg') && !e.target.classList.contains('patch-scene')) return;
    e.preventDefault();
    panning = { sx: e.clientX, sy: e.clientY, sl: canvas.scrollLeft, st: canvas.scrollTop };
  }

  let centerOffset = $state({ x: 0, y: 0 });

  function centerPos() {
    if (!canvas) return { x: 400, y: 300 };
    return {
      x: (canvas.clientWidth / 2 + canvas.scrollLeft) / scale,
      y: (canvas.clientHeight / 2 + canvas.scrollTop) / scale
    };
  }

  function addNodeAtCenter(type) {
    const c = centerPos();
    const ox = centerOffset.x, oy = centerOffset.y;
    addNode(type, c.x - 75 + ox, c.y - 40 + oy);
    centerOffset = { x: (ox + 34) % 272, y: (oy + 34) % 272 };
  }

  function outDown(e, nodeId, port) { e.stopPropagation(); e.preventDefault(); drawing = { nodeId, port }; startCableRAF(); }
  function inEnter(nodeId, port) { if (drawing) hoverTarget = { nodeId, port }; }
  function inLeave() { if (drawing) hoverTarget = null; }

  function updateCables() {
    if (!svgEl) return;
    // Auto-size SVG to cover full viewport at current scroll
    const vw = canvas.clientWidth, vh = canvas.clientHeight;

    const lines = svgEl.querySelectorAll('line:not(.preview)');
    lines.forEach(line => {
      const fid = line.getAttribute('data-from'), fpid = parseInt(line.getAttribute('data-fromport')||'0');
      const tid = line.getAttribute('data-to'), tpid = parseInt(line.getAttribute('data-toport')||'0');
      if (fid && tid) {
        const f = portPos(fid, fpid, false), t = portPos(tid, tpid, true);
        line.setAttribute('x1', f.x); line.setAttribute('y1', f.y);
        line.setAttribute('x2', t.x); line.setAttribute('y2', t.y);
      }
    });
  }

  function portPos(nodeId, portIdx, isInput) {
    const el = document.querySelector(`[data-port="${nodeId}-${isInput?'in':'out'}-${portIdx}"]`);
    if (!el || !canvas) return { x:0, y:0 };
    const r = el.getBoundingClientRect(), cr = canvas.getBoundingClientRect();
    // Content-space coordinates: account for scroll offset and scale
    return {
      x: (r.left - cr.left + r.width/2 + canvas.scrollLeft) / scale,
      y: (r.top - cr.top + r.height/2 + canvas.scrollTop) / scale
    };
  }

  function onScroll() { updateCables(); }

  function startCableRAF() {
    if (rafId) return;
    const loop = () => {
      if (!dragging && !drawing) { rafId = null; return; }
      if (svgEl) {
        // Update connected cables
        const lines = svgEl.querySelectorAll('line:not(.preview)');
        lines.forEach(line => {
          const fid = line.getAttribute('data-from'), fpid = parseInt(line.getAttribute('data-fromport')||'0');
          const tid = line.getAttribute('data-to'), tpid = parseInt(line.getAttribute('data-toport')||'0');
          if (fid && tid) {
            const f = portPos(fid, fpid, false), t = portPos(tid, tpid, true);
            line.setAttribute('x1', f.x); line.setAttribute('y1', f.y);
            line.setAttribute('x2', t.x); line.setAttribute('y2', t.y);
          }
        });
        // Update preview line
        const prev = svgEl.querySelector('.preview');
        if (prev && drawing) {
          const fp = portPos(drawing.nodeId, drawing.port, false);
          prev.setAttribute('x1', fp.x); prev.setAttribute('y1', fp.y);
          prev.setAttribute('x2', mouseX); prev.setAttribute('y2', mouseY);
        }
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
  }
  function stopCableRAF() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  $effect(() => {
    if (dragging || drawing) return;
    updateCables();
  });

  // Initialize default patch — add nodes, connect, layout synchronously
  addNode("osc", 0, 0); addNode("drive", 0, 0);
  addNode("delay", 0, 0); addNode("reverb", 0, 0);
  addNode("filter", 0, 0); addNode("out", 0, 0);
  (() => {
    const id = t => nodes.find(n => n.type === t)?.id;
    const pairs = [["osc","drive"],["drive","delay"],["delay","reverb"],["reverb","filter"],["filter","out"]];
    let newConns = [...connections];
    pairs.forEach(([a, b]) => {
      const ai = id(a), bi = id(b);
      if (ai && bi) newConns = [...newConns, { from: ai, fromPort: 0, to: bi, toPort: 0 }];
    });
    connections = newConns;
  })();
  autoLayout();
</script>

<svelte:window onpointermove={onMove} onpointerup={onUp} />

<div class="patch-editor">
  <div class="top-right-panel">
    <div class="zoom-ctrl">
      <button onclick={(e) => { e.stopPropagation(); scale=Math.max(0.3,scale-0.1); }}>-</button>
      <span class="zoom-val">{Math.round(scale*100)}%</span>
      <button onclick={(e) => { e.stopPropagation(); scale=Math.min(2,scale+0.1); }}>+</button>
      <span class="zoom-sep"></span>
      <button class="zoom-auto" onclick={(e) => { e.stopPropagation(); autoLayout(); }}>AUTO</button>
      <span class="zoom-sep"></span>
      <button class="zoom-auto" onclick={(e) => { e.stopPropagation(); scrollToCenter(); }}>CENTER</button>
      <span class="zoom-sep"></span>
      <button class="zoom-auto nt-clear" onclick={(e) => { e.stopPropagation(); if(confirm('Clear all nodes and connections?')) { nodes=[]; connections=[]; nextId=1; } }}>CLEAR</button>
    </div>
    <div class="node-toolbar">
      {#each Object.entries(NODE_TYPES) as [type, def]}
        <button class="nt-btn" onclick={(e) => { e.stopPropagation(); addNodeAtCenter(type); }} style="border-color:{def.color}">{def.label}</button>
      {/each}
    </div>
  </div>

  <div class="patch-scroll" bind:this={canvas} onwheel={onWheel} onpointerdown={bgDown} onscroll={onScroll} class:patch-panning={panning} role="application" tabindex="-1">
    <div class="patch-scene" style="transform:scale({scale});transform-origin:0 0">
      <div class="patch-bg"></div>
      {#each nodes as node, i (node.id)}
        {#if FX_COMPONENTS[node.type]}
          {@const Fx = FX_COMPONENTS[node.type]}
          <Fx
            {node} index={node._idx || 1} {drawing} {hoverTarget}
            onRemove={removeNode}
            onNodeDown={nodeDown}
            onOutDown={outDown}
            onInEnter={inEnter}
            onInLeave={inLeave}
          />
        {/if}
      {/each}

    <svg class="cables" class:drawing={drawing} bind:this={svgEl}>
      {#each connections as conn (conn.from+conn.fromPort+conn.to+conn.toPort)}
        <line data-from={conn.from} data-fromport={conn.fromPort} data-to={conn.to} data-toport={conn.toPort}
          stroke="#00cc44" stroke-width="2" opacity="0.35" role="button" tabindex="0"
          onclick={(e) => { e.stopPropagation(); if (!drawing) connections = connections.filter(c => c !== conn); }}
          onkeydown={(e) => { e.stopPropagation(); if (!drawing && (e.key === 'Delete' || e.key === 'Backspace')) connections = connections.filter(c => c !== conn); }} />
      {/each}
      {#if drawing}
        <line class="preview" stroke="#00cc44" stroke-width="2" opacity="0.3" stroke-dasharray="4,3" />
      {/if}
    </svg>
  </div><!-- .patch-scene -->
  </div><!-- .patch-scroll -->
</div><!-- .patch-editor -->

<style>
  .patch-editor { position:relative; width:100%; height:100%; overflow:hidden; background:#080808; }
  .patch-editor :global(*) { outline:none; }
  .patch-editor :global(*:focus-visible) { outline:none; }
  .patch-scroll { position:absolute; top:0; left:0; right:0; bottom:0; overflow:auto; scrollbar-width:none; }
  .patch-scroll::-webkit-scrollbar { display:none; }
  .top-right-panel { position:absolute; top:4px; right:4px; display:flex; flex-direction:column; gap:4px; z-index:30; align-items:flex-end; }
  .zoom-ctrl { display:flex; align-items:center; gap:4px; padding:3px 6px; background:rgba(10,10,10,0.95); border:1px solid #222; }
  .zoom-ctrl button { font-family:"Menlo","Consolas",monospace; font-size:12px; font-weight:bold; width:20px; height:20px; padding:0; border:1px solid #333; background:#0a0a0a; color:#888; cursor:pointer; display:flex; align-items:center; justify-content:center; }
  .zoom-ctrl button:hover { color:#fff; border-color:#0c4; }
  .zoom-val { font-family:"Menlo","Consolas",monospace; font-size:10px; color:#888; min-width:36px; text-align:center; }
  .zoom-sep { width:1px; height:16px; background:#333; margin:0 4px; }
  .zoom-auto { width:auto !important; height:auto !important; padding:3px 8px !important; font-family:"Menlo","Consolas",monospace; font-size:9px; font-weight:bold; border:1px solid #0c4; background:#0a0a0a; color:#0c4; cursor:pointer; }
  .zoom-auto:hover { background:#0a1a0a; }
  .patch-scene { position:relative; width:8000px; height:8000px; cursor:grab; }
  .patch-panning .patch-scene { cursor:grabbing; }
  .patch-bg { position:absolute; top:0; left:0; width:100%; height:100%; background-image:linear-gradient(#111 1px,transparent 1px),linear-gradient(90deg,#111 1px,transparent 1px); background-size:30px 30px; z-index:0; pointer-events:none; }
  .node-toolbar { display:inline-flex; flex-direction:column; gap:2px; padding:5px; background:rgba(10,10,10,0.9); border:1px solid #222; align-items:stretch; }
  .nt-btn { font-family:"Menlo","Consolas",monospace; font-size:9px; font-weight:bold; padding:4px 10px; border:1px solid #333; background:#0a0a0a; color:#888; cursor:pointer; letter-spacing:1px; text-align:right; white-space:nowrap; }
  .nt-btn:hover { color:#fff; background:#1a1a1a; }
  .nt-clear { border-color:#c22 !important; color:#f44 !important; }
  .nt-clear:hover { background:#1a0505 !important; }
  .cables { position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:20; }
  .cables line { pointer-events:stroke; stroke-width:3; opacity:0.3; transition:opacity 0.1s, stroke 0.1s; }
  .cables line:hover { stroke:#ff4444; opacity:0.85; stroke-width:5; cursor:pointer; }
  .cables.drawing line { pointer-events:none; }
</style>
