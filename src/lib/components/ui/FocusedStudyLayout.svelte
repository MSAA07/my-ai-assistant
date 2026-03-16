<script>
  export let className = '';
  export let narrow = 'study';

  $: widthClass = narrow === 'narrow' ? 'ui-study-layout--narrow' : narrow === 'wide' ? 'ui-study-layout--wide' : '';
</script>

<section
  {...$$restProps}
  class={['ui-study-layout', widthClass, className, $$props.class ?? ''].filter(Boolean).join(' ')}
>
  {#if $$slots.header}
    <div class="ui-study-layout__header">
      <slot name="header" />
    </div>
  {/if}

  <div class="ui-study-layout__body">
    <slot />
  </div>

  {#if $$slots.footer}
    <div class="ui-study-layout__footer">
      <slot name="footer" />
    </div>
  {/if}
</section>

<style>
  .ui-study-layout {
    width: min(100%, var(--size-page-study));
    margin-inline: auto;
    display: grid;
    gap: var(--ui-space-4);
  }

  .ui-study-layout--narrow {
    width: min(100%, var(--size-page-narrow));
  }

  .ui-study-layout--wide {
    width: min(100%, var(--size-page-study-wide));
  }

  .ui-study-layout__header,
  .ui-study-layout__footer,
  .ui-study-layout__body {
    display: grid;
    gap: var(--ui-space-4);
  }
</style>
