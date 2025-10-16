
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL; // örn: http://localhost:8090/api

// Tarayıcıdan token'ı oku (login hangi key'i yazdıysa onu bulur)
const TOKEN_KEYS = ["authToken", "access_token", "token"];

export function getToken() {
  if (typeof window === "undefined") return "";
  for (const k of TOKEN_KEYS) {
    const v = localStorage.getItem(k);
    if (v && String(v).trim()) return String(v).trim();
  }
  return "";
}


export function authHeaders(extra = {}) {
  const token = getToken();
  const base = token ? { Authorization: `Bearer ${token}` } : {};
  return { ...base, ...extra };
}

/**
 * Axios config döndürür: { headers: { Authorization: ... } }
 * Yeni yazacağınız servislerde BUNU kullanın:
 *   axios.get(url, axiosAuth())
 *   axios.post(url, data, axiosAuth())
 */
export function axiosAuth(extra = {}) {
  return { headers: authHeaders(extra) };
}

// İsteğe bağlı: hızlı kontrol
export function isLoggedIn() {
  return !!getToken();
}
