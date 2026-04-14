<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { AUTH_TURNSTILE_SITE_KEY } from '../../config.js';
  import { t } from '../../lib/i18n/t.js';

  const dispatch = createEventDispatcher();

  export let action = 'auth';

  let container;
  let widgetId = null;
  let token = '';
  let loading = false;
  let loadError = '';

  const enabled = Boolean(AUTH_TURNSTILE_SITE_KEY);

  function emitState() {
    dispatch('change', {
      token,
      ready: !loading && !loadError,
      solved: Boolean(token),
      enabled,
    });
  }

  function resetToken() {
    token = '';
    emitState();
  }

  export function getToken() {
    return token;
  }

  export function reset() {
    if (!enabled || typeof window === 'undefined' || !window.turnstile || widgetId == null) {
      resetToken();
      return;
    }

    window.turnstile.reset(widgetId);
    resetToken();
  }

  function ensureTurnstileScript() {
    if (typeof window === 'undefined') {
      return Promise.resolve(null);
    }

    if (window.turnstile) {
      return Promise.resolve(window.turnstile);
    }

    const existing = document.querySelector('script[data-auth-turnstile="true"]');
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener('load', () => resolve(window.turnstile), { once: true });
        existing.addEventListener('error', reject, { once: true });
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.authTurnstile = 'true';
      script.addEventListener('load', () => resolve(window.turnstile), { once: true });
      script.addEventListener('error', reject, { once: true });
      document.head.appendChild(script);
    });
  }

  onMount(async () => {
    if (!enabled) {
      emitState();
      return;
    }

    loading = true;
    emitState();

    try {
      await ensureTurnstileScript();
      if (!window.turnstile || !container) {
        throw new Error('Turnstile failed to initialize');
      }

      widgetId = window.turnstile.render(container, {
        sitekey: AUTH_TURNSTILE_SITE_KEY,
        action,
        callback(value) {
          token = value || '';
          emitState();
        },
        'expired-callback': resetToken,
        'error-callback': () => {
          loadError = t('auth.challenge.unavailable');
          resetToken();
        },
      });
      loadError = '';
    } catch {
      loadError = t('auth.challenge.unavailable');
      resetToken();
    } finally {
      loading = false;
      emitState();
    }
  });

  onDestroy(() => {
    if (enabled && typeof window !== 'undefined' && window.turnstile && widgetId != null) {
      window.turnstile.remove(widgetId);
    }
  });
</script>

{#if enabled}
  <div class="auth-challenge">
    <div bind:this={container} class="auth-challenge__widget"></div>
    {#if loading}
      <p class="auth-challenge__status" role="status">{t('auth.challenge.loading')}</p>
    {:else if loadError}
      <p class="auth-challenge__error" role="alert">{loadError}</p>
    {/if}
  </div>
{/if}

<style>
  .auth-challenge {
    display: grid;
    gap: 0.65rem;
  }

  .auth-challenge__status,
  .auth-challenge__error {
    margin: 0;
    font-size: var(--font-size-sm);
  }

  .auth-challenge__status {
    color: var(--color-text-secondary);
  }

  .auth-challenge__error {
    color: var(--color-danger-soft);
  }
</style>
