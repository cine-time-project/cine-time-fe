import { config } from "@/helpers/config";

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
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "omit",
    body: JSON.stringify({ email, password }),
    signal,
  });

  const raw = await response.text();
  const data = parseJSONSafely(raw);

  if (!response.ok) {
    const error = new Error(
      (data && typeof data === "object" && "message" in data && data.message) ||
        response.statusText ||
        "Request failed"
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
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "omit",
    body: JSON.stringify(payload),
    signal,
  });

  const raw = await response.text();
  const data = parseJSONSafely(raw);

  if (!response.ok) {
    const error = new Error(
      (data && typeof data === "object" && "message" in data && data.message) ||
        response.statusText ||
        "Request failed"
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return typeof data === "object" && data !== null ? data : { raw: data };
}

export async function googleLogin(idToken) {
  const response = await fetch(`${config.apiURL}/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  return response.json();
}

export async function logout() {
  try {
    // Sunucu varsa:
    await api.post("/auth/logout"); // cookie/JWT invalidate eden endpoint
  } finally {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      document.cookie =
        "Authorization=; Max-Age=0; path=/; SameSite=Lax; Secure";
    }
  }
}
