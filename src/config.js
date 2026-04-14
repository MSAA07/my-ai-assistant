const DEPLOYMENT_API_BASES = {
  local: "http://localhost:3001",
  staging: "https://ai-assistant-backend-staging.up.railway.app",
  production: "https://ai-assistant-backend-production-ddf0.up.railway.app",
};

function normalizeAbsoluteUrl(value = "") {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

const PRODUCTION_FRONTEND_HOSTS = new Set([
  "studymaxing.com",
  "www.studymaxing.com",
  "my-ai-assistant.vercel.app",
]);

function isKnownPreviewHost(hostname) {
  return hostname.endsWith(".vercel.app") && hostname.includes("my-ai-assistant");
}

function getHostDerivedApiBaseUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  const hostname = window.location.hostname.toLowerCase();
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";

  if (import.meta.env?.DEV && isLocalHost) {
    return window.location.origin;
  }

  if (isLocalHost) {
    return DEPLOYMENT_API_BASES.staging;
  }

  if (PRODUCTION_FRONTEND_HOSTS.has(hostname) || hostname.includes("git-production")) {
    return DEPLOYMENT_API_BASES.production;
  }

  if (isKnownPreviewHost(hostname)) {
    return DEPLOYMENT_API_BASES.staging;
  }

  return DEPLOYMENT_API_BASES.production;
}

export const getApiBaseUrl = () => {
  let apiBaseUrl = import.meta.env?.VITE_API_BASE_URL
    || getHostDerivedApiBaseUrl()
    || DEPLOYMENT_API_BASES.local;

  if (!apiBaseUrl.startsWith("http://") && !apiBaseUrl.startsWith("https://")) {
    apiBaseUrl = `https://${apiBaseUrl}`;
  }

  if (apiBaseUrl.endsWith("/")) {
    apiBaseUrl = apiBaseUrl.slice(0, -1);
  }

  return apiBaseUrl;
};

export const API_BASE = getApiBaseUrl();

export function getEmailVerificationCallbackUrl() {
  const envOverride = normalizeAbsoluteUrl(import.meta.env?.VITE_AUTH_VERIFICATION_CALLBACK_URL || "");
  if (envOverride) {
    return envOverride;
  }

  if (typeof window === "undefined") {
    return "";
  }

  return `${window.location.origin}/?auth_action=verify-email`;
}

export function getPasswordResetCallbackUrl() {
  const envOverride = normalizeAbsoluteUrl(import.meta.env?.VITE_AUTH_PASSWORD_RESET_CALLBACK_URL || "");
  if (envOverride) {
    return envOverride;
  }

  if (typeof window === "undefined") {
    return "";
  }

  return `${window.location.origin}/?auth_action=reset-password`;
}
