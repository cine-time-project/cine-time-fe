"use client";
import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "@/services/auth-service";
import { config } from "@/helpers/config";
import {
  hydrateFavoritesForToken,
  clearFavoriteCaches,
} from "@/lib/hooks/favorites-hydrate";

const AuthContext = createContext();

/* ------------ helpers ------------- */
const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
const cookieBase = `Path=/; SameSite=Lax${isHttps ? "; Secure" : ""}`;

function setCookie(name, value, maxAgeSeconds) {
  const ttl = typeof maxAgeSeconds === "number" ? `; Max-Age=${maxAgeSeconds}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieBase}${ttl}`;
}
function deleteCookie(name) {
  document.cookie = `${name}=; ${cookieBase}; Max-Age=0`;
}

// Roller çeşitli formatlarda gelebilir
function normalizeRoles(raw) {
  if (!raw) return [];
  let list = raw;
  if (typeof list === "string") list = list.split(/[\s,]+/);
  if (Array.isArray(list)) {
    return list
      .map(r => (typeof r === "object" ? (r.role || r.roleName || r.name) : r))
      .filter(Boolean)
      .map(r => String(r).toUpperCase())
      .map(r => (r.startsWith("ROLE_") ? r.slice(5) : r)) // ROLE_ADMIN -> ADMIN
      .map(r => (r === "USER" ? "MEMBER" : r));           // USER -> MEMBER eşleme
  }
  return [];
}

function decodeJwtPayload(token) {
  try {
    const p = token.split(".")[1];
    const base64 = p.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "="));
    return JSON.parse(json);
  } catch {
    return {};
  }
}

/* ------------- provider ------------- */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Mount: UI için user'ı localStorage'dan yükle
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Ortak persist: cookie + localStorage + state
  function persistAuth({ user, token, remember = true }) {
    const rolesFromUser = normalizeRoles(user?.roles || user?.authorities);
    const payload = decodeJwtPayload(token);
    const rolesFromJwt = normalizeRoles(
      payload?.roles || payload?.authorities || payload?.role || payload?.scopes || payload?.scope
    );
    const roles = rolesFromUser.length ? rolesFromUser : rolesFromJwt;

    // 1) Cookies → middleware bunları okur
    const maxAge = remember ? 60 * 60 * 24 * 7 : undefined; // 7 gün
    setCookie("authToken", token, maxAge);
    if (roles.length) setCookie("authRoles", roles.join(","), maxAge);

    // 2) UI için localStorage
    localStorage.setItem("authUser", JSON.stringify(user));
    localStorage.setItem("authToken", token);

    // 3) state
    setUser({ ...user, roles, token });

    // olaylar & favoriler
    document.dispatchEvent(new Event("auth-change"));
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
    const response = await fetch(`${config.apiURL}/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Google login failed");

    const token = data?.returnBody?.token;
    const user = data?.returnBody?.user || data?.returnBody;
    if (!token || !user) throw new Error("Missing token/user from Google backend");

    persistAuth({ user, token, remember: true });
    return { user, token };
  };

  const logout = () => {
    authService.logout(); // localStorage temizler
    deleteCookie("authToken");
    deleteCookie("authRoles");
    setUser(null);
    document.dispatchEvent(new Event("auth-change"));
    clearFavoriteCaches();
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
