import axios from "axios";
import { config } from "@/helpers/config";

/** -----------------------------
 *  API BASE (absolute)
 *  Öncelik: .env (NEXT_PUBLIC_API_BASE_URL | NEXT_PUBLIC_API_BASE) → config.apiURL
 *  config.apiURL zaten kendi içinde default’u yönetiyor.
 *  ----------------------------- */
const ENV_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE ||
  "";

const CONFIG_BASE = (config?.apiURL || "").trim();

export const API_BASE = (ENV_BASE || CONFIG_BASE).replace(/\/$/, "");

/** -----------------------------
 *  TOKEN YÖNETİMİ
 *  ----------------------------- */
const TOKEN_KEYS = ["authToken", "access_token", "token"];
let inMemoryToken = "";

/** Tarayıcıdan (ve varsa bellekten) token’ı getirir */
export function getToken() {
  if (inMemoryToken) return inMemoryToken;
  if (typeof window === "undefined") return "";
  for (const k of TOKEN_KEYS) {
    const v = window.localStorage?.getItem(k);
    if (v && String(v).trim()) return String(v).trim();
  }
  return "";
}

/** Manuel token set (örn. login sonrası hafızaya almak için) */
export function setAuthToken(token) {
  inMemoryToken = token || "";
}

/** Authorization + ek header’ları birleştirir */
export function authHeaders(extra = {}) {
  const t = getToken();
  const base = t ? { Authorization: `Bearer ${t}` } : {};
  return { ...base, ...extra };
}

/** Axios çağrılarında kolaylık: axios.get(url, axiosAuth()) */
export function axiosAuth(extra = {}) {
  return { headers: authHeaders(extra) };
}

/** Kullanıcı oturumda mı? */
export function isLoggedIn() {
  return !!getToken();
}

/** -----------------------------
 *  AXIOS INSTANCE (ORTAK)
 *  ----------------------------- */
export const http = axios.create({
  baseURL: API_BASE, // her zaman absolute
  // timeout: 15000, // istersen aç
});

// Request interceptor: otomatik Authorization ekle
http.interceptors.request.use((cfg) => {
  if (!cfg.headers) cfg.headers = {};
  if (!cfg.headers.Authorization) {
    const token = getToken();
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// Response interceptor (opsiyonel global 401 handling için açılabilir)
// http.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err?.response?.status === 401) {
//       // örn. logout veya /login yönlendirmesi
//     }
//     return Promise.reject(err);
//   }
// );

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
