import { get, writable } from "svelte/store";
import { API_BASE, AUTH_SUPPORT_EMAIL, getEmailVerificationCallbackUrl, getPasswordResetCallbackUrl } from "../config.js";
import { clearAllPageCache } from "./pageCache.js";
import { router } from "./router.js";
import {
  DEFAULT_AUTH_PATH,
  LANDING_PATH,
  SIGN_IN_PATH,
  sanitizeRedirectPath,
  isPublicRoutePath,
} from "../routes.js";
import { t } from "../lib/i18n/t.js";

const AUTH_BASE = `${API_BASE}/api/auth`;
const AUTH_REQUEST_TIMEOUT_MS = 12000;
const AUTH_SYNC_KEY = "my-ai-assistant:auth-event";

const jsonHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json"
};

const initialMeta = {
  bootstrapPending: true,
  status: "loading",
  action: "idle",
  reason: "initial",
  errorCode: "",
};

let authInterceptorInitialized = false;
let authSyncInitialized = false;
let redirectingToAuth = false;
let bootstrapRequest = null;

export const session = writable(null);
export const isLoading = writable(true);
export const authMeta = writable({ ...initialMeta });

function updateMeta(partial) {
  authMeta.update((current) => ({
    ...current,
    ...partial,
  }));
}

function setAuthenticated(nextSession) {
  session.set(nextSession);
  isLoading.set(false);
  updateMeta({
    bootstrapPending: false,
    status: nextSession ? "authenticated" : "unauthenticated",
    action: "idle",
    reason: nextSession ? "authenticated" : "signed_out",
    errorCode: "",
  });
}

function setUnauthenticated(reason = "signed_out", errorCode = "") {
  session.set(null);
  isLoading.set(false);
  clearAllPageCache();
  updateMeta({
    bootstrapPending: false,
    status: "unauthenticated",
    action: "idle",
    reason,
    errorCode,
  });
}

function broadcastAuthEvent(type) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      AUTH_SYNC_KEY,
      JSON.stringify({ type, ts: Date.now() }),
    );
  } catch (error) {
    console.warn("Failed to broadcast auth event:", error);
  }
}

function getCurrentHashPath() {
  if (typeof window === "undefined") return LANDING_PATH;
  const raw = window.location.hash.slice(1) || LANDING_PATH;
  const [path] = raw.split("?");
  return path || LANDING_PATH;
}

function buildSignInPath({ reason, redirect } = {}) {
  const params = new URLSearchParams();

  if (reason) {
    params.set("reason", reason);
  }

  if (redirect) {
    params.set("redirect", redirect);
  }

  const query = params.toString();
  return `${SIGN_IN_PATH}${query ? `?${query}` : ""}`;
}

function redirectToSignIn(reason = "session_expired") {
  if (typeof window === "undefined" || redirectingToAuth) return;

  redirectingToAuth = true;
  const currentPath = sanitizeRedirectPath(getCurrentHashPath());
  const nextPath = buildSignInPath({
    reason,
    redirect: currentPath && !isPublicRoutePath(currentPath) ? currentPath : "",
  });

  router.replace(nextPath);
  window.setTimeout(() => {
    redirectingToAuth = false;
  }, 0);
}

function isBlockedMessage(message = "") {
  return /(blocked|suspend|suspended|banned|disabled|forbidden|denied)/i.test(message);
}

function normalizeAuthError({ status, message, path, errorCode = "", retryAfterSeconds = 0 }) {
  const normalizedMessage = typeof message === "string" ? message.trim() : "";
  const lowerMessage = normalizedMessage.toLowerCase();
  const normalizedCode = String(errorCode || "").trim().toLowerCase();

  if (status === 0) {
    if (lowerMessage.includes("timed out")) {
      return { code: "network_timeout", message: t("auth.errors.networkTimeout") };
    }

    return { code: "network_failure", message: t("auth.errors.networkFailure") };
  }

  if (status === 429 || normalizedCode === "rate_limited") {
    return {
      code: "rate_limited",
      message: retryAfterSeconds > 0
        ? t("auth.errors.rateLimitedRetry", { seconds: retryAfterSeconds })
        : t("auth.errors.rateLimited"),
    };
  }

  if (normalizedCode === "challenge_required") {
    return { code: "challenge_required", message: t("auth.errors.challengeRequired") };
  }

  if (normalizedCode === "challenge_failed") {
    return { code: "challenge_failed", message: t("auth.errors.challengeFailed") };
  }

  if (normalizedCode === "account_suspended" || isBlockedMessage(lowerMessage) || status === 423) {
    return {
      code: "account_suspended",
      message: t("auth.errors.accountSuspended", { email: AUTH_SUPPORT_EMAIL }),
    };
  }

  if (path === "/sign-in/email") {
    if (status === 403 && /verify|verified|verification/.test(lowerMessage)) {
      return { code: "email_verification_required", message: t("auth.errors.emailVerificationRequired") };
    }

    if (status === 401 || /invalid|credential|password|email/.test(lowerMessage)) {
      return { code: "invalid_credentials", message: t("auth.errors.invalidCredentials") };
    }
  }

  if (path === "/sign-up/email") {
    if (status === 403 && /verify|verified|verification/.test(lowerMessage)) {
      return { code: "email_verification_required", message: t("auth.errors.emailVerificationRequired") };
    }

    if (status === 409 || (/already|exists|taken|duplicate/.test(lowerMessage) && /email|user|account/.test(lowerMessage))) {
      return { code: "duplicate_email", message: t("auth.errors.duplicateEmail") };
    }

    if (status === 400 && /password/.test(lowerMessage)) {
      return { code: "weak_password", message: t("auth.errors.weakPassword") };
    }
  }

  if (path === "/request-password-reset") {
    if (status >= 500) {
      return { code: "server_failure", message: t("auth.errors.serverFailure") };
    }

    return { code: "password_reset_request_failed", message: t("auth.errors.passwordResetRequestFailed") };
  }

  if (path === "/reset-password") {
    if (/token|expired|invalid|used/.test(lowerMessage)) {
      return { code: "reset_token_invalid", message: t("auth.errors.resetTokenInvalid") };
    }

    if (status === 400 && /password/.test(lowerMessage)) {
      return { code: "weak_password", message: t("auth.errors.weakPassword") };
    }
  }

  if (path === "/change-password") {
    if (status === 401 || /current password|current_password|invalid current/.test(lowerMessage)) {
      return { code: "current_password_invalid", message: t("auth.errors.currentPasswordInvalid") };
    }

    if (status === 400 && /password/.test(lowerMessage)) {
      return { code: "weak_password", message: t("auth.errors.weakPassword") };
    }
  }

  if (path === "/get-session" && (status === 401 || status === 403)) {
    return { code: "session_expired", message: t("auth.errors.sessionExpired") };
  }

  if (status >= 500) {
    return { code: "server_failure", message: t("auth.errors.serverFailure") };
  }

  if (status >= 400 && /password/.test(lowerMessage)) {
    return { code: "weak_password", message: t("auth.errors.weakPassword") };
  }

  if (status >= 400 && normalizedMessage) {
    if (/verify|verified|verification/.test(lowerMessage)) {
      return { code: "email_verification_required", message: t("auth.errors.emailVerificationRequired") };
    }

    return { code: "request_failed", message: t("auth.errors.genericFailure") };
  }

  return { code: "malformed_response", message: t("auth.errors.malformedResponse") };
}

function createSessionRestoreError() {
  return {
    data: null,
    error: {
      status: 200,
      code: "session_restore_failed",
      message: t("auth.errors.sessionRestoreFailed"),
    }
  };
}

async function toResult(response, path) {
  const text = await response.text();
  const data = text
    ? (() => {
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    })()
    : null;

  if (!response.ok) {
    const retryAfterHeader = response.headers.get("retry-after");
    const retryAfterSeconds = Number.parseInt(data?.retryAfterSeconds ?? retryAfterHeader ?? "0", 10);
    const normalizedError = normalizeAuthError({
      status: response.status,
      message: data?.message || data?.error || response.statusText || "Request failed",
      path,
      errorCode: data?.code || "",
      retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : 0,
    });

    return {
      data: null,
      error: {
        status: response.status,
        code: normalizedError.code,
        message: normalizedError.message,
        retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : 0,
      }
    };
  }

  const responseData = data?.data ?? data;
  if (responseData === undefined) {
    return {
      data: null,
      error: {
        status: response.status,
        code: "malformed_response",
        message: t("auth.errors.malformedResponse"),
      }
    };
  }

  return {
    data: responseData,
    error: null
  };
}

async function request(path, { method = "GET", body } = {}) {
  const controller = new AbortController();
  let timeoutId = null;
  const init = {
    method,
    credentials: "include",
    headers: jsonHeaders,
    cache: "no-store",
    signal: controller.signal
  };

  if (body && method !== "GET") {
    init.body = JSON.stringify(body);
  }

  try {
    timeoutId = setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);
    const response = await fetch(`${AUTH_BASE}${path}`, init);
    return await toResult(response, path);
  } catch (error) {
    const normalizedError = normalizeAuthError({
      status: 0,
      message: error?.name === "AbortError" ? "Authentication request timed out" : (error?.message || "Request failed"),
      path,
    });

    return {
      data: null,
      error: {
        status: 0,
        code: normalizedError.code,
        message: normalizedError.message,
      }
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

function finishAuthAction() {
  updateMeta({ action: "idle" });
}

function logAuthFlow(event, details = {}) {
  if (typeof window === "undefined") return;
  console.info(`[auth-flow] ${event}`, details);
}

function maskEmail(email = "") {
  const [localPart = "", domain = ""] = String(email).split("@");
  if (!domain) return "";
  if (localPart.length <= 2) {
    return `${localPart[0] || "*"}***@${domain}`;
  }
  return `${localPart.slice(0, 2)}***@${domain}`;
}

export async function getSession() {
  return request("/get-session");
}

async function restoreSession(reason = "authenticated", { broadcast = false } = {}) {
  const sessionResult = await getSession();

  if (sessionResult.error) {
    setUnauthenticated(
      sessionResult.error.code === "account_suspended" ? "blocked_access" : "session_expired",
      sessionResult.error.code,
    );
    if (broadcast) {
      broadcastAuthEvent("session_invalid");
    }
    return sessionResult;
  }

  if (!sessionResult.data?.user) {
    setUnauthenticated("session_expired", "session_restore_failed");
    return createSessionRestoreError();
  }

  setAuthenticated(sessionResult.data);
  if (broadcast) {
    broadcastAuthEvent("signed_in");
  }
  updateMeta({ reason });
  return sessionResult;
}

export async function signIn(email, password, { challengeToken = "" } = {}) {
  updateMeta({ action: "sign_in", errorCode: "" });
  logAuthFlow("sign-in", {
    email: maskEmail(email),
    callbackURL: "",
    callbackHost: "",
  });

  const result = await request("/sign-in/email", {
    method: "POST",
    body: {
      email,
      password,
      ...(challengeToken ? { challengeToken } : {}),
    }
  });

  if (result.error) {
    finishAuthAction();
    updateMeta({
      status: "unauthenticated",
      reason: result.error.code === "account_suspended" ? "blocked_access" : "sign_in_failed",
      errorCode: result.error.code,
    });
    return result;
  }

  const sessionResult = await restoreSession("signed_in", { broadcast: true });
  finishAuthAction();

  if (sessionResult.error) {
    return sessionResult;
  }

  return result;
}

export async function signUp(email, password, name, { challengeToken = "" } = {}) {
  updateMeta({ action: "sign_up", errorCode: "" });
  const callbackURL = getEmailVerificationCallbackUrl();
  logAuthFlow("sign-up", {
    email: maskEmail(email),
    callbackURL,
    callbackHost: callbackURL ? new URL(callbackURL).host : "",
  });

  const result = await request("/sign-up/email", {
    method: "POST",
    body: {
      email,
      password,
      name,
      callbackURL,
      ...(challengeToken ? { challengeToken } : {}),
    }
  });

  if (result.error) {
    finishAuthAction();
    updateMeta({
      status: "unauthenticated",
      reason: result.error.code === "account_suspended" ? "blocked_access" : "sign_up_failed",
      errorCode: result.error.code,
    });
    return result;
  }

  finishAuthAction();
  setUnauthenticated("verification_pending", "");
  return {
    data: {
      ...result.data,
      requiresVerification: true,
      email,
    },
    error: null,
  };
}

export async function resendVerification(email, { challengeToken = "" } = {}) {
  updateMeta({ action: "resend_verification", errorCode: "" });
  const callbackURL = getEmailVerificationCallbackUrl();
  logAuthFlow("resend-verification", {
    email: maskEmail(email),
    callbackURL,
    callbackHost: callbackURL ? new URL(callbackURL).host : "",
  });

  const result = await request("/send-verification-email", {
    method: "POST",
    body: {
      email,
      callbackURL,
      ...(challengeToken ? { challengeToken } : {}),
    },
  });

  finishAuthAction();

  if (result.error) {
    updateMeta({
      status: "unauthenticated",
      reason: "verification_resend_failed",
      errorCode: result.error.code,
    });
    return result;
  }

  updateMeta({
    status: "unauthenticated",
    reason: "verification_resent",
    errorCode: "",
  });

  return result;
}

export async function requestPasswordReset(email, { challengeToken = "" } = {}) {
  updateMeta({ action: "request_password_reset", errorCode: "" });
  const redirectTo = getPasswordResetCallbackUrl();
  logAuthFlow("request-password-reset", {
    email: maskEmail(email),
    redirectTo,
    callbackHost: redirectTo ? new URL(redirectTo).host : "",
  });

  const result = await request("/request-password-reset", {
    method: "POST",
    body: {
      email,
      redirectTo,
      ...(challengeToken ? { challengeToken } : {}),
    },
  });

  finishAuthAction();

  if (result.error) {
    updateMeta({
      status: "unauthenticated",
      reason: "password_reset_request_failed",
      errorCode: result.error.code,
    });
  } else {
    updateMeta({
      status: "unauthenticated",
      reason: "password_reset_requested",
      errorCode: "",
    });
  }

  return result;
}

export async function resetPassword(token, newPassword) {
  updateMeta({ action: "reset_password", errorCode: "" });

  const result = await request("/reset-password", {
    method: "POST",
    body: {
      token,
      newPassword,
    },
  });

  finishAuthAction();

  if (result.error) {
    updateMeta({
      status: "unauthenticated",
      reason: "password_reset_failed",
      errorCode: result.error.code,
    });
    return result;
  }

  updateMeta({
    status: "unauthenticated",
    reason: "password_reset_complete",
    errorCode: "",
  });

  return result;
}

export async function changePassword(currentPassword, newPassword, { revokeOtherSessions = false } = {}) {
  updateMeta({ action: "change_password", errorCode: "" });

  const result = await request("/change-password", {
    method: "POST",
    body: {
      currentPassword,
      newPassword,
      revokeOtherSessions,
    },
  });

  finishAuthAction();

  if (result.error) {
    updateMeta({
      status: get(session) ? "authenticated" : "unauthenticated",
      reason: "change_password_failed",
      errorCode: result.error.code,
    });
    return result;
  }

  updateMeta({
    status: get(session) ? "authenticated" : "unauthenticated",
    reason: "password_changed",
    errorCode: "",
  });

  return result;
}

export async function signOut({ broadcast = true, redirect = true } = {}) {
  updateMeta({ action: "sign_out", errorCode: "" });

  await request("/sign-out", { method: "POST" });
  setUnauthenticated("signed_out");

  if (broadcast) {
    broadcastAuthEvent("signed_out");
  }

  if (redirect) {
    redirectToSignIn("signed_out");
  }
}

export function handleSessionInvalidation(reason = "session_expired", { broadcast = true, redirect = true } = {}) {
  const errorCode = reason === "blocked_access" ? "account_suspended" : "session_expired";
  setUnauthenticated(reason, errorCode);

  if (broadcast) {
    broadcastAuthEvent("session_invalid");
  }

  if (redirect) {
    redirectToSignIn(reason);
  }
}

function shouldInvalidateForResponse(input, response) {
  if (!response || (response.status !== 401 && response.status !== 423)) return false;

  const url = typeof input === "string"
    ? input
    : input instanceof URL
      ? input.toString()
      : input?.url || "";

  if (!url.startsWith(API_BASE)) return false;
  if (url.startsWith(AUTH_BASE)) return false;
  return true;
}

function initializeAuthInterceptor() {
  if (typeof window === "undefined" || authInterceptorInitialized) return;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);

    if (shouldInvalidateForResponse(args[0], response) && get(session)) {
      handleSessionInvalidation(response.status === 423 ? "blocked_access" : "session_expired");
    }

    return response;
  };

  authInterceptorInitialized = true;
}

function initializeAuthSync() {
  if (typeof window === "undefined" || authSyncInitialized) return;

  window.addEventListener("storage", (event) => {
    if (event.key !== AUTH_SYNC_KEY || !event.newValue) return;

    try {
      const payload = JSON.parse(event.newValue);
      if (payload.type === "signed_out" || payload.type === "session_invalid") {
        handleSessionInvalidation(payload.type === "signed_out" ? "signed_out" : "session_expired", {
          broadcast: false,
          redirect: true,
        });
        return;
      }

      if (payload.type === "signed_in") {
        updateMeta({ bootstrapPending: true, status: "loading", reason: "sync" });
        isLoading.set(true);
        restoreSession("signed_in", { broadcast: false });
      }
    } catch (error) {
      console.warn("Failed to process auth sync event:", error);
    }
  });

  authSyncInitialized = true;
}

async function bootstrapSession(reason = "bootstrap") {
  if (bootstrapRequest) {
    return bootstrapRequest;
  }

  updateMeta({ bootstrapPending: true, status: "loading", reason, errorCode: "" });
  isLoading.set(true);

  bootstrapRequest = (async () => {
    try {
      const result = await getSession();
      if (result.error) {
        setUnauthenticated(
          result.error.code === "account_suspended" ? "blocked_access" : "session_expired",
          result.error.code,
        );
        return;
      }

      setAuthenticated(result.data);
    } catch (error) {
      console.error("Failed to load session:", error);
      setUnauthenticated("session_expired", "session_expired");
    } finally {
      bootstrapRequest = null;
    }
  })();

  return bootstrapRequest;
}

function initializeBootstrapRecovery() {
  if (typeof window === "undefined") return;

  const recoverBootstrap = () => {
    const meta = get(authMeta);
    if (!get(isLoading) && !meta?.bootstrapPending) {
      return;
    }

    bootstrapSession("resume");
  };

  window.addEventListener("pageshow", recoverBootstrap);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      recoverBootstrap();
    }
  });
}

initializeAuthInterceptor();
initializeAuthSync();
initializeBootstrapRecovery();
bootstrapSession();

export const authClient = {
  getSession,
  signIn,
  signUp,
  signOut,
  resendVerification,
  requestPasswordReset,
  resetPassword,
  changePassword,
  handleSessionInvalidation,
};
