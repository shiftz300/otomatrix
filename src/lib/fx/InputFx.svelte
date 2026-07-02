<script>
  import NodeFrame from "./NodeFrame.svelte";
  let { node, index = 0, drawing, hoverTarget, onRemove, onNodeDown, onOutDown, onInEnter, onInLeave } = $props();
</script>

<NodeFrame {node} {index} {drawing} {hoverTarget} {onRemove} {onNodeDown} {onOutDown} {onInEnter} {onInLeave}>
  {#snippet children()}
  {/snippet}
</NodeFrame>
