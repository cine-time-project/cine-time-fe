"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { config } from "@/helpers/config.js";
import { useTranslations } from "next-intl";

// Local YYYY-MM-DD for "today"
function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// format "HH:mm:ss" → "HH:mm"
function hhmm(t) {
  if (!t) return "";
  return String(t).slice(0, 5);
}

// Normalize various poster URL shapes (absolute, /path, relative) to a usable src
function resolvePosterUrl(raw) {
  if (!raw) return null;
  const s = String(raw).trim();
  if (/^https?:\/\//i.test(s)) return s;
  const base = (API || "").replace(/\/api\/?$/, "");
  if (s.startsWith("/")) return `${base}${s}`;
  return `${base}/${s}`;
}

// Extract a poster URL from /movies/id/{id} payload (robust)
function extractPosterUrlFromMovie(movie) {
  if (!movie) return null;
  const base = (API || "").replace(/\/api\/?$/, "");
  const images = Array.isArray(movie.images) ? movie.images : [];
  const posterObj =
    images.find((img) => img && img.poster === true) ||
    images.find((img) =>
      String(img?.name || "")
        .toLowerCase()
        .includes("poster")
    ) ||
    images[0];

  let raw = movie.posterUrl || movie.poster_url || posterObj?.url || null;

  // Fallbacks if only ids are present
  if (
    !raw &&
    (typeof movie.posterId === "number" || typeof movie.posterId === "string")
  ) {
    raw = `${base}/api/images/${movie.posterId}`;
  }
  if (
    !raw &&
    (typeof movie.heroId === "number" || typeof movie.heroId === "string")
  ) {
    raw = `${base}/api/images/${movie.heroId}`;
  }

  return resolvePosterUrl(raw);
}

const API = config.apiURL; // e.g. http://localhost:8090/api

// 2) Locale from path
function useLocale() {
  const pathname = usePathname() || "/";
  return pathname.split("/")[1] || "tr";
}

export default function MovieShowtimeCinemasPage() {
  const locale = useLocale();
  const t = useTranslations("movieShowtimes");
  const params = useParams();
  const movieId = params?.["movie-id"]; // folder name has a hyphen

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // [{id, name, cityName?, countryName?}]
  const [cinemas, setCinemas] = useState([]);

  // movie title & meta to render inside each cinema card
  const [movieTitle, setMovieTitle] = useState("");
  const [movieMeta, setMovieMeta] = useState({
    id: null,
    title: "",
    posterUrl: null,
    director: null,
    summary: null,
  });
  const [movieData, setMovieData] = useState(null);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState(""); // "YYYY-MM-DD"
  const [dates, setDates] = useState([]); // unique dates from API

  // minimal index: { cid, cname, country, city, date }
  const [showIndex, setShowIndex] = useState([]);

  // map: "cinemaId__YYYY-MM-DD" => [{date, startTime}]
  const [showByCinemaDate, setShowByCinemaDate] = useState({});

  // Track the last movieId we fetched; avoids StrictMode double-fetch
  const lastFetchedMovieIdRef = useRef(null);

  const L = (rest = "") =>
    rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;

  // --- Load cinemas that have showtimes for the movie & build showtime index ---
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        if (!movieId || !/^\d+$/.test(String(movieId))) {
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        const res = await axios.get(`${API}/show-times/movie/${movieId}`, {
          validateStatus: () => true,
          params: { size: 400, sort: "date,asc" },
        });
        if (res.status >= 400)
          throw new Error(res.data?.message || `HTTP ${res.status}`);

        const root = res.data?.returnBody ?? res.data ?? {};
        const contentRaw = Array.isArray(root?.content)
          ? root.content
          : Array.isArray(root)
          ? root
          : [];
        const content = contentRaw.filter(Boolean);

        // Capture movie meta from the first row if available
        const first = content[0] || {};
        const meta = {
          id: Number(movieId),
          title: (first?.movieTitle || first?.movie_title || "").toString(),
          posterUrl: null, // always fetch from /movies/id/{id}
          director: first?.director || first?.movieDirector || null,
          summary: first?.summary || first?.movieSummary || null,
        };
        setMovieMeta(meta);
        setMovieTitle(meta.title || "");

        // Index for filters (country -> city -> date)
        setShowIndex(
          content.map((st) => ({
            cid: st?.cinemaId ?? st?.cinema_id ?? null,
            cname: (st?.cinemaName ?? st?.cinema_name ?? "").toString().trim(),
            country: (st?.countryName ?? st?.country_name ?? "")
              .toString()
              .trim(),
            city: (st?.cityName ?? st?.city_name ?? "").toString().trim(),
            date: String(st?.date || "").slice(0, 10),
          }))
        );

        // Build a unique list of cinemas. If cinemaId is missing in the API,
        // dedupe by name and leave id=null.
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
                    countryName:
                      st?.countryName ?? st?.country_name ?? undefined,
                  },
                ];
              })
              .filter(Boolean)
          ).values(),
        ];
        if (!ignore) setCinemas(list);

        // Build a map of showtimes keyed by "cinemaId__YYYY-MM-DD"
        const byKey = {};
        for (const st of content) {
          const cid = st?.cinemaId ?? st?.cinema_id ?? null;
          const date = String(st?.date || "").slice(0, 10);
          const startRaw = st?.startTime ?? st?.start_time ?? null;
          if (cid == null || !date || !startRaw) continue;
          const key = `${cid}__${date}`;
          if (!byKey[key]) byKey[key] = [];
          byKey[key].push({
            date,
            startTime: String(startRaw),
          });
        }
        setShowByCinemaDate(byKey);

        // Reset selectable dates until city selection is made
        setDates([]);
        setSelectedDate("");
      } catch (e) {
        if (!ignore) {
          setError(e?.message || t("errors.generic"));
          setCinemas([]);
          setShowByCinemaDate({});
          setShowIndex([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [movieId, t]);

  // Always fetch poster (and optionally other movie fields) from /movies/id/{id}
  useEffect(() => {
    let ignore = false;
    const id = Number(movieId);
    if (!id) return;
    (async () => {
      try {
        const res = await axios.get(`${API}/movies/id/${id}`, {
          validateStatus: () => true,
          headers: { Accept: "application/json" },
        });
        if (res.status >= 400) return;
        const body = res.data?.returnBody ?? res.data ?? null;
        setMovieData(body || null);
        if (!ignore) {
          // Optionally sync title/director/summary if missing
          setMovieMeta((prev) => ({
            ...prev,
            id,
            title: prev.title || body?.title || prev.title,
            director: prev.director || body?.director || prev.director,
            summary: prev.summary || body?.summary || prev.summary,
          }));
          if (body?.title && !movieTitle) setMovieTitle(body.title);
        }
      } catch {
        // ignore errors; UI will fallback to /no-poster.png
      }
    })();
    return () => {
      ignore = true;
    };
  }, [movieId, movieTitle]);

  // Recompute available dates when country/city changes (only future dates)
  useEffect(() => {
    const today = todayYMD();
    if (!selectedCountry || !selectedCity) {
      setDates([]);
      setSelectedDate("");
      return;
    }
    const available = Array.from(
      new Set(
        showIndex
          .filter(
            (s) =>
              (selectedCountry === "All" || s.country === selectedCountry) &&
              s.city === selectedCity &&
              s.date >= today
          )
          .map((s) => s.date)
      )
    ).sort();
    setDates(available);
    setSelectedDate((prev) => (available.includes(prev) ? prev : ""));
  }, [selectedCountry, selectedCity, showIndex]);

  // Build dropdown options from already-fetched cinemas
  let countries = Array.from(
    new Set(
      cinemas.map((c) => (c.countryName || "").toString()).filter(Boolean)
    )
  ).sort();
  // If backend didn't send country names, provide a fallback so the dropdown is usable
  if (countries.length === 0 && cinemas.length > 0) {
    countries = ["All"]; // user can pick All to unlock city selection
  }

  const cities = Array.from(
    new Set(
      cinemas
        .filter((c) =>
          selectedCountry && selectedCountry !== "All"
            ? c.countryName === selectedCountry
            : true
        )
        .map((c) => (c.cityName || "").toString())
        .filter(Boolean)
    )
  ).sort();

  const filteredCinemas = cinemas.filter((c) => {
    // Don't render until all required selects are chosen
    if (!selectedCountry || !selectedCity || !selectedDate) return false;
    const countryOk =
      selectedCountry === "All" ||
      (c.countryName && c.countryName === selectedCountry);
    const cityOk = c.cityName === selectedCity;
    // A cinema matches the date if any showtime row links this cinema (by id or name) to selectedDate
    const dateOk = showIndex.some((s) => {
      const sameCinema =
        (typeof c.id === "number" && s.cid === c.id) ||
        (!c.id && s.cid == null && s.cname === c.name);
      return sameCinema && s.date === selectedDate;
    });
    return countryOk && cityOk && dateOk;
  });

  return (
    <div className="container py-4 movie-showtimes-page">
      <h1 className="mb-1">
        {movieTitle
          ? t("titleWithMovie", { title: movieTitle })
          : t("titleGeneric")}
      </h1>
      <p className="text-muted mb-4">
        {t("paramLabel")} <strong>{String(movieId)}</strong>
      </p>

      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <label className="form-label me-2 mb-0">{t("filters.country")}</label>
        <select
          className="form-select form-select-sm w-auto"
          value={selectedCountry}
          onChange={(e) => {
            setSelectedCountry(e.target.value);
            setSelectedCity("");
          }}
        >
          <option value="">{t("filters.countryPlaceholder")}</option>
          {countries.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <label className="form-label ms-3 me-2 mb-0">{t("filters.city")}</label>
        <select
          className="form-select form-select-sm w-auto"
          value={selectedCity}
          onChange={(e) => {
            setSelectedCity(e.target.value);
            setSelectedDate("");
          }}
          disabled={!selectedCountry || cities.length === 0}
        >
          <option value="">{t("filters.cityPlaceholder")}</option>
          {cities.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <label className="form-label ms-3 me-2 mb-0">{t("filters.date")}</label>
        <select
          className="form-select form-select-sm w-auto"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          disabled={dates.length === 0}
        >
          <option value="">{t("filters.datePlaceholder")}</option>
          {dates.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="py-5">{t("loading")}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <>
          {filteredCinemas.length === 0 ? (
            <div className="cinema-grid">
              <article className="cinema-card">
                {/* Movie-only card shown before filters (or when no matches) */}
                <div className="movie-mini">
                  <div className="movie-mini__media">
                    <Image
                      src={
                        movieData?.posterUrl ||
                        movieData?.images?.find((img) => img?.poster)?.url ||
                        movieData?.images?.[0]?.url ||
                        "/no-poster.png"
                      }
                      alt={movieMeta.title || "Poster"}
                      fill
                      unoptimized
                      sizes="(max-width: 900px) 100vw, 140px"
                      style={{ objectFit: "cover", borderRadius: 8 }}
                    />
                  </div>
                  <div className="movie-mini__body">
                    <div className="d-flex align-items-start justify-content-between gap-3">
                      <div>
                        <div className="movie-mini__title">
                          {movieMeta.title ||
                            movieTitle ||
                            t("movie.titleFallback")}
                        </div>
                        {movieMeta?.director && (
                          <div className="text-muted small">
                            {t("movie.directorLabel")} {movieMeta.director}
                          </div>
                        )}
                      </div>
                      {movieMeta?.id && (
                        <Link
                          className="btn btn-sm btn-outline-light"
                          href={L(`movies/${movieMeta.id}`)}
                        >
                          {t("movie.details")}
                        </Link>
                      )}
                    </div>

                    <div className="showtime-row mt-2">
                      {!selectedDate || !selectedCountry || !selectedCity ? (
                        <span className="text-muted small">
                          {t("messages.selectFiltersHint")}
                        </span>
                      ) : (
                        <span className="text-muted">
                          {t("messages.noShowtimes")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          ) : (
            <div className="cinema-grid">
              {filteredCinemas.map((c, idx) => {
                const cityName = c.cityName || "-";
                const reactKey = c?.id ?? `name-${c?.name ?? idx}`;
                const cinemaId = typeof c.id === "number" ? c.id : null;

                // Times for THIS cinema + selectedDate
                const key =
                  cinemaId != null ? `${cinemaId}__${selectedDate}` : null;
                const times = key ? showByCinemaDate[key] || [] : [];

                return (
                  <article className="cinema-card" key={reactKey}>
                    <header className="d-flex align-items-center justify-content-between mb-2">
                      <h3 className="cinema-card__title m-0">{c.name}</h3>
                      {cityName && (
                        <span className="badge text-bg-secondary">
                          {cityName}
                        </span>
                      )}
                    </header>

                    {/* Mini movie card (adapted from your second page) */}
                    <div className="movie-mini">
                      {/* Poster (always rendered, fallback to /no-poster.png) */}
                      <div className="movie-mini__media">
                        <Image
                          src={
                            movieData?.posterUrl ||
                            movieData?.images?.find((img) => img?.poster)
                              ?.url ||
                            movieData?.images?.[0]?.url ||
                            "/no-poster.png"
                          }
                          alt={movieMeta.title || "Poster"}
                          fill
                          unoptimized
                          sizes="(max-width: 900px) 100vw, 140px"
                          style={{ objectFit: "cover", borderRadius: 8 }}
                        />
                      </div>

                      <div className="movie-mini__body">
                        <div className="d-flex align-items-start justify-content-between gap-3">
                          <div>
                            <div className="movie-mini__title">
                              {movieMeta.title ||
                                movieTitle ||
                                t("movie.titleFallback")}
                            </div>
                            {movieMeta?.director && (
                              <div className="text-muted small">
                                {t("movie.directorLabel")} {movieMeta.director}
                              </div>
                            )}
                          </div>
                          {movieMeta?.id && (
                            <Link
                              className="btn btn-sm btn-outline-light"
                              href={L(`movies/${movieMeta.id}`)}
                            >
                              {t("movie.details")}
                            </Link>
                          )}
                        </div>

                        <div className="showtime-row mt-2">
                          {!selectedDate ? (
                            <span className="text-muted small">
                              {t("messages.selectDateHint")}
                            </span>
                          ) : !times.length ? (
                            <span className="text-muted">
                              {t("messages.noShowtimes")}
                            </span>
                          ) : (
                            times
                              .sort((a, b) =>
                                String(a.startTime).localeCompare(
                                  String(b.startTime)
                                )
                              )
                              .map((s, i) => {
                                const time = hhmm(String(s.startTime));
                                const buyHref = L(
                                  `buy-ticket?cinemaId=${cinemaId}&movieId=${
                                    movieMeta.id || movieId
                                  }&date=${s.date}&time={time}`
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
        .movie-showtimes-page {
          color: #fff;
        }

        .movie-showtimes-page h1,
        .movie-showtimes-page p,
        .movie-showtimes-page label,
        .movie-showtimes-page strong,
        .movie-showtimes-page .text-muted,
        .movie-showtimes-page select,
        .movie-showtimes-page option {
          color: #fff !important;
        }

        .movie-showtimes-page .form-select {
          background-color: #2a2c33 !important;
          color: #fff !important;
          border-color: #3a3d45 !important;
        }

        .cinema-grid {
          display: grid;
          gap: 18px;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        }
        .cinema-card {
          background: #1d1f24;
          border: 1px solid #2b2e36;
          border-radius: 14px;
          padding: 14px;
          display: grid;
          gap: 12px;
          min-height: unset;
        }
        .cinema-card__title {
          margin: 0;
          color: #fff;
          font-weight: 700;
          font-size: 20px;
        }

        .movie-mini {
          display: grid;
          grid-template-columns: 96px 1fr;
          gap: 12px;
          align-items: start;
        }
        @media (max-width: 600px) {
          .movie-mini {
            grid-template-columns: 72px 1fr;
          }
        }
        .movie-mini__media {
          position: relative;
          height: 140px;
          border-radius: 8px;
          overflow: hidden;
        }
        .movie-mini__body {
          display: grid;
          gap: 6px;
        }
        .movie-mini__title {
          margin: 0;
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          line-height: 1.2;
        }

        .showtime-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .showtime-chip {
          line-height: 1.1;
        }

        .form-select {
          background-color: #1d1f24;
          color: #fff;
          border-color: #2b2e36;
        }
        .form-select:disabled {
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
