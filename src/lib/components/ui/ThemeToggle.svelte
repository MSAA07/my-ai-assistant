<script>
  import { createEventDispatcher } from 'svelte';
  import { t } from '../../i18n/t.js';

  export let value = 'dark';

  const dispatch = createEventDispatcher();

  function selectTheme(theme) {
    if (theme === value) return;
    dispatch('change', { theme });
  }

  function handleKeydown(event) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }

    event.preventDefault();

    const nextTheme =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? value === 'dark'
          ? 'light'
          : 'dark'
        : value === 'light'
          ? 'dark'
          : 'light';

    selectTheme(nextTheme);
  }
</script>

<div
  class="theme-toggle"
  role="radiogroup"
  tabindex="0"
  aria-label={t('settings.theme.ariaLabel')}
  on:keydown={handleKeydown}
>
  <button
    type="button"
    role="radio"
    class={`option ${value === 'dark' ? 'active' : ''}`}
    aria-checked={value === 'dark'}
    on:click={() => selectTheme('dark')}
  >
    {t('settings.theme.dark')}
  </button>
  <button
    type="button"
    role="radio"
    class={`option ${value === 'light' ? 'active' : ''}`}
    aria-checked={value === 'light'}
    on:click={() => selectTheme('light')}
  >
    {t('settings.theme.light')}
  </button>
</div>

<style>
  .theme-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.22rem;
    border: 1px solid color-mix(in srgb, var(--foreground) 10%, var(--border) 90%);
    border-radius: 0.9rem;
    background: color-mix(in srgb, var(--muted) 70%, transparent);
    box-shadow: var(--shadow-inline-control);
  }

  .option {
    min-height: var(--ui-control-height-md);
    min-width: 88px;
    border: 1px solid transparent;
    border-radius: calc(var(--radius) - 2px);
    background: transparent;
    color: var(--color-text-secondary);
    font-size: var(--font-size-xs);
    font-weight: 500;
    cursor: pointer;
    transition: background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard);
  }

  .option:hover {
    color: var(--color-text-primary);
  }

  .option.active {
    color: var(--color-text-primary);
    background: var(--background);
    border-color: color-mix(in srgb, var(--foreground) 8%, transparent);
    box-shadow: var(--shadow-inline-control);
  }

  .option:focus-visible {
    outline: 2px solid var(--color-focus-ring-strong);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    .theme-toggle {
      width: 100%;
    }

    .option {
      flex: 1;
      min-width: 0;
    }
  }
</style>
