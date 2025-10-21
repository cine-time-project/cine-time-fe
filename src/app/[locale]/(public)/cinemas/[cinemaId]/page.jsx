"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { config } from "@/helpers/config.js";

const API = config.apiURL;

// util: format "HH:mm:ss" → "HH:mm"
function hhmm(t) {
  if (!t) return "";
  return t.slice(0, 5);
}

// util: ISO date → human
function prettyDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
}

export default function CinemaShowtimesPage() {
  const params = useParams();
  const pathname = usePathname() || "/";
  const locale = pathname.split("/")[1] || "tr";
  const sp = useSearchParams();
  const fromDate = sp.get("date") || new Date().toISOString().slice(0, 10);

  const cinemaId = params?.cinemaId;
  const [loading, setLoading] = useState(true);
  const [cinemaName, setCinemaName] = useState(null);
  const [payload, setPayload] = useState([]); // [{ movie:{...}, showtimes:[{date,startTime,...}] }]
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [dates, setDates] = useState([]);

  // Load page data
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Basic cinema info (name/city) – optional but nice for header
        const cRes = await axios.get(`${API}/cinemas/${cinemaId}`, {
          validateStatus: () => true,
        });
        if (cRes.status < 400) {
          const cBody = cRes.data?.returnBody ?? cRes.data;
          setCinemaName(cBody?.name || null);
        }

        // 2) Movies + showtimes for this cinema
        const res = await axios.get(`${API}/cinemas/${cinemaId}/movies`, {
          params: { fromDate },
          validateStatus: () => true,
        });
        if (res.status >= 400) {
          throw new Error(res.data?.message || `HTTP ${res.status}`);
        }
        const body = res.data?.returnBody ?? res.data;
        if (!ignore) setPayload(Array.isArray(body) ? body : []);
        // Date filter logic
        const uniqueDates = Array.from(
          new Set(
            (Array.isArray(body) ? body : [])
              .flatMap((item) => (item.showtimes || []).map((s) => s.date))
              .filter(Boolean)
          )
        ).sort();
        setDates(uniqueDates);
        if (!selectedDate && uniqueDates.length > 0) {
          setSelectedDate(uniqueDates[0]);
        }
      } catch (e) {
        if (!ignore) {
          setError("Seanslar yüklenemedi.");
          setPayload([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [cinemaId, fromDate]);

  const title = useMemo(
    () => (cinemaName ? `Seanslar — ${cinemaName}` : "Seanslar"),
    [cinemaName]
  );

  const L = (rest = "") =>
    rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;

  return (
    <div className="container py-4">
      <h1 className="mb-3">{title}</h1>

      <div className="mb-3 text-muted">
        Tarih: <strong>{prettyDate(fromDate)}</strong>
      </div>

      {loading && <div className="py-5">Yükleniyor…</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          {payload.length === 0 ? (
            <div className="text-secondary py-5">
              Bu gün için seans bulunamadı.
            </div>
          ) : (
            <>
              <div className="d-flex align-items-center gap-2 mb-3">
                <label className="form-label mb-0">Date:</label>
                <select
                  className="form-select form-select-sm w-auto"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  disabled={dates.length === 0}
                >
                  <option value="">Select date…</option>
                  {dates.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="movie-grid">
                {payload
                  .filter((item) =>
                    !selectedDate
                      ? true
                      : (item.showtimes || []).some((s) => s.date === selectedDate)
                  )
                  .map((item, idx) => {
                const m = item.movie || {};
                const showtimes = item.showtimes || [];

                // pick poster (prefer direct url, else first image url)
                const posterUrl =
                  m.posterUrl ||
                  m.images?.find((img) => img.poster)?.url ||
                  m.images?.[0]?.url ||
                  "/no-poster.png";

                return (
                  <article className="movie-card" key={`${m.id}-${idx}`}>
                    <div className="movie-card__media">
                      <Image
                        src={posterUrl}
                        alt={m.title}
                        fill
                        unoptimized
                        sizes="(max-width: 900px) 100vw, 360px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>

                    <div className="movie-card__body">
                      <header className="d-flex align-items-start justify-content-between gap-3">
                        <div>
                          <h3 className="movie-card__title">{m.title}</h3>
                          {m.director && (
                            <div className="text-muted small">
                              Yönetmen: {m.director}
                            </div>
                          )}
                        </div>
                        <Link
                          className="btn btn-outline-light"
                          href={L(`movies/${m.id}`)}
                        >
                          Detay
                        </Link>
                      </header>

                      {m.summary && (
                        <p className="text-secondary mt-2">
                          {m.summary.length > 160
                            ? m.summary.slice(0, 160) + "…"
                            : m.summary}
                        </p>
                      )}

                      <div className="showtime-row">
                        {showtimes.length === 0 ? (
                          <span className="text-muted">Seans yok</span>
                        ) : (
                          showtimes.map((s, i) => {
                            const date = s.date; // "YYYY-MM-DD"
                            const time = hhmm(s.startTime); // "HH:mm"
                            // Link to your purchase flow; adapt params as needed
                            const buyHref = L(
                              `buy-ticket?cinemaId=${cinemaId}&movieId=${m.id}&date=${date}&time=${time}`
                            );
                            return (
                              <Link
                                key={i}
                                href={buyHref}
                                className="btn btn-sm btn-warning showtime-chip"
                              >
                                {time}
                              </Link>
                            );
                          })
                        )}
                      </div>

                      {m.trailerUrl && (
                        <a
                          href={m.trailerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline-secondary mt-2"
                        >
                          Fragmanı izle
                        </a>
                      )}
                    </div>
                  </article>
                );
                })}
              </div>
            </>
          )}
        </>
      )}

      <style jsx>{`
        .movie-grid {
          display: grid;
          gap: 18px;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        }
        .movie-card {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          background: #1d1f24;
          border: 1px solid #2b2e36;
          border-radius: 12px;
          overflow: hidden;
          min-height: 230px;
        }
        @media (max-width: 900px) {
          .movie-card {
            grid-template-columns: 1fr;
          }
        }
        .movie-card__media {
          position: relative;
          min-height: 230px;
        }
        .movie-card__body {
          padding: 16px;
          display: grid;
          align-content: start;
          gap: 10px;
        }
        .movie-card__title {
          margin: 0;
          color: #fff;
          font-weight: 700;
          font-size: 20px;
        }
        .showtime-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 6px;
        }
        .showtime-chip {
          line-height: 1.1;
        }
      `}</style>
    </div>
  );
}
