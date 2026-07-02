// OTOMATRIX 2D Cellular Automaton Sequencer
import { get } from "svelte/store";
import {
  cells, cellCounter, playing, bpm,
  scaleIndex, synthParams, flashCells, GRID_SIZE,
} from "./stores.js";
import { SCALES, cellToFreq } from "./scales.js";
import { synthEngine } from "./SynthEngine.js";

export const DIR_VECTORS = [
  { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 },
];
export const DIR_ARROWS = ["\u25B2", "\u25B6", "\u25BC", "\u25C0"];

let timerId = null;
let flashTimeoutId = null;

export function startSequencer() {
  stopSequencer();
  timerId = setInterval(tick, 60000 / (get(bpm) * 2));
}
export function stopSequencer() {
  if (timerId !== null) { clearInterval(timerId); timerId = null; }
}
export function restartSequencer() {
  stopSequencer();
  if (get(playing)) startSequencer();
}

function tick() {
  cells.update((currentCells) => {
    const cellArr = Object.values(currentCells);
    if (cellArr.length === 0) return currentCells;
    const size = GRID_SIZE;
    const last = size - 1;

    // Clone cells
    let newCells = {};
    for (const [id, c] of Object.entries(currentCells)) newCells[id] = { ...c };

    const sounded = [];
    const flashed = new Set();

    // Phase 1: Move & wall check (bounce, stay in place)
    for (const c of Object.values(newCells)) {
      const v = DIR_VECTORS[c.dir];
      const nx = c.x + v.dx, ny = c.y + v.dy;

      if (nx < 0 || nx >= size || ny < 0 || ny >= size) {
        // Wall hit: bounce (reverse direction), stay in place
        const origDir = c.dir;
        c.dir = (c.dir + 2) % 4;
        // Sound: horizontal walls use x, vertical walls use y
        sounded.push({ id: c.id, val: origDir % 2 === 1 ? c.y : c.x, x: c.x, y: c.y });
        // Flash the wall row/column
        if (origDir % 2 === 0) {
          for (let i = 0; i < size; i++) flashed.add(i * size + c.x);
        } else {
          for (let i = 0; i < size; i++) flashed.add(c.y * size + i);
        }
      } else {
        // Normal move
        c.x = nx;
        c.y = ny;
      }
    }

    // Phase 2: Collision detection (cells that share a position after moving)
    const byPos = {};
    for (const c of Object.values(newCells)) {
      const k = `${c.x},${c.y}`;
      if (!byPos[k]) byPos[k] = [];
      byPos[k].push(c);
    }
    for (const group of Object.values(byPos)) {
      if (group.length >= 2) {
        for (const c of group) c.dir = (c.dir + 1) % 4;
      }
    }

    // Flash and sound
    if (flashed.size > 0) {
      flashCells.set(flashed);
      clearTimeout(flashTimeoutId);
      flashTimeoutId = setTimeout(() => flashCells.set(new Set()), 50);
    }

    if (sounded.length > 0) {
      const si = get(scaleIndex);
      setTimeout(() => {
        for (const s of sounded) {
          synthEngine.playFreq(cellToFreq(si, s.val));
        }
      }, 0);
    }
    return newCells;
  });
}

export function addCell(x, y) {
  cellCounter.update((n) => {
    const id = n;
    cells.update((current) => {
      const filtered = {};
      for (const [key, c] of Object.entries(current)) {
        if (c.x !== x || c.y !== y) filtered[key] = c;
      }
      filtered[String(id)] = { id, x, y, dir: 0 };
      return filtered;
    });
    return n + 1;
  });
}

export function cycleCell(x, y) {
  cells.update((current) => {
    const matching = Object.entries(current).filter(([, c]) => c.x === x && c.y === y);
    if (matching.length === 0) return current;
    const newCells = { ...current };
    for (const [id, c] of matching) {
      if (c.dir < 3) newCells[id] = { ...c, dir: c.dir + 1 };
      else delete newCells[id];
    }
    return newCells;
  });
}

export function clearAll() {
  cells.set({});
  cellCounter.set(0);
}

export function getStateURL() {
  const state = get(cells);
  let w = "";
  for (const c of Object.values(state)) w += `${c.x}${c.y}${c.dir}`;
  return `${window.location.origin}${window.location.pathname}?q=10_${get(scaleIndex)}_${get(bpm)}_${w}`;
}

export function loadFromURL(urlStr) {
  const idx = urlStr.indexOf("?q=");
  if (idx === -1) return false;
  const parts = urlStr.slice(idx + 3).split("_");
  if (parts.length === 4) {
    const wids = parts[3].match(/.{3}/g) || [];
    stopSequencer(); playing.set(false);
    scaleIndex.set(parseInt(parts[1], 10));
    bpm.set(Math.max(30, Math.min(300, parseInt(parts[2], 10) || 120)));
    const nc = {};
    for (let i = 0; i < wids.length; i++) {
      nc[String(i)] = { id: i, x: parseInt(wids[i][0],10), y: parseInt(wids[i][1],10), dir: parseInt(wids[i][2],10) };
    }
    cells.set(nc);
    cellCounter.set(wids.length);
    return true;
  }
  if (parts.length === 1) {
    const lookup = "qwertyuiopasdfghjklzxcvbnm0123456789";
    const wids = parts[0].match(/.{2}/g) || [];
    stopSequencer(); playing.set(false);
    scaleIndex.set(0); bpm.set(120);
    const nc = {};
    for (let i = 0; i < wids.length; i++) {
      const x = parseInt(wids[i][0],10);
      const val = lookup.indexOf(wids[i][1]);
      nc[String(i)] = { id: i, x, y: (val - val % 4) / 4, dir: val % 4 };
    }
    cells.set(nc);
    cellCounter.set(wids.length);
    return true;
  }
  return false;
}
