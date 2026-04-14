<script>
  import { onDestroy } from 'svelte';
  import Button from '../../lib/components/ui/Button.svelte';
  import Card from '../../lib/components/ui/Card.svelte';
  import AuthChallenge from './AuthChallenge.svelte';
  import { t } from '../../lib/i18n/t.js';
  import { session, resendVerification } from '../../stores/auth.js';
  import { isAuthChallengeEnabled } from '../../config.js';
  import { router } from '../../stores/router.js';

  export let status = 'pending';
  export let email = '';
  export let source = '';
  export let errorCode = '';

  let loading = false;
  let feedback = '';
  let feedbackTone = 'info';
  let remainingSeconds = 0;
  let cooldownId = null;
  let challengeToken = '';
  let challengeRef;
  const challengeEnabled = isAuthChallengeEnabled();

  $: normalizedStatus = status || 'pending';
  $: verifiedSession = Boolean($session?.user?.emailVerified);
  $: effectiveEmail = email || $session?.user?.email || '';
  $: title = verifiedSession
    ? t('auth.verify.success.title')
    : normalizedStatus === 'success'
      ? t('auth.verify.success.title')
      : normalizedStatus === 'error'
        ? t('auth.verify.error.title')
        : t('auth.verify.pending.title');
  $: subtitle = verifiedSession
    ? t('auth.verify.success.subtitle')
    : normalizedStatus === 'success'
      ? t('auth.verify.success.subtitle')
      : normalizedStatus === 'error'
        ? t('auth.verify.error.subtitle', { error: mapError(errorCode) })
        : source === 'signin'
          ? t('auth.verify.pending.subtitleSignin')
          : t('auth.verify.pending.subtitleSignup');
  $: canResend = normalizedStatus === 'pending' && !!effectiveEmail && !verifiedSession;

  function mapError(code) {
    if (code === 'invalid_token') return t('auth.verify.error.invalidToken');
    if (code === 'already_verified') return t('auth.verify.error.alreadyVerified');
    return t('auth.verify.error.generic');
  }

  function startCooldown(seconds = 30) {
    remainingSeconds = seconds;
    window.clearInterval(cooldownId);
    cooldownId = window.setInterval(() => {
      remainingSeconds = Math.max(remainingSeconds - 1, 0);
      if (remainingSeconds === 0) {
        window.clearInterval(cooldownId);
        cooldownId = null;
      }
    }, 1000);
  }

  async function handleResend() {
    if (!canResend || loading || remainingSeconds > 0) return;

    feedback = '';
    feedbackTone = 'info';
    loading = true;

    if (challengeEnabled && !challengeToken) {
      loading = false;
      feedbackTone = 'error';
      feedback = t('auth.errors.challengeRequired');
      return;
    }

    const result = await resendVerification(effectiveEmail, { challengeToken });

    loading = false;

    if (result.error) {
      feedbackTone = 'error';
      feedback = result.error.message || t('auth.verify.pending.resendError');
      if (result.error.code === 'rate_limited') {
        startCooldown(result.error.retryAfterSeconds || 30);
      }
      if (challengeEnabled && (result.error.code === 'challenge_required' || result.error.code === 'challenge_failed' || result.error.code === 'rate_limited')) {
        challengeRef?.reset?.();
        challengeToken = '';
      }
      return;
    }

    feedbackTone = 'success';
    feedback = t('auth.verify.pending.resendSuccess');
    startCooldown();
  }

  function goToSignIn() {
    router.navigate('/sign-in');
  }

  function goToHome() {
    router.navigate('/home');
  }

  onDestroy(() => {
    window.clearInterval(cooldownId);
  });
</script>

<Card class="auth-card" variant="raised" padding="lg" border="subtle">
  <header class="auth-header">
    <p class="auth-eyebrow">{t('auth.verify.eyebrow')}</p>
    <h2>{title}</h2>
    <p>{subtitle}</p>
  </header>

  {#if effectiveEmail && normalizedStatus !== 'success' && !verifiedSession}
    <p class="auth-detail">{t('auth.verify.pending.sentTo', { email: effectiveEmail })}</p>
  {/if}

  {#if feedback}
    <p class={`auth-feedback auth-feedback--${feedbackTone}`} role="status">{feedback}</p>
  {/if}

  {#if normalizedStatus === 'pending' && !verifiedSession}
    <div class="actions">
      <AuthChallenge
        bind:this={challengeRef}
        action="resend_verification"
        on:change={(event) => {
          challengeToken = event.detail.token;
        }}
      />
      <Button type="button" variant="primary" loading={loading} disabled={!canResend || loading || remainingSeconds > 0} block on:click={handleResend}>
        {loading
          ? t('auth.verify.pending.resending')
          : remainingSeconds > 0
            ? t('auth.verify.pending.resendCooldown', { seconds: remainingSeconds })
            : t('auth.verify.pending.resend')}
      </Button>
      <Button type="button" variant="ghost" block on:click={goToSignIn}>
        {t('auth.verify.pending.backToSignIn')}
      </Button>
    </div>
  {:else if verifiedSession || normalizedStatus === 'success'}
    <div class="actions">
      <Button type="button" variant="primary" block on:click={verifiedSession ? goToHome : goToSignIn}>
        {verifiedSession ? t('auth.verify.success.continue') : t('auth.verify.success.signIn')}
      </Button>
    </div>
  {:else}
    <div class="actions">
      <Button type="button" variant="primary" block on:click={goToSignIn}>
        {t('auth.verify.error.backToSignIn')}
      </Button>
    </div>
  {/if}
</Card>

<style>
  :global(.auth-card) {
    width: min(440px, 100%);
  }

  .auth-header {
    display: grid;
    gap: 0.45rem;
    text-align: left;
  }

  .auth-eyebrow {
    margin: 0;
    color: var(--color-text-muted);
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .auth-header h2,
  .auth-header p,
  .auth-detail,
  .auth-feedback {
    margin: 0;
  }

  .auth-header h2 {
    color: var(--color-text-primary);
    font-size: 1.5rem;
    letter-spacing: -0.03em;
  }

  .auth-header p,
  .auth-detail {
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
  }

  .actions {
    display: grid;
    gap: var(--space-2);
  }

  .auth-feedback {
    border-radius: var(--ui-radius-md);
    padding: 0.65rem 0.8rem;
    border: 1px solid var(--ui-border-subtle);
    font-size: var(--font-size-sm);
  }

  .auth-feedback--success {
    background: color-mix(in srgb, var(--ui-surface-card) 82%, #dff4e8 18%);
    border-color: color-mix(in srgb, #1f8f58 40%, var(--ui-border-subtle) 60%);
    color: #176640;
  }

  .auth-feedback--error {
    background: var(--color-danger-surface);
    border-color: var(--color-danger-border);
    color: var(--color-danger-soft);
  }

  .auth-feedback--info {
    background: color-mix(in srgb, var(--ui-surface-card) 88%, var(--ui-surface-secondary) 12%);
    color: var(--color-text-secondary);
  }
</style>
