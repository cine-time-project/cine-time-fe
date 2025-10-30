import axios from "axios";
import { config } from "@/helpers/config";

/** -----------------------------
 *  API BASE (absolute)
 *  ----------------------------- */
const ENV_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "";
const CONFIG_BASE = (config?.apiURL || "").trim();
export const API_BASE = (ENV_BASE || CONFIG_BASE).replace(/\/$/, "");

const TOKEN_KEYS = ["authToken", "access_token", "token"];
let inMemoryToken = "";

export function getToken() {
  try {
    if (inMemoryToken) return inMemoryToken;
    if (typeof window === "undefined") return "";

    for (const key of TOKEN_KEYS) {
      const val =
        window.localStorage?.getItem(key) ||
        document.cookie
          ?.split("; ")
          ?.find((row) => row.startsWith(key + "="))
          ?.split("=")[1];

      if (val && String(val).trim()) {
        const token = decodeURIComponent(val.trim());
        inMemoryToken = token; // 💾 cache token in memory
        return token;
      }
    }
  } catch {}
  return "";
}

export function setAuthToken(token) {
  inMemoryToken = token || "";
  if (typeof window !== "undefined" && token) {
    // localStorage senkronizasyonu
    try {
      window.localStorage.setItem("authToken", token);
      window.localStorage.setItem("token", token);
    } catch {}
  }
}

export function authHeaders(extra = {}) {
  const t = getToken();
  const base = t ? { Authorization: `Bearer ${t}` } : {};
  return { ...base, ...extra };
}

export function axiosAuth(extra = {}) {
  return { headers: authHeaders(extra) };
}

export function isLoggedIn() {
  return !!getToken();
}

/** -----------------------------
 *  AXIOS INSTANCE (ORTAK)
 *  ----------------------------- */
export const http = axios.create({
  baseURL: API_BASE,
  // timeout: 15000, // istersen aç
});

http.interceptors.request.use((cfg) => {
  if (!cfg.headers) cfg.headers = {};
  if (!cfg.headers.Authorization) {
    const token = getToken();
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

/** Mutlak API URL üretme yardımcıları */
export function apiUrl(path = "") {
  const p = String(path || "");
  return p.startsWith("http") ? p : `${API_BASE}/${p.replace(/^\/+/, "")}`;
 
}

/** -----------------------------
 *  USER / ROLE HELPERS
 *  ----------------------------- */

/** Get full user info from localStorage */
export function getAuthUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage?.getItem("authUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Get array of roles from user object */
export function getUserRoles() {
  const user = getAuthUser();
  if (!user || !Array.isArray(user.roles)) return [];
  return user.roles;
}

/** Check if user has a specific role */
export function hasRole(role) {
  return getUserRoles().includes(role);
}

/** Check if current user is admin */
export function isAdmin() {
  return hasRole("ADMIN");
}
