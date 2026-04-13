<script>
  export let width = 'default';
  export let gap = 'default';
  export let className = '';

  $: widthClass = width === 'narrow'
    ? 'page-layout--narrow'
    : width === 'wide'
      ? 'page-layout--wide'
      : width === 'full'
        ? 'page-layout--full'
        : width === 'fluid'
          ? 'page-layout--fluid'
          : '';

  $: gapClass = gap === 'compact'
    ? 'page-layout--compact'
    : gap === 'spacious'
      ? 'page-layout--spacious'
      : '';

  $: resolvedClass = ['page-layout', widthClass, gapClass, className, $$props.class ?? '']
    .filter(Boolean)
    .join(' ');
</script>

<section {...$$restProps} class={resolvedClass}>
  <slot />
</section>

<style>
  .page-layout {
    --page-layout-max-width: var(--size-page-default);
    --page-layout-gap: var(--layout-shell-page-gap);
    width: min(100%, var(--page-layout-max-width));
    min-width: 0;
    margin-inline: auto;
    display: grid;
    align-content: start;
    gap: var(--page-layout-gap);
  }

  .page-layout--narrow {
    --page-layout-max-width: var(--size-page-narrow);
  }

  .page-layout--wide {
    --page-layout-max-width: var(--size-page-wide);
  }

  .page-layout--full {
    --page-layout-max-width: var(--size-page-full);
  }

  .page-layout--fluid {
    --page-layout-max-width: 100%;
  }

  .page-layout--compact {
    --page-layout-gap: var(--layout-shell-page-gap-tight);
  }

  .page-layout--spacious {
    --page-layout-gap: var(--layout-shell-page-gap-spacious);
  }
</style>
