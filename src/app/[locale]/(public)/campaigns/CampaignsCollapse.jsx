"use client";

import { useState } from "react";
import TicketSelector from "@/components/tickets/TicketSelector";

export default function CampaignsCollapse({ title, body, btnOpen, btnClose }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="campaigns__cta">
      <h3>{title}</h3>
      <p>{body}</p>

      <button
        onClick={() => setOpen(!open)}
        style={{
          marginTop: "1rem",
          padding: "0.8rem 1.2rem",
          background: "#ffc107",
          color: "#222",
          borderRadius: "10px",
          fontWeight: "600",
          border: "none",
          cursor: "pointer",
          width: "100%",
          maxWidth: "300px",
        }}
      >
        {open ? btnClose : btnOpen}
      </button>

      {open && (
        <div style={{ maxWidth: 700, margin: "0 auto", marginTop: "2rem" }}>
          <TicketSelector />
        </div>
      )}
    </section>
  );
}
