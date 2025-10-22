// middleware.js (KÖKTE)
import createMiddleware from "next-intl/middleware";
import intlConfig from "./next-intl.config.mjs";
import { NextResponse } from "next/server";
import { config as appConfig } from "./src/helpers/config";

// i18n middleware (locale ekleme vb.)
const i18n = createMiddleware(intlConfig);

/* ---------------- helpers ---------------- */
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

function getAuthFromRequest(req) {
  // Cookie'larda roller
  const rawRoles = req.cookies.get("authRoles")?.value;
  let roles = [];
  if (rawRoles) {
    roles = rawRoles.split(/[\s,]+/).map((s) => s.trim().toUpperCase()).filter(Boolean);
  }

  // JWT varsa ondan da “authenticated” say
  const jwt = req.cookies.get("authToken")?.value || req.cookies.get("token")?.value;
  const authedByJwt = !!jwt;

  // JWT içinden rolleri de normalize etmeyi dene (fallback)
  if (!roles.length && jwt) {
    const p = decodeJwtPayload(jwt) || {};
    const r = p.roles || p.authorities || p.role || p.scopes || p.scope;
    if (Array.isArray(r)) roles = r.map((x) => String(x).toUpperCase());
    else if (typeof r === "string") roles = r.split(/[\s,]+/).map((s) => s.trim().toUpperCase());
  }

  const isAuthenticated = roles.length > 0 || authedByJwt;
  return { roles, isAuthenticated };
}

function canAccessPath(pathname, roles) {
  const rules = appConfig.userRightsOnRoutes || [];
  // İlgili kuralı bul
  const rule = rules.find((r) => r?.urlRegex instanceof RegExp && r.urlRegex.test(pathname));

  if (rule) {
    return rule.roles.some((need) => roles.includes(String(need).toUpperCase()));
  }

  // ---- DENEY-BY-DEFAULT ----
  // Admin alanında kural yoksa REDDET.
  const isAdmin = /^\/(tr|en|de|fr)\/admin(\/.*)?$/.test(pathname);
  return !isAdmin;
}

/* ---------------- main middleware ---------------- */
export default function middleware(req) {
  // 1) i18n işlemleri
  const res = i18n(req);

  const { pathname } = req.nextUrl;
  const isAdminPath = /^\/(tr|en|de|fr)\/admin(\/.*)?$/.test(pathname);
  if (!isAdminPath) return res; // Sadece admin alanını koruyoruz

  const { roles, isAuthenticated } = getAuthFromRequest(req);

  if (!canAccessPath(pathname, roles)) {
    const url = req.nextUrl.clone();
    const locale = pathname.split("/")[1] || "tr";

    if (!isAuthenticated) {
      // Giriş yoksa → login'e
      url.pathname = `/${locale}/login`;
      url.searchParams.set("redirect", pathname);
    } else {
      // Giriş var ama rol yetersiz → account'a
      url.pathname = `/${locale}/account`;
      url.searchParams.set("denied", "1");
    }

    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/", "/(tr|en|de|fr)/:path*"],
};
