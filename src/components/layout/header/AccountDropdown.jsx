"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { NavDropdown } from "react-bootstrap";
import { useLocalStorageUser } from "./useLocalStorageUser";

/* ---- helpers ---- */
const norm = (arr = []) =>
  arr.map((r) => String(r).toUpperCase().trim().replace(/^ROLE_/, "")).filter(Boolean);

function readRolesFromCookie() {
  try {
    const m = document.cookie.match(/(?:^|;\s*)authRoles=([^;]+)/);
    if (!m) return [];
    return decodeURIComponent(m[1]).split(/[\s,]+/);
  } catch {
    return [];
  }
}
function getAllRoles(prefRoles) {
  if (prefRoles?.length) return norm(prefRoles);
  const fromLS = (() => {
    try {
      const v = localStorage.getItem("roles");
      return v ? JSON.parse(v) : [];
    } catch { return []; }
  })();
  if (fromLS.length) return norm(fromLS);
  return norm(readRolesFromCookie());
}
const isStaff = (roles=[]) => {
  const have = new Set(norm(roles));
  return have.has("ADMIN") || have.has("EMPLOYEE");
};
/* --------------- */

export default function AccountDropdown({ L, tNav }) {
  const { logout, roles: ctxRoles = [] } = useAuth();
  const roles = getAllRoles(ctxRoles);               
  const user = useLocalStorageUser();

  return (
    <NavDropdown
      title={
        <span className="account-title">
          <svg className="account-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24">
            <path d="M12 2a5 5 0 1 0 5 5 5.006 5.006 0 0 0-5-5Zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3Z" />
            <path d="M12 13a9 9 0 0 0-9 9 1 1 0 0 0 1 1h16a1 1 0 0 0 1-1 9 9 0 0 0-9-9Zm-6.93 8a7 7 0 0 1 13.86 0Z" />
          </svg>{" "}
          {user?.name || tNav("account")}
        </span>
      }
      id="user-dropdown"
      align="end"
    >
      {!user ? (
        <>
          <NavDropdown.Item as={Link} href={L("login")}>
            {tNav("login")}
          </NavDropdown.Item>
          <NavDropdown.Item as={Link} href={L("register")}>
            {tNav("register")}
          </NavDropdown.Item>
        </>
      ) : (
        <>
          <NavDropdown.Item as={Link} href={L("account")}>
            Profil
          </NavDropdown.Item>

          <NavDropdown.Item as={Link} href={L("mytickets")}>
            {tNav("myTickets")}
          </NavDropdown.Item>

          {isStaff(roles) && (
            <>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} href={L("/dashboard")}>
                Dashboard
              </NavDropdown.Item>
            </>
          )}

          <NavDropdown.Divider />
          <NavDropdown.Item
            onClick={async () => {
              try { await logout(); }
              finally { window.location.replace(L("")); } // home
            }}
          >
            {tNav("logout")}
          </NavDropdown.Item>
        </>
      )}
    </NavDropdown>
  );
}
