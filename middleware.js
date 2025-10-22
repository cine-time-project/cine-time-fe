// middleware.js (KÖKTE)
import createMiddleware from "next-intl/middleware";
import intlConfig from "./next-intl.config.mjs";
import { NextResponse } from "next/server";
import { config as appConfig } from "./src/helpers/config";

// i18n middleware’ı çağıracağız ama üstüne rol guard ekleyeceğiz
const i18n = createMiddleware(intlConfig);

// ---- yardımcılar ----
function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "="));
    return JSON.parse(json);
  } catch { return null; }
}

function getRolesFromRequest(req) {
  // 1) client set cookie: authRoles = "ADMIN,EMPLOYEE"
  const raw = req.cookies.get("authRoles")?.value;
  if (raw) {
    return raw.split(/[\s,]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
  }

  // 2) JWT cookie varsa ordan
  const jwt = req.cookies.get("authToken")?.value || req.cookies.get("token")?.value;
  if (jwt) {
    const p = decodeJwtPayload(jwt) || {};
    const roles = p.roles || p.authorities || p.role || p.scopes || p.scope;
    if (Array.isArray(roles)) return roles.map(r => String(r).toUpperCase());
    if (typeof roles === "string") return roles.split(/[\s,]+/).map(s => s.trim().toUpperCase());
  }
  return [];
}

function canAccessPath(pathname, roles) {
  const rules = appConfig.userRightsOnRoutes || [];

  // İlgili kuralı bul
  const rule = rules.find(r => r?.urlRegex instanceof RegExp && r.urlRegex.test(pathname));

  if (rule) {
    return rule.roles.some(need => roles.includes(String(need).toUpperCase()));
  }

  // ---- DENEY-BY-DEFAULT ----
  // Admin alanında kural yoksa, REDDET.
  const isAdmin = /^\/(tr|en|de|fr)\/admin(\/.*)?$/.test(pathname);
  return !isAdmin;
}

// ---- asıl middleware ----
export default function middleware(req) {
  const res = i18n(req); // locale ekleme vb.

  const { pathname } = req.nextUrl;

  // Sadece admin yollarını koru (public’i bozmayalım)
  const isAdmin = /^\/(tr|en|de|fr)\/admin(\/.*)?$/.test(pathname);
  if (!isAdmin) return res;

  const roles = getRolesFromRequest(req);

  if (!canAccessPath(pathname, roles)) {
    const url = req.nextUrl.clone();
    const locale = pathname.split("/")[1] || "tr";
    // oturum varsa ama rol yetmezse admin listeye/ya da account’a yönlendir
    url.pathname = `/${locale}/account`;
    url.searchParams.set("denied", "1");
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/", "/(tr|en|de|fr)/:path*"],
};
