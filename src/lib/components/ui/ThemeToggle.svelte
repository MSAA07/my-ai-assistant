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
    gap: var(--space-1);
    padding: var(--space-1);
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-surface-2);
  }

  .option {
    min-height: 40px;
    min-width: 96px;
    border: 1px solid transparent;
    border-radius: 999px;
    background: transparent;
    color: var(--color-text-secondary);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--motion-fast) var(--ease-standard);
  }

  .option:hover {
    color: var(--color-text-primary);
  }

  .option.active {
    color: var(--color-text-primary);
    background: var(--color-accent-surface);
    border-color: color-mix(in srgb, var(--color-accent-primary) 55%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-accent-primary) 42%, transparent);
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
