<script>
  import NodeFrame from "./NodeFrame.svelte";
  import FxSlider from "./FxSlider.svelte";
  let { node, index = 0, drawing, hoverTarget, onRemove, onNodeDown, onOutDown, onInEnter, onInLeave } = $props();
</script>

<NodeFrame {node} {index} {drawing} {hoverTarget} {onRemove} {onNodeDown} {onOutDown} {onInEnter} {onInLeave}>
  {#snippet children()}
    <FxSlider label="TIME" paramKey="delayTime" min={0.05} max={1} />
    <FxSlider label="FB" paramKey="delayFB" min={0} max={0.9} />
    <FxSlider label="MIX" paramKey="delayMix" min={0} max={0.8} />
  {/snippet}
</NodeFrame>
