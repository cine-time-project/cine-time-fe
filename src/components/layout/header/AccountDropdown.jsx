"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavDropdown } from "react-bootstrap";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocalStorageUser } from "./useLocalStorageUser";

/* helpers */
const norm = (arr = []) =>
  (arr || []).map(r => String(r).toUpperCase().trim().replace(/^ROLE_/, "")).filter(Boolean);
function readRolesFromCookie() {
  try {
    const m = document.cookie.match(/(?:^|;\s*)authRoles=([^;]+)/);
    return m ? decodeURIComponent(m[1]).split(/[\s,]+/) : [];
  } catch { return []; }
}
function getAllRoles(pref) {
  if (pref?.length) return norm(pref);
  try { const v = localStorage.getItem("roles"); if (v) return norm(JSON.parse(v)); } catch {}
  return norm(readRolesFromCookie());
}
const isStaff = (roles = []) => {
  const have = new Set(norm(roles));
  return have.has("ADMIN") || have.has("EMPLOYEE");
};

export default function AccountDropdown({ L, tNav }) {
  const { logout, roles: ctxRoles = [] } = useAuth();
  const roles = getAllRoles(ctxRoles);
  const user = useLocalStorageUser();
  const pathname = usePathname() || "";

  // locale'den bağımsız, /xx/admin ile başlayan tüm path'lerde true
  const inAdmin = /^\/[^/]+\/admin(\/|$)/.test(pathname);

  const handleTitleClick = (e) => {
    // Sadece admin alanındayken ve staff ise: offcanvas aç, dropdown'ı engelle
    if (inAdmin && isStaff(roles)) {
      e.preventDefault();
      e.stopPropagation();
      // Açılmasını istiyorsan 'open', toggle istiyorsan 'toggle' yayınla
      window.dispatchEvent(new Event("admin-sidebar-toggle"));
      // alternatif: window.dispatchEvent(new Event("admin-sidebar-open"));
    }
    // admin alanında değilsek hiçbir şey yapma → NavDropdown kendi kendine açılır
  };

  return (
    <NavDropdown
      id="user-dropdown"
      align="end"
      title={
        <span className="account-title" onClick={handleTitleClick}>
          <svg className="account-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
            <path d="M12 2a5 5 0 1 0 5 5 5.006 5.006 0 0 0-5-5Zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3Z"/>
            <path d="M12 13a9 9 0 0 0-9 9 1 1 0 0 0 1 1h16a1 1 0 0 0 1-1 9 9 0 0 0-9-9Zm-6.93 8a7 7 0 0 1 13.86 0Z"/>
          </svg>{" "}
          {user?.name || tNav("account")}
        </span>
      }
    >
      {!user ? (
        <>
          <NavDropdown.Item as={Link} href={L("login")}>{tNav("login")}</NavDropdown.Item>
        </> 
      ) : (
        <>
          <NavDropdown.Item as={Link} href={L("account")}>Profil</NavDropdown.Item>
          <NavDropdown.Item as={Link} href={L("mytickets")}>{tNav("myTickets")}</NavDropdown.Item>

          {isStaff(roles) && (
            <>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} href={L("/dashboard")}>Dashboard</NavDropdown.Item>
            </>
          )}

          <NavDropdown.Divider />
          <NavDropdown.Item
            onClick={async () => {
              try { await logout(); } finally { window.location.replace(L("")); }
            }}
          >
            {tNav("logout")}
          </NavDropdown.Item>
        </>
      )}
    </NavDropdown>
  );
}
