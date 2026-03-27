<script>
  export let value = 0;
  export let max = 100;
  export let ariaLabel = 'Progress';
  export let className = '';
  export let indeterminate = false;

  $: safeMax = Math.max(1, Number(max) || 100);
  $: safeValue = Math.min(Math.max(Number(value) || 0, 0), safeMax);
  $: percent = (safeValue / safeMax) * 100;
</script>

<div
  {...$$restProps}
  class={['ui-progress', className, $$props.class ?? ''].filter(Boolean).join(' ')}
  role="progressbar"
  aria-label={ariaLabel}
  aria-valuemin="0"
  aria-valuemax={safeMax}
  aria-valuenow={indeterminate ? undefined : safeValue}
>
  <span
    class={`ui-progress__fill ${indeterminate ? 'ui-progress__fill--indeterminate' : ''}`.trim()}
    style={indeterminate ? undefined : `width: ${percent}%`}
  ></span>
</div>

<style>
  .ui-progress {
    position: relative;
    width: 100%;
    height: 0.5rem;
    overflow: hidden;
    border-radius: var(--ui-radius-pill);
    background: var(--ui-progress-track);
  }

  .ui-progress__fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--ui-progress-fill);
    transition: width var(--motion-default) var(--ease-standard);
  }

  .ui-progress__fill--indeterminate {
    width: 42%;
    min-width: 5rem;
    animation: ui-progress-indeterminate 1.1s ease-in-out infinite;
  }

  @keyframes ui-progress-indeterminate {
    0% {
      transform: translateX(-115%);
    }

    50% {
      transform: translateX(35%);
    }

    100% {
      transform: translateX(215%);
    }
  }
</style>
