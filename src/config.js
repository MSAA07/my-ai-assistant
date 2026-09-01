const MISSING_API_BASE_URL_ERROR = "VITE_API_BASE_URL is not set — check your environment variables";

function normalizeAbsoluteUrl(value = "") {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

function normalizeEnvValue(value = "") {
  return String(value || "").trim();
}

export const getApiBaseUrl = () => {
  let apiBaseUrl = normalizeEnvValue(import.meta.env?.VITE_API_BASE_URL || "");

  if (!apiBaseUrl) {
    console.error(MISSING_API_BASE_URL_ERROR);
    throw new Error(MISSING_API_BASE_URL_ERROR);
  }

  if (apiBaseUrl === "same-origin") {
    if (typeof window === "undefined") {
      throw new Error("VITE_API_BASE_URL=same-origin requires a browser environment");
    }

    return window.location.origin;
  }

  if (!apiBaseUrl.startsWith("http://") && !apiBaseUrl.startsWith("https://")) {
    apiBaseUrl = `https://${apiBaseUrl}`;
  }

  if (apiBaseUrl.endsWith("/")) {
    apiBaseUrl = apiBaseUrl.slice(0, -1);
  }

  return apiBaseUrl;
};

export const getQaStagingApiBaseUrl = () => {
  const configuredUrl = normalizeEnvValue(import.meta.env?.VITE_QA_STAGING_API_BASE_URL || "");
  if (!configuredUrl) {
    throw new Error("VITE_QA_STAGING_API_BASE_URL is required for the QA tab; no fallback target is allowed");
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(configuredUrl);
  } catch {
    throw new Error("VITE_QA_STAGING_API_BASE_URL must be a valid staging URL");
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const hasStagingMarker = /(^|[.-])stag(e|ing)([.-]|$)/.test(hostname);
  const hasProductionMarker = /(^|[.-])prod(uction)?([.-]|$)/.test(hostname);
  if (parsedUrl.protocol !== "https:" || !hasStagingMarker || hasProductionMarker) {
    throw new Error("VITE_QA_STAGING_API_BASE_URL must be an HTTPS staging host and must not identify production");
  }

  return normalizeAbsoluteUrl(parsedUrl.toString());
};

export const API_BASE = getApiBaseUrl();
export const AUTH_SUPPORT_EMAIL = normalizeEnvValue(import.meta.env?.VITE_AUTH_SUPPORT_EMAIL || "contact@studymaxing.com");
export const AUTH_TURNSTILE_SITE_KEY = normalizeEnvValue(import.meta.env?.VITE_AUTH_TURNSTILE_SITE_KEY || "");

export function isAuthChallengeEnabled() {
  return Boolean(AUTH_TURNSTILE_SITE_KEY);
}

function getFrontendActionCallbackUrl(envName, action) {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/?auth_action=${action}`;
  }

  return normalizeAbsoluteUrl(import.meta.env?.[envName] || "");
}

function getBackendAuthBridgeUrl(path, nextUrl) {
  if (!nextUrl) {
    return "";
  }

  try {
    const bridgeUrl = new URL(`${API_BASE}${path}`);
    bridgeUrl.searchParams.set("next", nextUrl);
    return bridgeUrl.toString();
  } catch {
    return "";
  }
}

export function getEmailVerificationCallbackUrl() {
  const nextUrl = getFrontendActionCallbackUrl(
    "VITE_AUTH_VERIFICATION_CALLBACK_URL",
    "verify-email",
  );
  return getBackendAuthBridgeUrl("/auth/verify-email", nextUrl);
}

export function getPasswordResetCallbackUrl() {
  const nextUrl = getFrontendActionCallbackUrl(
    "VITE_AUTH_PASSWORD_RESET_CALLBACK_URL",
    "reset-password",
  );
  return getBackendAuthBridgeUrl("/auth/reset-password", nextUrl);
}
