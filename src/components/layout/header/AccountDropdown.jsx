"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";
import { NavDropdown } from "react-bootstrap";

export default function AccountDropdown({ L, tNav }) {
  // --- AUTH CONTEXT ---
  // We consume the AuthProvider context to get the current user and logout function
  const { user, logout } = useAuth();

  return (
    <NavDropdown
      title={
        <span className="account-title">
          <svg
            className="account-icon"
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 24 24"
          >
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
          {/* If user is not logged in, show login/register */}
          <NavDropdown.Item as={Link} href={L("login")}>
            {tNav("login")}
          </NavDropdown.Item>
          <NavDropdown.Item as={Link} href={L("register")}>
            {tNav("register")}
          </NavDropdown.Item>
        </>
      ) : (
        <>
          {/* If user is logged in, show user-related links */}
          <NavDropdown.Item as={Link} href={L("mytickets")}>
            {tNav("myTickets")}
          </NavDropdown.Item>
          <NavDropdown.Divider />
          {/* Logout triggers AuthProvider's logout */}
          <NavDropdown.Item
            onClick={() => {
              logout();
            }}
          >
            {tNav("logout")}
          </NavDropdown.Item>
        </>
      )}
    </NavDropdown>
  );
}
