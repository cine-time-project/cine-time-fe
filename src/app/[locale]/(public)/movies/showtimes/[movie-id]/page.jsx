
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { config } from "@/helpers/config.js";

const API = config.apiURL; // e.g. http://localhost:8090/api

// 1) Resolve a cinema image URL safely.
function resolveCinemaImage(c) {
  const raw = (c?.imageUrl || "").trim?.() || "";
  if (raw) {
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith("/")) {
      const base = (API || "").replace(/\/api\/?$/, "");
      return `${base}${raw}`;
    }
    const base = (API || "").replace(/\/$/, "");
    return `${base}/${raw}`;
  }
  // Fallback to our binary endpoint by cinemaId, but only if id exists
  return c?.id != null ? `${API}/cinemaimages/${c.id}` : "";
}

// 2) Locale from path
function useLocale() {
  const pathname = usePathname() || "/";
  return pathname.split("/")[1] || "tr";
}

export default function MovieShowtimeCinemasPage() {
  const locale = useLocale();
  const params = useParams();
  const movieId = params?.["movie-id"]; // folder name has a hyphen

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cinemas, setCinemas] = useState([]); // [{id, name, cityName?, imageUrl?}]
  const [hydrating, setHydrating] = useState(false);
  const [movieTitle, setMovieTitle] = useState("");

  // Track the last movieId we fetched; avoids StrictMode double-fetch,
  // but still refetches when movieId changes during client navigation.
  const lastFetchedMovieIdRef = useRef(null);
  const hydratedIdsRef = useRef(new Set());

  const L = (rest = "") =>
    rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;

  // A tiny transparent placeholder to avoid broken icon flash
  const FALLBACK_DATA_URL = "data:image/gif;base64,R0lGODlhAQABAAAAACw=";

  // --- Load cinemas that have showtimes for the movie ---
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        // Wait until we actually have a valid numeric movieId
        if (!movieId || !/^\d+$/.test(String(movieId))) {
          setLoading(false);
          return;
        }

        // Reset view state before (re)fetching
        setCinemas([]);
        setMovieTitle("");

        // We are going to fetch now
        setLoading(true);
        setError(null);
        // allow hydration to run fresh for this load
        hydratedIdsRef.current = new Set();

        const res = await axios.get(`${API}/show-times/movie/${movieId}`, {
          validateStatus: () => true,
          params: { size: 200, sort: "date,asc" },
        });
        if (res.status >= 400)
          throw new Error(res.data?.message || `HTTP ${res.status}`);

        const root = res.data?.returnBody ?? res.data ?? {};
        const contentRaw = Array.isArray(root?.content) ? root.content : [];
        const content = contentRaw.filter(Boolean);

        // Capture movie title from the first row if available
        setMovieTitle(
          content.length && content[0] && content[0].movieTitle
            ? String(content[0].movieTitle)
            : ""
        );

        // Build a unique list of cinemas. If cinemaId is missing in the API
        // (e.g., only cinemaName is returned), we dedupe by name and leave id=null.
        const list = [
          ...new Map(
            content
              .map((st) => {
                const cidRaw = st?.cinemaId ?? st?.cinema_id ?? null;
                const cname = (st?.cinemaName ?? st?.cinema_name ?? "")
                  .toString()
                  .trim();
                const key =
                  cidRaw != null
                    ? `id:${cidRaw}`
                    : cname
                    ? `name:${cname}`
                    : null;
                if (!key) return null;
                return [
                  key,
                  {
                    id: cidRaw != null ? Number(cidRaw) : null,
                    name:
                      cname ||
                      (cidRaw != null
                        ? `Cinema #${cidRaw}`
                        : "(İsimsiz Sinema)"),
                    cityName: st?.cityName ?? st?.city_name ?? undefined,
                    imageUrl: st?.imageUrl ?? st?.image_url ?? null,
                  },
                ];
              })
              .filter(Boolean)
          ).values(),
        ];

        if (!ignore) setCinemas(list);
      } catch (e) {
        if (!ignore) {
          setError(e?.message || "Cinemas could not be loaded.");
          setCinemas([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [movieId]);

  // --- Hydrate missing imageUrl by fetching cinema details ---
  useEffect(() => {
    let ignore = false;

    // Determine which cinemas actually need hydration and haven't been fetched before
    const toFetch = cinemas.filter(
      (c) => !c.imageUrl && c?.id && !hydratedIdsRef.current.has(c.id)
    );
    if (!toFetch.length) return;

    (async () => {
      try {
        setHydrating(true);

        const updates = await Promise.all(
          toFetch.map(async (c) => {
            try {
              const r = await axios.get(`${API}/cinemas/${c.id}`, {
                validateStatus: () => true,
              });
              if (r.status >= 400) return [c.id, null];
              const body = r.data?.returnBody ?? r.data ?? {};
              const payload = {
                id: c.id,
                imageUrl: body.imageUrl || null,
                cityName: body?.city?.name || body?.cityName || null,
              };
              return [c.id, payload];
            } catch {
              return [c.id, null];
            }
          })
        );

        // Build a quick map of updates and mark hydrated IDs to avoid re-fetching
        const upMap = new Map();
        for (const [id, payload] of updates) {
          if (id != null) hydratedIdsRef.current.add(id);
          if (payload) upMap.set(id, payload);
        }

        if (!ignore && upMap.size) {
          setCinemas((prev) =>
            prev.map((p) => {
              const u = upMap.get(p.id);
              if (!u) return p;
              return {
                ...p,
                imageUrl: u.imageUrl ?? p.imageUrl ?? null,
                cityName: p.cityName || u.cityName || undefined,
              };
            })
          );
        }
      } finally {
        if (!ignore) setHydrating(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [cinemas]);

  return (
    <div className="container py-4">
      <h1 className="mb-1">
        {movieTitle
          ? `${movieTitle} Filminin Gösterimi Olan Sinemalar`
          : "Filmin Gösterimi Olan Sinemalar"}
      </h1>
      <p className="text-muted mb-4">
        Param: <strong>{String(movieId)}</strong>
        {hydrating && <span className="ms-2">• loading images…</span>}
      </p>

      {loading && <div className="py-5">Loading…</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          {cinemas.length === 0 ? (
            <div className="text-secondary py-5">
              No cinemas currently have showtimes for this movie.
            </div>
          ) : (
            <div className="cinema-grid">
              {cinemas.map((c, idx) => {
                const src = c?.id ? resolveCinemaImage(c) : FALLBACK_DATA_URL;
                const cityName = c.cityName || "-";
                const reactKey = c?.id ?? `name-${c?.name ?? idx}`;

                return (
                  <article className="cinema-card" key={reactKey}>
                    <div className="cinema-card__media">
                      <Image
                        src={src}
                        alt={c.name}
                        fill
                        unoptimized
                        sizes="(max-width: 1000px) 100vw, 420px"
                        style={{ objectFit: "cover" }}
                        onError={(e) => {
                          try {
                            const img = e.currentTarget;
                            if (
                              img &&
                              img.tagName === "IMG" &&
                              img.src !== FALLBACK_DATA_URL
                            ) {
                              img.src = FALLBACK_DATA_URL;
                            }
                          } catch {}
                        }}
                      />
                    </div>

                    <div className="cinema-card__body">
                      <div className="d-flex align-items-center justify-content-between gap-3">
                        <h3 className="cinema-card__title">{c.name}</h3>
                        {cityName && (
                          <span className="badge text-bg-secondary">
                            {cityName}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 d-flex gap-2">
                        {typeof c.id === "number" ? (
                          <>
                            <Link
                              href={L(`cinemas/${c.id}`)}
                              className="btn btn-outline-light"
                            >
                              Detay
                            </Link>
                            <Link
                              href={L(
                                `cinemas/${c.id}?movieId=${encodeURIComponent(
                                  String(movieId)
                                )}`
                              )}
                              className="btn btn-warning fw-semibold"
                            >
                              Bilet Al
                            </Link>
                          </>
                        ) : (
                          <span className="text-secondary small">
                            Bu sinema için bağlantı yok
                          </span>
                        )}
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