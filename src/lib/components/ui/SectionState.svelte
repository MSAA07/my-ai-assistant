<script>
  import Button from './Button.svelte';

  export let message = '';
  export let error = false;
  export let retry = null;
</script>

<div class:error class="section-state" role={error ? 'alert' : 'status'}>
  <p>{message}</p>
  {#if error && retry}
    <Button type="button" variant="secondary" size="sm" on:click={retry}>Retry</Button>
  {/if}
</div>

<style>
  .section-state { display: grid; place-items: center; gap: var(--ui-space-2); min-height: 10rem; padding: var(--ui-space-5); border: 1px dashed var(--ui-border-default); border-radius: var(--ui-radius-md); background: var(--ui-surface-secondary); text-align: center; }
  .section-state.error { border-color: color-mix(in srgb, var(--ui-accent-danger) 36%, var(--ui-border-default) 64%); }
  p { margin: 0; color: var(--ui-text-secondary); font-size: var(--ui-type-body-sm); }
</style>
