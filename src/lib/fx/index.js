// FX component registry — maps node type to component for dynamic loading
import InputFx from "./InputFx.svelte";
import DriveFx from "./DriveFx.svelte";
import DelayFx from "./DelayFx.svelte";
import ReverbFx from "./ReverbFx.svelte";
import FilterFx from "./FilterFx.svelte";
import LfoFx from "./LfoFx.svelte";
import OutFx from "./OutFx.svelte";

export const FX_COMPONENTS = {
  osc: InputFx,
  drive: DriveFx,
  delay: DelayFx,
  reverb: ReverbFx,
  filter: FilterFx,
  lfo: LfoFx,
  out: OutFx,
};

console.log(`[fx] loaded: ${Object.keys(FX_COMPONENTS).join(" ")}`);
