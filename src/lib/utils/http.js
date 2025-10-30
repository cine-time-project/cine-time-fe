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

/** -----------------------------
 *  TOKEN YÖNETİMİ
 *  ----------------------------- */
const TOKEN_KEYS = ["authToken", "access_token", "token"];
let inMemoryToken = "";

/** Tarayıcıdan (ve varsa bellekten) token’ı getirir */
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

/** Manuel token set (örn. login sonrası hafızaya almak için) */
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
  baseURL: API_BASE,
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

/** Mutlak API URL üretme yardımcıları */
export function apiUrl(path = "") {
  const p = String(path || "");
  return p.startsWith("http") ? p : `${API_BASE}/${p.replace(/^\/+/, "")}`;
}
