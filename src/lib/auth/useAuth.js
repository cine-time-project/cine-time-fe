"use client";

import { useEffect, useState } from "react";

// JWT base64url -> JSON
function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "="));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Küçük cookie yardımcıları
function getCookie(name) {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

// ---- KULLANACAĞIN HOOK ----
export function useAuth() {
  const [state, setState] = useState({ roles: [], user: null, loading: true });

  useEffect(() => {
    try {
      // 1) Login sonrası set ettiğin roller: authRoles=ADMIN,EMPLOYEE
      const raw = getCookie("authRoles");
      let roles = [];

      if (raw) {
        roles = raw
          .split(/[\s,]+/)
          .map((s) => s.trim().toUpperCase())
          .filter(Boolean);
      } else {
        // 2) JWT içinden oku (claim adı BE'ye göre değişebilir)
        const jwt = getCookie("authToken") || getCookie("token");
        if (jwt) {
          const p = decodeJwtPayload(jwt) || {};
          let r = p.roles || p.authorities || p.role || p.scopes || p.scope;
          if (Array.isArray(r)) roles = r.map((x) => String(x).toUpperCase());
          else if (typeof r === "string")
            roles = r.split(/[\s,]+/).map((s) => s.trim().toUpperCase());
        }
      }

      setState({ roles, user: null, loading: false });
    } catch {
      setState({ roles: [], user: null, loading: false });
    }
  }, []);

  return state; // { roles, user, loading }
}
