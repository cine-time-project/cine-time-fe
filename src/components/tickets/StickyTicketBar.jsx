"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import TicketSelector from "@/components/tickets/TicketSelector";

/**
 * Sticky buy-ticket bar that stays fixed at bottom.
 * Only appears on the main page ("/" or "/[locale]").
 */
export default function StickyTicketBar() {
  const pathname = usePathname();

  // Only show on main dashboard/home routes
  // Adjust this list based on your locales
  const isMainPage =
    pathname === "/" ||
    pathname === "/tr" ||
    pathname === "/en" ||
    pathname === "/de" ||
    pathname === "/fr";

  useEffect(() => {
    if (isMainPage) {
      document.body.classList.add("has-sticky-buybar");
      return () => document.body.classList.remove("has-sticky-buybar");
    }
  }, [isMainPage]);

  if (!isMainPage) return null;

  return (
    <>
      <div className="sticky-buybar">
        <div className="sticky-buybar__inner container">
          <div className="sticky-buybar__title">🎟️ Bilet Al</div>
          <div className="sticky-buybar__selector">
            <TicketSelector />
          </div>
        </div>
      </div>

      <style jsx global>{`
        body.has-sticky-buybar {
          padding-bottom: 116px;
        }

        .sticky-buybar {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1100;
          background: #191a1f;
          border-top: 2px solid #f1b90b;
          box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.35);
        }

        .sticky-buybar__inner {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 12px;
          padding: 12px 16px;
          align-items: center;
        }

        .sticky-buybar__title {
          color: #f1b90b;
          font-weight: 700;
          font-size: 20px;
          text-align: center;
        }

        .sticky-buybar__selector .p-3.bg-dark.text-light.rounded {
          background: transparent !important;
          color: #fff !important;
          border-radius: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        .sticky-buybar__selector h4 {
          display: none;
        }

        .sticky-buybar__selector .form-select {
          background-color: #1f2026;
          color: #fff;
          border: 1px solid #35363d;
          height: 44px;
        }

        .sticky-buybar__selector .btn.btn-warning {
          height: 44px;
          font-weight: 700;
          background-color: #f1b90b;
          border: none;
          color: #111;
        }

        .sticky-buybar__selector > div {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }

        @media (max-width: 992px) {
          .sticky-buybar__inner {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .sticky-buybar__selector > div {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .sticky-buybar__selector .btn.btn-warning {
            grid-column: 1 / -1;
          }
          body.has-sticky-buybar {
            padding-bottom: 156px;
          }
        }
      `}</style>
    </>
  );
}
