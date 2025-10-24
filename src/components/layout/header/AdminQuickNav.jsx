"use client";

import Link from "next/link";
import { Offcanvas, Nav } from "react-bootstrap";

export default function AdminQuickNav({ show, onHide, L }) {
  const items = [
    { key: "cinemas",   label: "Cinemas",          href: L("admin/cinemas") },
    { key: "halls",     label: "Halls",            href: L("admin/halls") },
    { key: "times",     label: "Showtimes",        href: L("admin/showtimes") },
    { key: "images",    label: "Images",           href: L("admin/images") },
    { key: "cinemaimg", label: "Cinema Images",    href: L("admin/cinema-images") },
    { key: "movies",    label: "Movies",           href: L("admin/movies") },
    { key: "users",     label: "Users",            href: L("admin/users") },
    { key: "tickets",   label: "Tickets (Admin)",  href: L("admin/tickets") },
    { key: "cities",    label: "Cities",           href: L("admin/cities") },
    { key: "vip",       label: "Special Halls",    href: L("admin/special-halls") },
    { key: "contact",   label: "Contact Messages", href: L("admin/contact-messages") },
    { key: "reports",   label: "Reports",          href: L("admin/reports") }
  ];

  return (
    <Offcanvas show={show} onHide={onHide} placement="start" backdrop keyboard>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Dashboard</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Nav className="flex-column gap-2">
          {items.map(it => (
            <Nav.Link as={Link} key={it.key} href={it.href} onClick={onHide} className="py-2">
              {it.label}
            </Nav.Link>
          ))}
        </Nav>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
