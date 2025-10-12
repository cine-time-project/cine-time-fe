"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { fetchComingSoon } from "@/services/movie-service";
import { getPosterUrl } from "@/services/coming-soon-service";

import { HeroCarousel } from "@/components/comingsoon/HeroCarousel";

import "./comingsoon.scss";

// URL'den page & size okuyan küçük yardımcı hook
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

    fetchComingSoon({ page, size: Math.max(size, 12) })
      .then((data) => {
        if (alive) {
          setAllMovies(data.movies || []);
          setState({ loading: false, error: "", data });
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
      {/* ✅ MODIFIED: Pass movies to carousel instead of fetching inside */}
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
              <p className="font-medium">Hata</p>
              <p className="opacity-90">{state.error}</p>
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
                      <Link
                        key={m.id ?? m.slug}
                        href={`/${locale}/movies/${m.slug || m.id}`}
                        className="link-class"
                      >
                        <article>
                          <div className="aspect-[2/3] w-full bg-zinc-900 flex items-center justify-center">
                            <img
                              src={getPosterUrl(m)}
                              alt={m.title || "Poster"}
                              className="h-full w-full object-cover rounded-t-xl"
                              loading="lazy"
                            />
                          </div>
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
                        </article>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="">
                <PageLink
                  disabled={page <= 1}
                  href={`?page=${page - 1}&size=${size}`}
                >
                  {t("prev")}
                </PageLink>
                <span className="text-sm opacity-80 text-white">
                  {page} / {totalPages}
                </span>
                <PageLink
                  disabled={page >= totalPages}
                  href={`?page=${page + 1}&size=${size}`}
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

// küçük link bileşeni
function PageLink({ disabled, href, children }) {
  if (disabled) {
    return (
      <span className="px-3 py-1.5 text-sm rounded-md border border-zinc-800/60 opacity-50 select-none">
        {children}
      </span>
    );
  }
  return (
    <Link
      className="px-3 py-1.5 text-sm rounded-md border border-zinc-700 hover:border-zinc-500 transition"
      href={href}
      replace
      scroll={false}
    >
      {children}
    </Link>
  );
}
