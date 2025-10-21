"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { getComingSoonMovies } from "@/services/movie-serviceDP";
import { getPosterUrl } from "@/services/coming-soon-service";
import { HeroCarousel } from "@/components/comingsoon/HeroCarousel";
import "./comingsoon.scss";

function usePageAndSize() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || "1");
  const size = Number(searchParams.get("size") || "12");
  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    size: Number.isFinite(size) && size > 0 ? size : 12,
  };
}

export default function ComingSoonPage() {
  const t = useTranslations("comingSoon");
  const locale = useLocale();
  const { page, size } = usePageAndSize();

  const [allMovies, setAllMovies] = useState([]);
  const [state, setState] = useState({
    loading: true,
    error: "",
    data: { movies: [], page, size, totalPages: 1, totalElements: 0 },
  });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: "" }));

    getComingSoonMovies(undefined, page - 1, size)
      .then((data) => {
        if (alive) {
          setAllMovies(data.content || []);
          setState({
            loading: false,
            error: "",
            data: {
              movies: data.content || [],
              page: (data.number ?? 0) + 1,
              size: data.size ?? size,
              totalPages: data.totalPages ?? 1,
              totalElements: data.totalElements ?? 0,
            },
          });
        }
      })
      .catch((err) => {
        if (alive)
          setState((s) => ({
            ...s,
            loading: false,
            error: err?.message || "Unknown error",
          }));
      });

    return () => {
      alive = false;
    };
  }, [page, size]);

  const { movies, totalPages } = state.data;

  return (
    <>
      <HeroCarousel movies={allMovies.slice(0, 4)} />

      <section className="center-container py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="h1-title">{t("heading")}</h1>
        <div className="comingsoon-card">
          {state.loading && (
            <div className="flex justify-center">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl border border-zinc-800/50 p-2 bg-black/30"
                  >
                    <div className="h-64 w-full rounded-lg bg-zinc-800/60" />
                    <div className="mt-3 h-4 w-3/4 bg-zinc-800/60 rounded" />
                    <div className="mt-2 h-4 w-1/2 bg-zinc-800/60 rounded" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!state.loading && state.error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-sm text-white text-center">
              <p className="font-medium">{t("error") || "Error"}</p>
              <p className="opacity-90">{state.error}</p>
              <p className="text-xs mt-2 opacity-60">
                {t("apiConnectionCheck")}{" "}
                {process.env.NEXT_PUBLIC_API_BASE ||
                  "http://localhost:8090/api"}
              </p>
            </div>
          )}

          {!state.loading && !state.error && (
            <>
              {movies.length === 0 ? (
                <p className="opacity-80 text-center text-white">
                  {t("noItems")}
                </p>
              ) : (
                <div className="flex justify-center">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
                    {movies.map((m) => (
                      <div key={m.id ?? m.slug} className="movie-item">
                        <article style={{ position: "relative" }}>
                          <Link
                            href={`/${locale}/movies/${m.slug || m.id}`}
                            className="link-class"
                          >
                            <div className="aspect-[2/3] w-full bg-zinc-900 flex items-center justify-center">
                              <img
                                src={getPosterUrl(m)}
                                alt={m.title || "Poster"}
                                className="h-full w-full object-cover rounded-t-xl"
                                loading="lazy"
                              />
                            </div>
                          </Link>

                          <div className="movie-actions">
                            <Link
                              href={`/${locale}/movies/showtimes/${m.id}`}
                              className="movie-buy-btn"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {t("bookNow")}
                            </Link>

                            <button
                              className="movie-btn movie-favorite-btn"
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Add favorite functionality here
                                console.log(
                                  `Toggle favorite for movie ${m.id}`
                                );
                              }}
                            >
                              <span style={{ marginRight: 6 }}>♥</span>
                              {t("favorite")}
                            </button>

                            {m.trailerUrl && (
                              <button
                                className="movie-trailer-btn"
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  window.open(m.trailerUrl, "_blank");
                                }}
                              >
                                <span
                                  style={{
                                    marginRight: 6,
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  ▶
                                </span>
                                {t("trailer")}
                              </button>
                            )}
                          </div>

                          <Link
                            href={`/${locale}/movies/${m.slug || m.id}`}
                            className="link-class"
                          >
                            <div className="p-4">
                              <h3 className="text-lg font-semibold text-white tracking-wide mb-1 line-clamp-2">
                                {m.title}
                              </h3>
                              <p className="text-xs text-yellow-300 mb-1">
                                {m.releaseDate
                                  ? new Intl.DateTimeFormat(locale, {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }).format(new Date(m.releaseDate))
                                  : t("releaseTBA")}
                              </p>
                              {m.genre && (
                                <p className="text-xs text-gray-300">
                                  {t("genre")}:{" "}
                                  {Array.isArray(m.genre)
                                    ? m.genre.join(", ")
                                    : m.genre}
                                </p>
                              )}
                              {m.formats?.length > 0 && (
                                <p className="text-xs text-gray-400">
                                  {t("formats")}: {m.formats.join(", ")}
                                </p>
                              )}
                            </div>
                          </Link>
                        </article>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pagination-container">
                <PageLink
                  disabled={page <= 1}
                  href={`?page=${page - 1}&size=${size}`}
                  className="page-link"
                >
                  {t("prev")}
                </PageLink>
                <span className="page-number">
                  {page} / {totalPages}
                </span>
                <PageLink
                  disabled={page >= totalPages}
                  href={`?page=${page + 1}&size=${size}`}
                  className="page-link"
                >
                  {t("next")}
                </PageLink>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function PageLink({ disabled, href, children, className }) {
  if (disabled) {
    return (
      <span className={className + " disabled"} aria-disabled="true">
        {children}
      </span>
    );
  }
  return (
    <Link className={className} href={href} replace scroll={false}>
      {children}
    </Link>
  );
}
