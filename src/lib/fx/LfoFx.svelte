<script>
  import NodeFrame from "./NodeFrame.svelte";
  import FxSlider from "./FxSlider.svelte";
  let { node, index = 0, drawing, hoverTarget, onRemove, onNodeDown, onOutDown, onInEnter, onInLeave } = $props();
</script>

<NodeFrame {node} {index} {drawing} {hoverTarget} {onRemove} {onNodeDown} {onOutDown} {onInEnter} {onInLeave}>
  {#snippet children()}
    <FxSlider label="RATE" paramKey="modRate" min={0.5} max={15} />
    <FxSlider label="DEP" paramKey="modDepth" min={0} max={1} />
  {/snippet}
</NodeFrame>
