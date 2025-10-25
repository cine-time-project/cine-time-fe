"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Offcanvas } from "react-bootstrap";
import { ADMIN_TILES, ICONS } from "@/helpers/data/admin-tiles";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AdminShell({ children, locale = "tr" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  // Header’daki Account başlığına tıklanınca tetiklenen event
  useEffect(() => {
    const handler = () => setOpen((v) => !v);
    window.addEventListener("admin-sidebar-toggle", handler);
    return () => window.removeEventListener("admin-sidebar-toggle", handler);
  }, []);

  // Tek kaynak (ADMIN_TILES) → locale ile link hazırla
  const coreItems = useMemo(
    () =>
      (ADMIN_TILES || []).map((t) => ({
        ...t,
        href: `/${locale}${t.href}`,
      })),
    [locale]
  );

  // Offcanvas’ta: Dashboard (ilk) + coreItems + Logout (son)
  const items = useMemo(() => {
    const dashboardItem = {
      key: "dashboard-link",
      title: "Dashboard",
      href: `/${locale}/dashboard`,
      icon: ICONS.reports, // function component
      _type: "link",
    };
    const logoutItem = {
      key: "logout",
      title: "Logout",
      className: "text-danger fw-semibold",
      onClick: async () => {
        try {
          await logout();
        } finally {
          window.location.replace(`/${locale}`);
        }
      },
      // Bu bir JSX element (function değil)
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      ),
      _type: "action",
    };
    return [dashboardItem, ...coreItems, logoutItem];
  }, [coreItems, locale, logout]);

  // aktif route
  const isActive = (href) => {
    try {
      const clean = href.replace(/\/+$/, "");
      const path = (pathname || "").replace(/\/+$/, "");
      return path === clean || path.startsWith(clean + "/");
    } catch {
      return false;
    }
  };

  // function component mi element mi? normalize et
  const renderIcon = (I) => (typeof I === "function" ? <I /> : I);

  return (
    <>
      {/* SOLDAN açılan offcanvas */}
      <Offcanvas
        show={open}
        onHide={() => setOpen(false)}
        placement="start"
        className="admin-offcanvas offcanvas-start"
        backdrop
        scroll
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Admin</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <nav className="list-group">
            {items.map((it) => {
              const I = it.icon || ICONS[it.key] || ICONS.default;
              const iconNode = renderIcon(I);

              if (it._type === "action") {
                return (
                  <button
                    key={it.key}
                    type="button"
                    onClick={async () => {
                      await it.onClick?.();
                      setOpen(false);
                    }}
                    className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                      it.className || ""
                    }`}
                  >
                    <span className="text-muted d-inline-flex">{iconNode}</span>
                    <span>{it.title}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={it.key}
                  href={it.href}
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
                    isActive(it.href) ? "active" : ""
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <span className="text-muted d-inline-flex">{iconNode}</span>
                  <span>{it.title}</span>
                </Link>
              );
            })}
          </nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* içerik */}
      <div className="container py-4">{children}</div>
    </>
  );
}
