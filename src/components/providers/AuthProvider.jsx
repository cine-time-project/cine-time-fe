"use client";
import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "@/services/auth-service";
import {
  hydrateFavoritesForToken,
  clearFavoriteCaches,
} from "@/lib/hooks/favorites-hydrate";

const AuthContext = createContext();
export { AuthContext };

/* ------------ helpers ------------- */
const isBrowser = typeof window !== "undefined";
const isHttps = isBrowser && window.location.protocol === "https:";
const cookieBase = `Path=/; SameSite=Lax${isHttps ? "; Secure" : ""}`;

function setCookie(name, value, maxAgeSeconds) {
  if (!isBrowser) return;
  try {
    const ttl =
      typeof maxAgeSeconds === "number" ? `; Max-Age=${maxAgeSeconds}` : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieBase}${ttl}`;
  } catch {}
}
function deleteCookie(name) {
  if (!isBrowser) return;
  try {
    document.cookie = `${name}=; ${cookieBase}; Max-Age=0`;
  } catch {}
}

// Roller çeşitli formatlarda gelebilir
function normalizeRoles(raw) {
  if (!raw) return [];
  let list = raw;
  if (typeof list === "string") list = list.split(/[\s,]+/);
  if (Array.isArray(list)) {
    return list
      .map((r) => (typeof r === "object" ? r.role || r.roleName || r.name : r))
      .filter(Boolean)
      .map((r) => String(r).toUpperCase())
      .map((r) => (r.startsWith("ROLE_") ? r.slice(5) : r)) // ROLE_ADMIN -> ADMIN
      .map((r) => (r === "USER" ? "MEMBER" : r)); // USER -> MEMBER eşleme
  }
  return [];
}

function decodeJwtPayload(token) {
  try {
    const p = token?.split(".")[1];
    if (!p) return {};
    const base64 = p.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="));
    return JSON.parse(json || "{}");
  } catch {
    return {};
  }
}

/* --------- public helpers (redirecti LoginPage yönetsin) --------- */
export function getLandingPath(locale, roles = []) {
  const R = roles.map((r) => String(r).toUpperCase());
  const isStaff = R.includes("ADMIN") || R.includes("EMPLOYEE");
  // İSTEDİĞİN KURAL:
  // Staff -> /{locale}/dashboard, Member -> /{locale}
  return isStaff ? `/${locale}/dashboard` : `/${locale}`;
}

export function sanitizeRedirect(redirect, locale, roles = []) {
  if (!redirect || typeof redirect !== "string") return getLandingPath(locale, roles);
  if (!redirect.startsWith("/")) return getLandingPath(locale, roles); // sadece site içi path
  const adminRe = /^\/(tr|en|de|fr)\/admin(\/.*)?$/i;
  const R = roles.map((r) => String(r).toUpperCase());
  const isStaff = R.includes("ADMIN") || R.includes("EMPLOYEE");
  if (adminRe.test(redirect) && !isStaff) {
    // Member admin path'e dönmesin
    return `/${locale}`;
  }
  return redirect;
}

/* ------------- provider ------------- */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Mount: UI için user'ı localStorage'dan yükle
  useEffect(() => {
    if (!isBrowser) return;
    try {
      const storedUser = localStorage.getItem("authUser");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {}
  }, []);

  // Ortak persist: cookie + localStorage + state (redirect YOK)
  function persistAuth({ user, token, remember = true }) {
    // 1) Roller
    const rolesFromUser = normalizeRoles(user?.roles || user?.authorities);
    const payload = decodeJwtPayload(token);
    const rolesFromJwt = normalizeRoles(
      payload?.roles ||
        payload?.authorities ||
        payload?.role ||
        payload?.scopes ||
        payload?.scope
    );
    const roles = rolesFromUser.length ? rolesFromUser : rolesFromJwt;

    // 2) Cookies (middleware/BE okuyorsa)
    const maxAge = remember ? 60 * 60 * 24 * 7 : undefined; // 7 gün
    if (token) setCookie("authToken", token, maxAge);
    if (roles.length) setCookie("authRoles", roles.join(","), maxAge);

    // 3) UI için localStorage
    try {
      localStorage.setItem("authUser", JSON.stringify(user));
      if (token) localStorage.setItem("authToken", token);
    } catch {}

    // 4) state
    setUser({ ...user, roles, token });

    // 5) olaylar & favoriler
    if (isBrowser) {
      try {
        document.dispatchEvent(new Event("auth-change"));
      } catch {}
    }
  }

  // Normal login
  const login = async (credentials) => {
    const data = await authService.login(credentials); // beklenen: { user, token }
    const authUser = { user: data.user, token: data.token };
    persistAuth({ user: authUser.user, token: authUser.token, remember: true });
    await hydrateFavoritesForToken(authUser.token);
    return authUser;
  };

  // Google login
  const loginWithGoogle = async (idToken) => {
    const data = await authService.googleLogin(idToken);

    // Pre-register senaryosu
    if (data?.httpStatus === "I_AM_A_TEAPOT") {
      return { preRegister: true, user: data.returnBody };
    }

    // Kayıtlı kullanıcı
    const token = data?.returnBody?.token;
    const user = data?.returnBody?.user || data?.returnBody;
    if (!token || !user) throw new Error("Missing token/user from backend");

    persistAuth({ user, token, remember: true });
    await hydrateFavoritesForToken(token);
    return { user, token };
  };

  const logout = () => {
    try {
      authService.logout(); // localStorage temizler
    } catch {}
    deleteCookie("authToken");
    deleteCookie("authRoles");
    setUser(null);
    if (isBrowser) {
      try {
        document.dispatchEvent(new Event("auth-change"));
      } catch {}
    }
    clearFavoriteCaches();
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
