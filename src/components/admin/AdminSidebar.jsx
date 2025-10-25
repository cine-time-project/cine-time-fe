"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListGroup } from "react-bootstrap";
import { useAuth } from "@/components/providers/AuthProvider";
import { ADMIN_TILES, filterTilesByRoles, ICONS } from "@/helpers/data/admin-tiles";

export default function AdminSidebar({ locale, onNavigate }) {
  const pathname = usePathname();
  const { roles = [], logout } = useAuth();

  const tiles = filterTilesByRoles(ADMIN_TILES, roles);
  const L = (p = "") => `/${locale}/${p.replace(/^\/+/, "")}`;

  const Item = ({ href, icon, children }) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    const Icon = icon || ICONS.default;
    return (
      <ListGroup.Item
        as={Link}
        href={href}
        onClick={onNavigate}
        className={`d-flex align-items-center gap-2 ${active ? "active" : ""}`}
        action
      >
        <Icon />
        <span>{children}</span>
      </ListGroup.Item>
    );
  };

  return (
    <nav>
      <ListGroup variant="flush" className="mb-3">
        {/* EN BAŞA DASHBOARD */}
        <Item href={L("admin/dashboard")} icon={ICONS.reports}>Dashboard</Item>

        {tiles.map((t) => (
          <Item key={t.key} href={L(t.href)} icon={ICONS[t.key]}>
            {t.title}
          </Item>
        ))}

        {/* EN SONA LOGOUT */}
        <ListGroup.Item
          action
          className="d-flex align-items-center gap-2 text-danger mt-2"
          onClick={async () => {
            try { await logout(); } finally { window.location.replace(L("")); }
          }}
        >
          {/* basit bir çıkış ikonu */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Logout</span>
        </ListGroup.Item>
      </ListGroup>
    </nav>
  );
}
