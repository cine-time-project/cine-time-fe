"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Offcanvas } from "react-bootstrap";

export default function AdminShell({ children, locale }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onToggle = () => setShow((s) => !s);
    window.addEventListener("admin-sidebar-toggle", onToggle);
    return () => window.removeEventListener("admin-sidebar-toggle", onToggle);
  }, []);

  useEffect(() => { setShow(false); }, [pathname]);

  return (
    <>
      <Offcanvas
        show={show}
        onHide={() => setShow(false)}
        placement="start"                          // ← SOL
        className="admin-offcanvas offcanvas-start"// ← YÖNÜ SINIFLA DA SABİTLE
        backdrop
        scroll
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Admin</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="pt-2">
          {/* ... AdminSidebar ... */}
        </Offcanvas.Body>
      </Offcanvas>

      {children}
    </>
  );
}
