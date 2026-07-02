<script>
  import { cells, flashCells, GRID_SIZE } from "./stores.js";
  import { DIR_ARROWS, addCell, cycleCell } from "./Sequencer.js";

  let cellData = $derived($cells);
  let flashed = $derived($flashCells);
  let cellCount = $derived(Object.keys(cellData).length);

  function buildGrid(cellData, flashed) {
    const rows = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        const idx = y * GRID_SIZE + x;
        const cell = Object.values(cellData).find(c => c.x === x && c.y === y);
        row.push({
          arrow: cell ? DIR_ARROWS[cell.dir] : "",
          flash: flashed.has(idx),
        });
      }
      rows.push(row);
    }
    return rows;
  }

  function handleClick(x, y) {
    const existing = Object.values(cellData).filter(c => c.x === x && c.y === y);
    if (existing.length === 0) {
      addCell(x, y);
    } else {
      cycleCell(x, y);
    }
  }

  let grid = $derived(buildGrid(cellData, flashed));
</script>

<div class="grid-wrap">
  <table class="grid">
    <tbody>
      {#each grid as row, ri}
        <tr>
          {#each row as val, ci}
            <td
              class="cell"
              class:flashing={val.flash}
              class:occupied={val.arrow !== ""}
              onclick={() => handleClick(ci, ri)}
            >
              {val.arrow}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
  <div class="info">
    CELLS: {cellCount} | GRID: {GRID_SIZE}x{GRID_SIZE}
  </div>
</div>

<style>
  .grid-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 12px;
  }
  .grid {
    border-collapse: collapse;
    border: 2px solid #888888;
  }
  .cell {
    width: min(7vw, 7vh);
    height: min(7vw, 7vh);
    text-align: center;
    vertical-align: middle;
    font-size: min(3.5vw, 3.5vh);
    font-weight: bold;
    border: 1px solid #444444;
    background: #111111;
    color: #cccccc;
    cursor: pointer;
    user-select: none;
    transition: background 0.05s;
    font-family: "Menlo", "Consolas", monospace;
  }
  .cell:hover {
    background: #1a1a1a;
  }
  .cell.occupied {
    color: #00cc44;
  }
  .cell.flashing {
    background: #00cc44 !important;
    color: #000000;
  }
  .info {
    font-family: "Menlo", "Consolas", monospace;
    font-size: 11px;
    color: #666666;
    letter-spacing: 1px;
  }
</style>
