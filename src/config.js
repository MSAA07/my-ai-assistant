const DEPLOYMENT_API_BASES = {
  local: "http://localhost:3001",
  staging: "https://ai-assistant-backend-staging.up.railway.app",
  production: "https://ai-assistant-backend-production-ddf0.up.railway.app",
};

function getHostDerivedApiBaseUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  const hostname = window.location.hostname.toLowerCase();
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
  const isProductionFrontendHost = hostname === "studymaxing.com"
    || hostname === "www.studymaxing.com"
    || hostname === "my-ai-assistant.vercel.app"
    || hostname.includes("git-production");

  if (import.meta.env.DEV && isLocalHost) {
    return window.location.origin;
  }

  if (isLocalHost) {
    return DEPLOYMENT_API_BASES.staging;
  }

  if (isProductionFrontendHost) {
    return DEPLOYMENT_API_BASES.production;
  }

  if (hostname.endsWith(".vercel.app") && hostname.includes("my-ai-assistant")) {
    return DEPLOYMENT_API_BASES.staging;
  }

  return null;
}

export const getApiBaseUrl = () => {
  let apiBaseUrl = import.meta.env.VITE_API_BASE_URL
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
