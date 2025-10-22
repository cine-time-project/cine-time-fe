"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/lib/auth/useAuth";
import styles from "@/styles/dashboard.module.scss";

const TILES = [
  // Admin-only
  { key: "cinemas",   title: "Cinemas",        desc: "Şubeler ve salon eşleştirmeleri", href: "/admin/cinemas",        roles: ["ADMIN"] },
  { key: "halls",     title: "Halls",          desc: "Salon planları, koltuk şablonları", href: "/admin/halls",        roles: ["ADMIN"] },
  { key: "times",     title: "Showtimes",      desc: "Seans planlama ve takvim",        href: "/admin/showtimes",      roles: ["ADMIN"] },
  { key: "images",    title: "Images",         desc: "Afiş ve görsel yönetimi",         href: "/admin/images",         roles: ["ADMIN"] },
  { key: "cinemaimg", title: "Cinema Images",  desc: "Sinema resimleri yönetimi",       href: "/admin/cinema-images",  roles: ["ADMIN"] },

  // Admin & Employee
  { key: "movies",  title: "Movies",           desc: "Filmler ve içerik listesi",       href: "/admin/movies",         roles: ["ADMIN","EMPLOYEE"] },
  { key: "users",   title: "Users",            desc: "Kullanıcı arama ve yönetim",      href: "/admin/users",          roles: ["ADMIN","EMPLOYEE"] },
  { key: "tickets", title: "Tickets (Admin)",  desc: "Satışlar ve bilet işlemleri",     href: "/admin/tickets",        roles: ["ADMIN","EMPLOYEE"] },
  { key: "cities",  title: "Cities",           desc: "Şehir / bölge listeleri",         href: "/admin/cities",         roles: ["ADMIN","EMPLOYEE"] },
  { key: "vip",     title: "Special Halls",    desc: "VIP / özel salon tipleri",        href: "/admin/special-halls",  roles: ["ADMIN","EMPLOYEE"] },
  { key: "contact", title: "Contact Messages", desc: "İletişim kutusu mesajları",       href: "/admin/contact-messages", roles: ["ADMIN","EMPLOYEE"] },
  { key: "reports", title: "Reports",          desc: "Özetler ve performans raporları", href: "/admin/reports",        roles: ["ADMIN","EMPLOYEE"] },
];

function hasAnyRole(userRoles = [], allowed = []) {
  if (!allowed?.length) return true;
  const set = new Set(userRoles);
  return allowed.some(r => set.has(r));
}

function Icon({ name }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "movies":    return (<svg {...common}><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M7 4v4M12 4v4M17 4v4"/></svg>);
    case "cinemas":   return (<svg {...common}><path d="M3 20h18"/><path d="M6 20V8l6-3 6 3v12"/></svg>);
    case "halls":     return (<svg {...common}><rect x="3" y="8" width="18" height="10" rx="2"/><path d="M7 8v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2"/></svg>);
    case "times":     return (<svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>);
    case "tickets":   return (<svg {...common}><path d="M3 8h18v8H3z"/><path d="M7 8v8M17 8v8"/></svg>);
    case "cities":    return (<svg {...common}><path d="M3 21h18"/><path d="M4 21v-7l4-2 4 2v7"/><path d="M12 21v-10l4-2 4 2v10"/></svg>);
    case "images":    return (<svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 15l-5-5-4 4-3-3-5 5"/></svg>);
    case "vip":       return (<svg {...common}><path d="M3 11h18"/><path d="M5 11V7h14v4"/><path d="M7 15h10l-2 4H9l-2-4z"/></svg>);
    case "contact":   return (<svg {...common}><path d="M3 8l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="2"/></svg>);
    case "reports":   return (<svg {...common}><path d="M3 3h18v18H3z"/><path d="M7 13l3 3 7-7"/></svg>);
    case "users":     return (<svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
    case "cinemaimg": return (<svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="11" r="1.5"/><path d="M21 16l-5-5-4 4-3-3-5 5"/><path d="M6 5V3M10 5V3M14 5V3M18 5V3"/></svg>);
    default:          return (<svg {...common}><circle cx="12" cy="12" r="9"/></svg>);
  }
}

export default function DashboardClient({ locale }) {
  const { roles = [], loading } = useAuth();

  const tiles = useMemo(
    () => TILES.map(t => ({
      ...t,
      href: `/${locale}${t.href}`,
      allowed: hasAnyRole(roles, t.roles),
    })),
    [roles, locale]
  );

  if (loading) return null;
  const visible = tiles.filter(t => t.allowed);

  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>Dashboard</h1>
      <div className={styles.grid}>
        {visible.map(t => (
          <Link key={t.key} href={t.href} className={styles.card}>
            <div className={styles.iconWrap}><Icon name={t.key} /></div>
            <div className={styles.meta}>
              <div className={styles.cardTitle}>{t.title}</div>
              <div className={styles.cardDesc}>{t.desc}</div>
            </div>
            <div className={styles.chevron} aria-hidden="true">›</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
