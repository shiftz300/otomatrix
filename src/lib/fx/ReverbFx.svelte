<script>
  import NodeFrame from "./NodeFrame.svelte";
  import FxSlider from "./FxSlider.svelte";
  let { node, index = 0, drawing, hoverTarget, onRemove, onNodeDown, onOutDown, onInEnter, onInLeave } = $props();
</script>

<NodeFrame {node} {index} {drawing} {hoverTarget} {onRemove} {onNodeDown} {onOutDown} {onInEnter} {onInLeave}>
  {#snippet children()}
    <FxSlider label="SIZE" paramKey="reverbSize" min={0.1} max={1} />
    <FxSlider label="MIX" paramKey="reverbMix" min={0} max={0.6} />
  {/snippet}
</NodeFrame>
