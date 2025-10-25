"use client";

import Link from "next/link";
import { Offcanvas, ListGroup } from "react-bootstrap";
import { filterTilesByRoles, ICONS } from "@/helpers/data/admin-tiles";
import { useSidebar } from "@/lib/ui/sidebar-context";

export default function AdminOffcanvas({ locale, roles = [] }) {
  const { open, hide } = useSidebar();
  const tiles = filterTilesByRoles(roles);

  return (
    <Offcanvas show={open} onHide={hide} placement="start" backdrop aria-labelledby="admin-menu">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title id="admin-menu">Admin</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <ListGroup variant="flush">
          {tiles.map((t) => {
            const Icon = ICONS[t.key] || ICONS.default;
            return (
              <ListGroup.Item key={t.key} className="py-3">
                <Link
                  href={`/${locale}${t.href}`}
                  className="d-flex align-items-center gap-3 text-decoration-none"
                  onClick={hide}
                >
                  <span className="text-primary d-inline-flex">
                    <Icon width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" />
                  </span>
                  <span className="fw-semibold">{t.title}</span>
                </Link>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
