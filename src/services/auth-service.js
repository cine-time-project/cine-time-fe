import { config } from "@/helpers/config";
import { api } from "./http"; // axios instance: baseURL = config.apiURL (örn: http://localhost:8090/api)

function parseJSONSafely(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function login({ email, password, signal } = {}) {
  // BE: POST /api/login
  const response = await fetch(`${config.apiURL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "omit",
    body: JSON.stringify({ email, password }),
    signal,
  });

  const raw = await response.text();
  const data = parseJSONSafely(raw);
  if (!response.ok) {
    const error = new Error(
      data?.message || response.statusText || "Request failed"
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return typeof data === "object" && data !== null ? data : { raw: data };
}

export async function register({ signal, ...payload } = {}) {
  // BE: POST /api/register
  const response = await fetch(`${config.apiURL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "omit",
    body: JSON.stringify(payload),
    signal,
  });

  const raw = await response.text();
  const data = parseJSONSafely(raw);
  if (!response.ok) {
    const error = new Error(
      data?.message || response.statusText || "Request failed"
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return typeof data === "object" && data !== null ? data : { raw: data };
}

export async function googleLogin(idToken) {
  // BE: POST /api/google
  const response = await fetch(`${config.apiURL}/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "omit",
    body: JSON.stringify({ idToken }),
  });

  const raw = await response.text();
  const data = parseJSONSafely(raw);
  if (!response.ok) {
    const err = new Error(
      data?.message || response.statusText || "Request failed"
    );
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function logout() {
  try {
    // BE: POST /api/logout
    await api.post("/logout");
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      document.cookie =
        "Authorization=; Max-Age=0; path=/; SameSite=Lax; Secure";
    }
  }
}

export async function requestPasswordReset(payload) {
  // BE: POST /api/forgot-password  (email, locale vs.)
  const { data } = await api.post("/forgot-password", payload);
  return data;
}

// (opsiyonel) KODLA SIFIRLAMA
export async function resetPasswordWithCode(payload) {
  const { data } = await api.post(`/reset-password-code`, payload);
  return data;
}

// (opsiyonel) OTURUM AÇIKKEN SIFIRLAMA
export async function resetPasswordAuthenticated(payload) {
  const { data } = await api.post(`/reset-password`, payload);
  return data;
}
