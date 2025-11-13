"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { config } from "@/helpers/config.js";
import { MoviePoster, getMoviePosterUrl } from "@/lib/movies/poster";

// ==== CONFIG ====
const API = config.apiURL; // e.g. http://localhost:8090/api
const PAGE_SIZE = 12;
const DEBUG = false; // set true to log raw responses

// ---- Auth header with fallback (AuthProvider.user.token -> localStorage) ----
function readTokenFallback(user) {
  if (user?.token) return String(user.token).trim();
  if (typeof window === "undefined") return "";
  const clean = (v) => (v ? String(v).trim().replace(/^"|"$/g, "") : "");
  return (
    clean(localStorage.getItem("authToken")) ||
    clean(localStorage.getItem("accessToken")) ||
    clean(localStorage.getItem("access_token")) ||
    clean(localStorage.getItem("token")) ||
    clean(sessionStorage.getItem("accessToken")) ||
    ""
  );
}
function authHeadersFromAuth(user) {
  const raw = readTokenFallback(user);
  if (!raw) return {};
  const header = raw.toLowerCase().startsWith("bearer ") ? raw : `Bearer ${raw}`;
  return { Authorization: header };
}

// ---- Locale helpers for internal links ----
function useLocale() {
  const pathname = usePathname() || "/";
  return pathname.split("/")[1] || "tr";
}
const L = (locale, rest = "") =>
  rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;

// ---- Formatters ----
function prettyDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return iso || "";
  }
}
function hhmm(t) {
  // "18:45:00" -> "18:45"
  return (t || "").slice(0, 5);
}

// ---- Normalize backend shapes (paged or array) ----
function normalizePageShape(data) {
  const body = data?.returnBody ?? data ?? {};
  if (Array.isArray(body)) {
    return {
      content: body.filter(Boolean),
      last: true,
      totalElements: body.length,
      number: 0,
    };
  }
  if (Array.isArray(body.content)) {
    return {
      content: body.content.filter(Boolean),
      last: !!body.last,
      totalElements: body.totalElements ?? body.total ?? body.content.length,
      number: body.number ?? 0,
    };
  }
  // Single item or unexpected shape -> coerce
  return {
    content: body ? [body] : [],
    last: true,
    totalElements: body ? 1 : 0,
    number: 0,
  };
}

// Hydrate missing poster URLs using /movies/id/{id}
async function hydrateMissingPosters(list, setList) {
  try {
    // collect distinct movieIds that are missing poster
    const ids = Array.from(
      new Set(
        (list || [])
          .filter((t) => !t?.moviePosterUrl && t?.movieId)
          .map((t) => t.movieId)
      )
    );
    if (ids.length === 0) return;

    // fetch each movie once; tolerate failures
    const results = await Promise.allSettled(
      ids.map((id) =>
        axios
          .get(`${API}/movies/id/${id}`, {
            headers: { Accept: "application/json" },
            validateStatus: () => true,
          })
          .then((r) => ({
            id,
            body: r.data?.returnBody ?? r.data ?? null,
          }))
      )
    );

    const urlById = new Map();
    for (const r of results) {
      if (r.status === "fulfilled" && r.value?.body) {
        const url =
          getMoviePosterUrl(r.value.body) ||
          r.value.body?.posterUrl ||
          r.value.body?.images?.[0]?.url ||
          null;
        if (url) urlById.set(r.value.id, url);
      }
    }
    if (urlById.size === 0) return;

    // patch items in place via setter
    setList((prev) =>
      (prev || []).map((t) =>
        !t?.moviePosterUrl && t?.movieId && urlById.has(t.movieId)
          ? { ...t, moviePosterUrl: urlById.get(t.movieId) }
          : t
      )
    );
  } catch {
    // silently ignore; UI will keep showing fallback image via MoviePoster
  }
}

// ---- Small Ticket Card ----
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
  } = ticket || {};

  return (
    <article className="ticket-card">
      <div className="ticket-card__media">
        <MoviePoster
          movie={{ posterUrl: ticket?.moviePosterUrl }}
          alt={movieName || "Movie poster"}
          width={150}
          height={150}
          style={{
            objectFit: "cover",
            borderRadius: "6px",
          }}
        />
      </div>

      <div className="ticket-card__body">
        <h3 className="ticket-card__title">{movieName || "Untitled"}</h3>
        <div className="text-secondary small">
          {cinema || ""}
          {hall ? ` • ${hall}` : ""}
        </div>

        <div className="mt-2 d-flex flex-wrap gap-2">
          {date && (
            <span className="badge text-bg-dark">{prettyDate(date)}</span>
          )}
          {startTime && (
            <span className="badge text-bg-dark">{hhmm(startTime)}</span>
          )}
          {(seatLetter || seatNumber) && (
            <span className="badge text-bg-secondary">
              Seat {seatLetter}
              {seatNumber}
            </span>
          )}
          {status && <span className="badge text-bg-secondary">{status}</span>}
          {price != null && !Number.isNaN(Number(price)) && (
            <span className="badge text-bg-warning">
              ${Number(price).toFixed(2)}
            </span>
          )}
        </div>

        <div className="mt-3 d-flex gap-2">
          {id ? (
            <Link
              href={L(locale, `tickets/${id}`)}
              className="btn btn-light fw-semibold"
            >
              View Ticket
            </Link>
          ) : (
            <button className="btn btn-light fw-semibold" disabled>
              View Ticket
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// ---- Page Component ----
export default function PastTicketsPage() {
  const locale = useLocale();
  const { user } = useAuth();

  // Past tickets
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Current (upcoming) tickets
  const [currentItems, setCurrentItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentHasMore, setCurrentHasMore] = useState(true);
  const [currentLoading, setCurrentLoading] = useState(true);
  const [currentLoadingMore, setCurrentLoadingMore] = useState(false);
  const [currentError, setCurrentError] = useState(null);

  async function fetchPast(p) {
    const isFirst = p === 0;
    try {
      isFirst ? setLoading(true) : setLoadingMore(true);
      setError(null);

      const res = await axios.get(`${API}/tickets/auth/passed-tickets`, {
        validateStatus: () => true,
        headers: { Accept: "application/json", ...authHeadersFromAuth(user) },
        params: { page: p, size: PAGE_SIZE },
      });

      if (res.status === 401)
        throw new Error("Unauthorized. Please sign in again.");
      if (res.status >= 400)
        throw new Error(res.data?.message || `HTTP ${res.status}`);

      const normalized = normalizePageShape(res.data);

      setItems((prev) =>
        isFirst ? normalized.content : [...prev, ...normalized.content]
      );
      // try to fill in posters if backend omitted them but returns movieId
      hydrateMissingPosters(normalized.content, setItems);
      setHasMore(!normalized.last);
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

  async function fetchCurrent(p) {
    const isFirst = p === 0;
    try {
      isFirst ? setCurrentLoading(true) : setCurrentLoadingMore(true);
      setCurrentError(null);

      const res = await axios.get(`${API}/tickets/auth/current-tickets`, {
        validateStatus: () => true,
        headers: { Accept: "application/json", ...authHeadersFromAuth(user) },
        params: { page: p, size: PAGE_SIZE }, // fine even if backend ignores it
      });

      if (res.status === 401)
        throw new Error("Unauthorized. Please sign in again.");
      if (res.status >= 400)
        throw new Error(res.data?.message || `HTTP ${res.status}`);

      const normalized = normalizePageShape(res.data);

      setCurrentItems((prev) =>
        isFirst ? normalized.content : [...prev, ...normalized.content]
      );
      // try to fill in posters if backend omitted them but returns movieId
      hydrateMissingPosters(normalized.content, setCurrentItems);
      setCurrentHasMore(!normalized.last);
      setCurrentPage(p);
    } catch (e) {
      setCurrentError(e?.message || "Failed to load current tickets.");
      if (isFirst) {
        setCurrentItems([]);
        setCurrentHasMore(false);
      }
    } finally {
      isFirst ? setCurrentLoading(false) : setCurrentLoadingMore(false);
    }
  }

  useEffect(() => {
    const token = readTokenFallback(user);
    if (!token) {
      // No token available: stop the spinners and show an auth error
      setCurrentLoading(false);
      setLoading(false);
      setCurrentError("Sign in to view your tickets.");
      setError("Sign in to view your tickets.");
      return;
    }
    fetchCurrent(0);
    fetchPast(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  return (
    <div className="container py-4">
      <h1 className="mb-1">My Tickets</h1>
      <p className="text-muted mb-4"> </p>

      {/* --- Current (upcoming) tickets --- */}
      {currentLoading && <div className="py-4">Loading current tickets…</div>}
      {currentError && <div className="alert alert-danger">{currentError}</div>}
      {!currentLoading && !currentError && currentItems.length > 0 && (
        <section className="mb-5">
          <h2 className="h4 mb-3">Upcoming Events</h2>
          <div className="tickets-grid">
            {currentItems.map((t) => (
              <TicketCard
                key={`c-${t.id ?? Math.random()}`}
                ticket={t}
                locale={locale}
              />
            ))}
          </div>
          <div className="d-flex justify-content-center my-3">
            {currentHasMore ? (
              <button
                className="btn btn-outline-light"
                disabled={currentLoadingMore}
                onClick={() => fetchCurrent(currentPage + 1)}
              >
                {currentLoadingMore ? "Loading…" : "Load more"}
              </button>
            ) : (
              <span className="text-secondary small">
                No more upcoming tickets.
              </span>
            )}
          </div>
        </section>
      )}

      {/* --- Past tickets --- */}
      {loading && <div className="py-4">Loading past tickets…</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && (
        <section>
          <h2 className="h4 mb-3">Past Tickets</h2>
          {items.length === 0 ? (
            <div className="text-secondary py-4">
              You don’t have past tickets yet.
            </div>
          ) : (
            <>
              <div className="tickets-grid">
                {items.map((t) => (
                  <TicketCard
                    key={`p-${t.id ?? Math.random()}`}
                    ticket={t}
                    locale={locale}
                  />
                ))}
              </div>
              <div className="d-flex justify-content-center my-3">
                {hasMore ? (
                  <button
                    className="btn btn-outline-light"
                    disabled={loadingMore}
                    onClick={() => fetchPast(page + 1)}
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                ) : (
                  <span className="text-secondary small">
                    No more past tickets.
                  </span>
                )}
              </div>
            </>
          )}
        </section>
      )}

      <style jsx>{`
        .tickets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .ticket-card {
          display: grid;
          grid-template-columns: 56px 1fr;
          align-items: center;
          background: #1d1f24;
          border: 1px solid #2b2e36;
          border-radius: 12px;
          overflow: hidden;
          padding: 10px;
          min-height: 72px;
          transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
        }
        .ticket-card:hover {
          transform: translateY(-1px);
          border-color: #3a3f4a;
          box-shadow: 0 2px 10px rgba(0,0,0,0.25);
        }
        .ticket-card__media {
          position: relative;
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          border-radius: 8px;
          overflow: hidden;
        }
        .ticket-card__body {
          padding: 8px 0 8px 12px;
          display: grid;
          align-content: start;
          gap: 6px;
        }
        .ticket-card__title {
          margin: 0;
          color: rgba(255,255,255,0.92) !important;
          font-weight: 700;
          font-size: 14px;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .ticket-card__body :global(.text-secondary.small) {
          color: rgba(255,255,255,0.92) !important;
        }
        /* Force all text inside the ticket body to white */
        .ticket-card,
        .ticket-card__body * {
          color: rgba(255,255,255,0.92) !important;
        }
        :global(.badge) {
          font-size: 11px;
          padding: 0.3rem 0.5rem;
          border: 1px solid rgba(255,255,255,0.08);
        }
        @media (max-width: 640px) {
          .tickets-grid {
            grid-template-columns: 1fr;
          }
        }
 
.mb-1 {
    color: rgba(255,255,255,0.92) !important;
  }

  .h4.mb-3 {
    color: rgba(255,255,255,0.92) !important;
  }
 

      `}</style>
    </div>
  );
}
