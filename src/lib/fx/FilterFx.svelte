<script>
  import NodeFrame from "./NodeFrame.svelte";
  import FxSlider from "./FxSlider.svelte";
  let { node, index = 0, drawing, hoverTarget, onRemove, onNodeDown, onOutDown, onInEnter, onInLeave } = $props();
</script>

<NodeFrame {node} {index} {drawing} {hoverTarget} {onRemove} {onNodeDown} {onOutDown} {onInEnter} {onInLeave}>
  {#snippet children()}
    <FxSlider label="FREQ" paramKey="filterFreq" min={200} max={8000} step={50} />
    <FxSlider label="RES" paramKey="filterRes" min={0.5} max={15} />
  {/snippet}
</NodeFrame>
