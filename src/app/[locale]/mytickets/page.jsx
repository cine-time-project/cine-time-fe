"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { usePathname } from "next/navigation";
import { config } from "@/helpers/config.js";

// ==== CONFIG ====
const API = config.apiURL; // e.g. http://localhost:8090/api
const PAGE_SIZE = 12;

// Read JWT from localStorage (adjust if you keep it in cookies)
function authHeaders() {
  if (typeof window === "undefined") return {};
  const clean = (v) => (v ? String(v).trim().replace(/^"|"$/g, "") : "");
  const raw =
    clean(localStorage.getItem("authToken")) || // <- your key
    clean(localStorage.getItem("accessToken")) ||
    clean(localStorage.getItem("access_token")) ||
    clean(localStorage.getItem("token")) ||
    clean(sessionStorage.getItem("accessToken")) ||
    "";
  if (!raw) return {};
  const header = raw.toLowerCase().startsWith("bearer ")
    ? raw
    : `Bearer ${raw}`;
  return { Authorization: header };
}

// Locale helper for internal links
function useLocale() {
  const pathname = usePathname() || "/";
  return pathname.split("/")[1] || "tr";
}
const L = (locale, rest = "") =>
  rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;

// Formatters
function prettyDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
}
function hhmm(t) {
  // "18:45:00" -> "18:45"
  return (t || "").slice(0, 5);
}

// Placeholder image (transparent 1x1)
const FALLBACK_IMG = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

// If you later add posters, map each ticket to a poster URL here
function resolvePoster(/*ticket*/) {
  // e.g., if backend adds ticket.moviePosterUrl use that value.
  return FALLBACK_IMG;
}

// Small ticket card
function TicketCard({ ticket, locale }) {
  const {
    id,
    movieName,
    cinema,
    hall,
    date,
    startTime,
    seatLetter,
    seatNumber,
    status,
    price,
  } = ticket;

  const poster = resolvePoster(ticket);

  return (
    <article className="ticket-card">
      <div className="ticket-card__media">
        <Image
          src={poster}
          alt={movieName}
          fill
          unoptimized
          sizes="(max-width: 1000px) 100vw, 360px"
          style={{ objectFit: "cover" }}
          onError={(e) => {
            try {
              const img = e.currentTarget;
              if (img && img.tagName === "IMG" && img.src !== FALLBACK_IMG) {
                img.src = FALLBACK_IMG;
              }
            } catch {}
          }}
        />
      </div>

      <div className="ticket-card__body">
        <h3 className="ticket-card__title">{movieName}</h3>
        <div className="text-secondary small">
          {cinema}
          {hall ? ` • ${hall}` : ""}
        </div>

        <div className="mt-2 d-flex flex-wrap gap-2">
          <span className="badge text-bg-dark">{prettyDate(date)}</span>
          <span className="badge text-bg-dark">{hhmm(startTime)}</span>
          <span className="badge text-bg-secondary">
            Seat {seatLetter}
            {seatNumber}
          </span>
          <span className="badge text-bg-secondary">{status}</span>
          {price != null && (
            <span className="badge text-bg-warning">
              ${Number(price).toFixed(2)}
            </span>
          )}
        </div>

        <div className="mt-3 d-flex gap-2">
          <Link
            href={L(locale, `tickets/${id}`)}
            className="btn btn-light fw-semibold"
          >
            View Ticket
          </Link>
          {/* If you add a refund/cancel flow for *upcoming* tickets only, gate it by status/date */}
          {/* <button className="btn btn-outline-light">Cancel Reservation</button> */}
        </div>
      </div>
    </article>
  );
}

export default function PastTicketsPage() {
  const locale = useLocale();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  async function fetchPage(p) {
    const isFirst = p === 0;
    try {
      isFirst ? setLoading(true) : setLoadingMore(true);
      setError(null);

      const res = await axios.get(`${API}/tickets/auth/passed-tickets`, {
        validateStatus: () => true,
        headers: {
          Accept: "application/json",
          ...authHeaders(),
        },
        params: {
          page: p,
          size: PAGE_SIZE,
          // sort: "date,desc", // backend already returns past; sort newest first
        },
      });

      if (res.status === 401) {
        throw new Error("Unauthorized. Please sign in again.");
      }
      if (res.status >= 400) {
        throw new Error(res.data?.message || `HTTP ${res.status}`);
      }

      const body = res.data?.returnBody ?? res.data ?? {};
      const content = Array.isArray(body.content)
        ? body.content.filter(Boolean)
        : [];

      setItems((prev) => (isFirst ? content : [...prev, ...content]));
      setHasMore(!body.last);
      setPage(p);
    } catch (e) {
      setError(e?.message || "Failed to load tickets.");
      if (isFirst) {
        setItems([]);
        setHasMore(false);
      }
    } finally {
      isFirst ? setLoading(false) : setLoadingMore(false);
    }
  }

  useEffect(() => {
    fetchPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container py-4">
      <h1 className="mb-1">Past Tickets</h1>
      <p className="text-muted mb-4">Your tickets from previous dates.</p>

      {loading && <div className="py-5">Loading…</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          {items.length === 0 ? (
            <div className="text-secondary py-5">
              You don’t have past tickets yet.
            </div>
          ) : (
            <>
              <div className="tickets-grid">
                {items.map((t) => (
                  <TicketCard key={t.id} ticket={t} locale={locale} />
                ))}
              </div>

              <div className="d-flex justify-content-center my-4">
                {hasMore ? (
                  <button
                    className="btn btn-outline-light"
                    disabled={loadingMore}
                    onClick={() => fetchPage(page + 1)}
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                ) : (
                  <span className="text-secondary small">No more tickets.</span>
                )}
              </div>
            </>
          )}
        </>
      )}

      <style jsx>{`
        .tickets-grid {
          display: grid;
          gap: 18px;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
        }
        .ticket-card {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          background: #1d1f24;
          border: 1px solid #2b2e36;
          border-radius: 14px;
          overflow: hidden;
          min-height: 200px;
        }
        @media (max-width: 880px) {
          .ticket-card {
            grid-template-columns: 1fr;
          }
        }
        .ticket-card__media {
          position: relative;
          min-height: 200px;
        }
        .ticket-card__body {
          padding: 16px;
          display: grid;
          align-content: start;
          gap: 10px;
        }
        .ticket-card__title {
          margin: 0;
          color: #fff;
          font-weight: 700;
          font-size: 20px;
        }
      `}</style>
    </div>
  );
}
