import { writable } from "svelte/store";
import { API_BASE } from "../config.js";

const AUTH_BASE = `${API_BASE}/api/auth`;
const AUTH_REQUEST_TIMEOUT_MS = 12000;

const jsonHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json"
};

const toResult = async (response) => {
  const text = await response.text();
  const data = text ? (() => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  })() : null;

  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || "Request failed";
    return {
      data: null,
      error: {
        status: response.status,
        message
      }
    };
  }

  return {
    data: data?.data ?? data,
    error: null
  };
};

const request = async (path, { method = "GET", body } = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);
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
    const response = await fetch(`${AUTH_BASE}${path}`, init);
    return toResult(response);
  } catch (error) {
    const isTimeout = error?.name === "AbortError";
    return {
      data: null,
      error: {
        status: 0,
        message: isTimeout ? "Authentication request timed out" : (error?.message || "Request failed")
      }
    };
  } finally {
    clearTimeout(timeoutId);
  }
};

export const session = writable(null);
export const isLoading = writable(true);

export const getSession = async () => {
  return request("/get-session");
};

export const signIn = async (email, password) => {
  const result = await request("/sign-in/email", {
    method: "POST",
    body: { email, password }
  });

  if (!result.error) {
    const sessionResult = await getSession();
    if (!sessionResult.error) {
      session.set(sessionResult.data);
    }
  }

  return result;
};

export const signUp = async (email, password, name) => {
  const result = await request("/sign-up/email", {
    method: "POST",
    body: { email, password, name }
  });

  if (!result.error) {
    const sessionResult = await getSession();
    if (!sessionResult.error) {
      session.set(sessionResult.data);
    }
  }

  return result;
};

export const signOut = async () => {
  await request("/sign-out", { method: "POST" });
  session.set(null);
};

const bootstrapSession = async () => {
  try {
    const result = await getSession();
    if (!result.error) {
      session.set(result.data);
    } else {
      session.set(null);
    }
  } catch (error) {
    console.error("Failed to load session:", error);
    session.set(null);
  } finally {
    isLoading.set(false);
  }
};

bootstrapSession();

export const authClient = {
  getSession,
  signIn,
  signUp,
  signOut
};
