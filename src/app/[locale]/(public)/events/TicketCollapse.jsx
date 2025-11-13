"use client";

import { useState } from "react";
import TicketSelector from "@/components/tickets/TicketSelector";

export default function TicketCollapse({ title, body, btnOpen, btnClose }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="events__cta">
      <h3>{title}</h3>
      <p>{body}</p>

      <button onClick={() => setOpen(!open)} className="ticket-btn">
        {open ? btnClose : btnOpen}
      </button>

      {open && (
        <div className="ticket-panel">
          <TicketSelector />
        </div>
      )}
    </section>
  );
}
