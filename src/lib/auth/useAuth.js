"use client";

import { useEffect, useState } from "react";

/* ---------------------- Helpers ---------------------- */

// Decode JWT payload (base64url -> JSON)
function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;

    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="));
    return JSON.parse(json || "{}");
  } catch {
    return null;
  }
}

// Read a cookie value by name
function getCookie(name) {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

// Normalize roles to uppercase and standardize common mappings
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
 * Custom hook to read current authenticated user, their roles, and loading state.
 * Reacts to changes in localStorage or auth-change events (cross-tab safe).
 */
export function useAuth() {
  const [state, setState] = useState({ user: null, roles: [], loading: true });

  useEffect(() => {
    if (typeof window === "undefined") return; // SSR safe

    // Function to update state from localStorage and cookies/JWT
    const updateState = () => {
      let user = null;
      let roles = [];

      // 1) Attempt to read user from localStorage
      try {
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
          user = JSON.parse(storedUser);
          if (user.roles) roles = normalizeRoles(user.roles);
        }
      } catch {
        user = null;
        roles = [];
      }

      // 2) Check authRoles cookie (takes priority over localStorage roles)
      const rawRoles = getCookie("authRoles");
      if (rawRoles) {
        roles = normalizeRoles(rawRoles);
      } else if (user?.token) {
        // 3) Fallback: decode roles from JWT
        const payload = decodeJwtPayload(user.token);
        const r = payload?.roles || payload?.authorities || payload?.role || payload?.scopes || payload?.scope;
        roles = normalizeRoles(r);
      }

      setState({ user, roles, loading: false });
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

  return state; // { user, roles, loading }
}
