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
  const response = await fetch(`${config.apiURL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "omit", // Cookie tabanlı oturumsa "include" yap
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
  const response = await fetch(`${config.apiURL}/auth/register`, {
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
  // BE tarafı: POST /api/auth/google
  const response = await fetch(`${config.apiURL}/auth/google`, {
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
    // BE tarafı: POST /api/auth/logout
    await api.post("/auth/logout");
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      document.cookie =
        "Authorization=; Max-Age=0; path=/; SameSite=Lax; Secure";
    }
  }
}

export async function requestPasswordReset(payload) {
  // BE tarafı: POST /api/forgot-password  (email, locale vs.)
  const { data } = await api.post("/forgot-password", payload);
  return data;
}
