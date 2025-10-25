// örn: src/components/layout/NavbarUserMenu.jsx
"use client";
import { useSidebar } from "@/lib/ui/sidebar-context";

export default function NavbarUserMenu({ roleLabel = "Admin" }) {
  const { toggle } = useSidebar();

  return (
    <button
      type="button"
      className="btn btn-link text-decoration-none text-light d-inline-flex align-items-center gap-2"
      onClick={toggle}
      aria-label="Open admin menu"
    >
      <i className="bi bi-person"></i>
      {roleLabel}
      <span className="ms-1">▾</span>
    </button>
  );
}
