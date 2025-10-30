"use client";

import { useEffect, useState } from "react";

/* ---------------------- Helpers ---------------------- */

/**
 * Decode JWT payload (base64url -> JSON)
 * @param {string} token JWT token
 * @returns {object|null} decoded payload
 */
function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;

    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(
      base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=")
    );
    return JSON.parse(json || "{}");
  } catch {
    return null;
  }
}

/**
 * Read a cookie value by name
 * @param {string} name cookie name
 * @returns {string|null} cookie value
 */
function getCookie(name) {
  const m = document.cookie.match(
    new RegExp("(?:^|; )" + name + "=([^;]*)")
  );
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * Normalize roles to uppercase and standardize common mappings
 * @param {string|string[]} raw raw role(s)
 * @returns {string[]} normalized roles
 */
function normalizeRoles(raw) {
  if (!raw) return [];
  let list = typeof raw === "string" ? raw.split(/[\s,]+/) : raw;
  return list
    .map((r) => (typeof r === "object" ? r.role || r.roleName || r.name : r))
    .filter(Boolean)
    .map((r) => String(r).toUpperCase())
    .map((r) => (r.startsWith("ROLE_") ? r.slice(5) : r)) // ROLE_ADMIN -> ADMIN
    .map((r) => (r === "USER" ? "MEMBER" : r)); // USER -> MEMBER
}

/* ---------------------- useAuth Hook ---------------------- */

/**
 * Custom hook to read current authenticated user, their roles, token, and loading state.
 * Reacts to changes in localStorage or auth-change events (cross-tab safe).
 *
 * @returns {object} { user, roles, token, loading }
 */
export function useAuth() {
  const [state, setState] = useState({
    user: null,
    roles: [],
    token: null,
    loading: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return; // SSR safe

    /**
     * Function to update state from localStorage, cookies, or JWT
     */
    const updateState = () => {
      let user = null;
      let roles = [];
      let token = null;

      // 1) Attempt to read user from localStorage
      try {
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
          user = JSON.parse(storedUser);
          token = user.token || null;
          if (user.roles) roles = normalizeRoles(user.roles);
        }
      } catch {
        user = null;
        roles = [];
        token = null;
      }

      // 2) Check authRoles cookie (takes priority over localStorage roles)
      const rawRoles = getCookie("authRoles");
      if (rawRoles) {
        roles = normalizeRoles(rawRoles);
      } else if (token) {
        // 3) Fallback: decode roles from JWT
        const payload = decodeJwtPayload(token);
        const r =
          payload?.roles ||
          payload?.authorities ||
          payload?.role ||
          payload?.scopes ||
          payload?.scope;
        roles = normalizeRoles(r);
      }

      // Update hook state
      setState({ user, roles, token, loading: false });
    };

    // Initial load
    updateState();

    // Listen for cross-tab or programmatic auth changes
    window.addEventListener("storage", updateState);
    document.addEventListener("auth-change", updateState);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("storage", updateState);
      document.removeEventListener("auth-change", updateState);
    };
  }, []);

  return state; // { user, roles, token, loading }
}
