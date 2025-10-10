"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { authHeaders } from "@/lib/utils/http";

const API = process.env.NEXT_PUBLIC_API_BASE_URL; // e.g. http://localhost:8090/api

// Prefer backend-provided URL. If empty, fall back to our binary endpoint.
// Also normalize cases where backend returns a path like "/api/cinemaimages/123".
function resolveCinemaImage(c) {
  const raw = (c?.imageUrl || "").trim();

  if (!raw) {
    return `${API}/cinemaimages/${c.id}`;
  }

  // Absolute http(s) -> use as-is
  if (/^https?:\/\//i.test(raw)) return raw;

  // If backend returned a path starting with "/" -> stitch with server origin (strip trailing /api from base)
  if (raw.startsWith("/")) {
    const base = (API || "").replace(/\/api\/?$/, "");
    return `${base}${raw}`;
  }

  // If backend returned "api/..." or "cinemaimages/..."
  const base = (API || "").replace(/\/$/, "");
  return `${base}/${raw}`;
}

// Find the earliest future showtime date (YYYY-MM-DD) from the halls payload
function firstUpcomingDate(halls) {
  if (!Array.isArray(halls)) return null;
  const now = new Date();
  const dates = [];

  for (const h of halls) {
    for (const m of h.movies || []) {
      for (const iso of m.times || []) {
        const d = new Date(iso);
        if (!isNaN(d) && d >= now) {
          dates.push(iso.slice(0, 10)); // YYYY-MM-DD
        }
      }
    }
  }
  if (!dates.length) return null;
  return dates.sort()[0]; // earliest day
}

export default function CinemasPage() {
  const pathname = usePathname() || "/";
  const locale = pathname.split("/")[1] || "tr";
  const sp = useSearchParams();
  const cityFilter = sp.get("city") || "";

  const [loading, setLoading] = useState(true);
  const [cinemas, setCinemas] = useState([]); // [{ id, name, city:{id,name}, imageUrl }]
  const [firstDatesByCinema, setFirstDatesByCinema] = useState({}); // { [cinemaId]: 'YYYY-MM-DD' }
  const [error, setError] = useState(null);

  // Load cinemas that have showtimes AND images (your new endpoint)
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API}/cinemas/with-showtimes-and-images`, {
          params: {
            city: cityFilter || undefined,
            page: 0,
            size: 12,
            sort: "name",
            type: "asc",
          },
          validateStatus: () => true,
        });

        if (res.status >= 400) {
          throw new Error(res.data?.message || `HTTP ${res.status}`);
        }

        const body = res.data?.returnBody ?? res.data;
        const list = Array.isArray(body) ? body : [];
        if (!ignore) setCinemas(list);
      } catch {
        if (!ignore) {
          setError("Cinemalar yüklenemedi.");
          setCinemas([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [cityFilter]);

  // For each cinema, fetch showtimes to compute the first available date for the "Bilet Al" link.
  // We intentionally do NOT render individual showtimes on this page.
  useEffect(() => {
    let ignore = false;
    if (!cinemas.length) {
      setFirstDatesByCinema({});
      return;
    }

    (async () => {
      try {
        const entries = await Promise.all(
          cinemas.map(async (c) => {
            try {
              const r = await axios.get(`${API}/show-times/cinema/${c.id}`, {
                headers: authHeaders(), // endpoint is secured
                validateStatus: () => true,
              });
              if (r.status >= 400) throw new Error(`HTTP ${r.status}`);
              const body = r.data?.returnBody ?? r.data;
              const halls = Array.isArray(body) ? body : [];
              const fd = firstUpcomingDate(halls);
              return [c.id, fd];
            } catch {
              return [c.id, null];
            }
          })
        );
        if (!ignore) setFirstDatesByCinema(Object.fromEntries(entries));
      } catch {
        if (!ignore) setFirstDatesByCinema({});
      }
    })();

    return () => {
      ignore = true;
    };
  }, [cinemas]);

  const L = (rest = "") =>
    rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;

  return (
    <div className="container py-4">
      <h1 className="mb-3">Cinemas</h1>

      {cityFilter && (
        <p className="text-muted">
          City filter: <strong>{cityFilter}</strong>
        </p>
      )}

      {loading && <div className="py-5">Yükleniyor…</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          {cinemas.length === 0 ? (
            <div className="text-secondary py-5">
              Şu an kriterlere uyan sinema bulunamadı.
            </div>
          ) : (
            <div className="cinema-grid">
              {cinemas.map((c) => {
                const imgSrc = resolveCinemaImage(c);
                const cityName =
                  c.city?.name ||
                  c.cityName ||
                  (typeof c.city === "string" ? c.city : "-");

                return (
                  <article className="cinema-card" key={c.id}>
                    <div className="cinema-card__media">
                      <Image
                        src={imgSrc}
                        alt={c.name}
                        fill
                        unoptimized
                        sizes="(max-width: 1000px) 100vw, 420px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>

                    <div className="cinema-card__body">
                      {/* Title + city only — NO image-url text and NO showtimes list */}
                      <div className="d-flex align-items-center justify-content-between gap-3">
                        <h3 className="cinema-card__title">{c.name}</h3>
                        {cityName && (
                          <span className="badge text-bg-secondary">
                            {cityName}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 d-flex gap-2">
                        <Link
                          href={L(`cinemas/${c.id}`)}
                          className="btn btn-outline-light"
                        >
                          Detay
                        </Link>

                        {/* Build buy-ticket URL with cityId, cinemaId and, if known, the first upcoming date */}
                        <Link
                          href={L(`cinemas/${c.id}`)}
                          className="btn btn-warning fw-semibold"
                        >
                          Bilet Al
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .cinema-grid {
          display: grid;
          gap: 18px;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        }
        .cinema-card {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          background: #1d1f24;
          border: 1px solid #2b2e36;
          border-radius: 14px;
          overflow: hidden;
          min-height: 230px;
        }
        @media (max-width: 900px) {
          .cinema-card {
            grid-template-columns: 1fr;
          }
        }
        .cinema-card__media {
          position: relative;
          min-height: 230px;
        }
        .cinema-card__body {
          padding: 16px;
          display: grid;
          align-content: start;
          gap: 10px;
        }
        .cinema-card__title {
          margin: 0;
          color: #fff;
          font-weight: 700;
          font-size: 20px;
        }
      `}</style>
    </div>
  );
}
