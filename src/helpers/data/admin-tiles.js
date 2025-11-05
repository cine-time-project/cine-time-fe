// ---- rollere göre süzme ----
export function filterTilesByRoles(roles = []) {
  const have = new Set(
    (roles || []).map(r => String(r).toUpperCase().trim().replace(/^ROLE_/, ""))
  );
  return ADMIN_TILES.filter(t => {
    if (!t.roles || t.roles.length === 0) return true;
    return t.roles.some(r => have.has(String(r).toUpperCase()));
  });
}

// ---- ikonlar ----
function base(props) {
  return {
    width: 22, height: 22, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: 2,
    strokeLinecap: "round", strokeLinejoin: "round",
    ...props
  };
}
export const ICONS = {
  movies:  (p) => (<svg {...base(p)}><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 4v4M12 4v4M17 4v4"/></svg>),
  cinemas: (p) => (<svg {...base(p)}><path d="M3 20h18"/><path d="M6 20V8l6-3 6 3v12"/></svg>),
  halls:   (p) => (<svg {...base(p)}><rect x="3" y="8" width="18" height="10" rx="2"/><path d="M7 8v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/></svg>),
  times:   (p) => (<svg {...base(p)}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>),
  tickets: (p) => (<svg {...base(p)}><path d="M3 8h18v8H3z"/><path d="M7 8v8M17 8v8"/></svg>),
  cities:  (p) => (<svg {...base(p)}><path d="M3 21h18"/><path d="M4 21v-7l4-2 4 2v7"/><path d="M12 21v-10l4-2 4 2v10"/></svg>),
  images:  (p) => (<svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 15l-5-5-4 4-3-3-5 5"/></svg>),
  vip:     (p) => (<svg {...base(p)}><path d="M3 11h18"/><path d="M5 11V7h14v4"/><path d="M7 15h10l-2 4H9l-2-4z"/></svg>),
  contact: (p) => (<svg {...base(p)}><path d="M3 8l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="2"/></svg>),
  reports: (p) => (<svg {...base(p)}><path d="M3 3h18v18H3z"/><path d="M7 13l3 3 7-7"/></svg>),
  users:   (p) => (<svg {...base(p)}><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  cinemaimg:(p)=> (<svg {...base(p)}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="11" r="1.5"/><path d="M21 16l-5-5-4 4-3-3-5 5"/><path d="M6 5V3M10 5V3M14 5V3M18 5V3"/></svg>),
  default: (p) => (<svg {...base(p)}><circle cx="12" cy="12" r="9"/></svg>),
  locations: (p) => ( <svg {...base(p)}><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/></svg>),
  districts: (p) => (<svg {...base(p)}><rect x="3" y="7" width="8" height="8" rx="1"/><rect x="13" y="7" width="8" height="8" rx="1"/><path d="M17 21l-2-3a3 3 0 1 1 6 0l-2 3z"/></svg>),
  payments: (p) => ( <svg {...base(p)}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></svg>),
  favorites: (p) => (<svg {...base(p)}><path d="M20.8 6.6a5.5 5.5 0 0 0-7.8 0L12 7.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l8.8 8.1 8.8-8.1a5.5 5.5 0 0 0 0-7.8z"/></svg>),
  roles: (p) => ( <svg {...base(p)}><path d="M12 3l7 4v5c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V7l7-4z"/><path d="M9.5 12l1.5 1.5L15 9.5"/></svg>),

  default: (p) => (<svg {...base(p)}><circle cx="12" cy="12" r="9"/></svg>)
};


// ---- MENÜ: (Dashboard tiles ile aynı kaynak) ----
// NOT: Dashboard/Logout YOK. (Offcanvas ekliyor.)
export const ADMIN_TILES = [
  { key: "cinemas",   title: "Cinemas",        desc: "Şubeler ve salon eşleştirmeleri", href: "/admin/cinemas",        roles: ["ADMIN","EMPLOYEE"] },
  { key: "halls",     title: "Halls",          desc: "Salon planları, koltuk şablonları", href: "/admin/halls",       roles: ["ADMIN","EMPLOYEE"] },
  { key: "times",     title: "Showtimes",      desc: "Seans planlama ve takvim",        href: "/admin/showtimes",     roles: ["ADMIN","EMPLOYEE"] },
  { key: "images",    title: "Images",         desc: "Afiş ve görsel yönetimi",         href: "/admin/images",        roles: ["ADMIN","EMPLOYEE"] },
  { key: "cinemaimg", title: "Cinema Images",  desc: "Sinema resimleri yönetimi",       href: "/admin/cinema-images", roles: ["ADMIN","EMPLOYEE"] },

  { key: "movies",    title: "Movies",         desc: "Filmler ve içerik listesi",       href: "/admin/movies",        roles: ["ADMIN","EMPLOYEE"] },
  { key: "users",     title: "Users",          desc: "Kullanıcı arama ve yönetim",      href: "/admin/users",         roles: ["ADMIN","EMPLOYEE"] },
  { key: "tickets",   title: "Tickets (Admin)",desc: "Satışlar ve bilet işlemleri",     href: "/admin/tickets",       roles: ["ADMIN","EMPLOYEE"] },
  
  { key: "vip",       title: "Special Halls",  desc: "VIP / özel salon tipleri",        href: "/admin/special-halls", roles: ["ADMIN","EMPLOYEE"] },
  { key: "contact",   title: "Contact Messages", desc: "İletişim kutusu mesajları",     href: "/admin/contact-messages", roles: ["ADMIN","EMPLOYEE"] },
  { key: "reports",   title: "Reports",        desc: "Özetler ve performans raporları", href: "/admin/reports",       roles: ["ADMIN","EMPLOYEE"] },
  { key: "locations", title: "Locations",      desc: "Locations",                       href: "/admin/location",       roles:["ADMIN","EMPLOYEE"] },
 
{ key: "payments",    title: "Payments",       desc: "Ödeme kayıtları",                 href: "/admin/payments",         roles:["ADMIN","EMPLOYEE"] },
{ key: "favorites",   title: "Favorites",      desc: "Favori kayıtları",                href: "/admin/favorites",        roles:["ADMIN","EMPLOYEE"] },
{ key: "roles",       title: "Roles",          desc: "Rol ve yetkiler",                 href: "/admin/roles",            roles:["ADMIN","EMPLOYEE"] }

];
