import { config } from "@/helpers/config"; // senin config.js yolun neyse

/**
 * @param {string} pathname - örn: "/tr/admin/movies/new"
 * @param {string[]} roles  - örn: ["EMPLOYEE"]
 */
export function canAccessPath(pathname, roles = []) {
  const r = Array.isArray(roles) ? roles.map(r => String(r).toUpperCase()) : [];

  // 1) Config’ten eşleşen kuralı bul
  const rule = (config.userRightsOnRoutes || []).find(({ urlRegex }) =>
    urlRegex instanceof RegExp ? urlRegex.test(pathname) : false
  );

  // 2) Kural bulunduysa: listedeki rollerden en az biri varsa geç
  if (rule) {
    return rule.roles.some((need) => r.includes(String(need).toUpperCase()));
  }

  // 3) Kural YOKSA:
  //    - admin alanındaysa: DENY (güvenli varsayılan)
  //    - değilse: allow (public sayfalar için)
  const isAdminArea = /^\/(tr|en|de|fr)\/admin(\/.*)?$/.test(pathname);
  return !isAdminArea;
}
