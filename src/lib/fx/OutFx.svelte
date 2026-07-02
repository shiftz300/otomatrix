<script>
  import NodeFrame from "./NodeFrame.svelte";
  import FxSlider from "./FxSlider.svelte";
  let { node, index = 0, drawing, hoverTarget, onRemove, onNodeDown, onOutDown, onInEnter, onInLeave } = $props();
</script>

<NodeFrame {node} {index} {drawing} {hoverTarget} {onRemove} {onNodeDown} {onOutDown} {onInEnter} {onInLeave}>
  {#snippet children()}
    <FxSlider label="VOL" paramKey="volume" min={0} max={1} />
  {/snippet}
</NodeFrame>
