"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";              // ⬅️ eklendi
import MovieCard from "@/components/movies/movieDetail/related/MovieCardDP";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Skeleton } from "primereact/skeleton";
import "swiper/css";
import "swiper/css/navigation";
import "./movie-stripe-dp.scss";

import {
  getMoviesByGenre,
  searchMovies,
  getMoviesPaged,
} from "@/services/movie-serviceDP";

export const MovieStripe = ({ movie }) => {
  const tErrors = useTranslations("errors");             // ⬅️ eklendi (errors.unknown için)

  const [items, setItems] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(null);

  // Aktif kaynağı ve sayfayı burada tutuyoruz (sona gelince devam için)
  const [source, setSource] = useState({
    kind: "paged",
    value: "",
    page: 0,
    hasMore: true,
  });

  // Responsive slidesPerView
  const [slidesPerView, setSlidesPerView] = useState(5);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1600) setSlidesPerView(6);
      else if (w >= 1300) setSlidesPerView(5);
      else if (w >= 1024) setSlidesPerView(4);
      else if (w >= 768) setSlidesPerView(3);
      else if (w >= 640) setSlidesPerView(2);
      else setSlidesPerView(1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // İlk denenecek kaynak sırası (öncelik)
  const attempts = useMemo(() => {
    const arr = [];
    const firstGenre =
      movie?.genres?.[0] ||
      (Array.isArray(movie?.genre) ? movie.genre[0] : movie?.genre);
    if (firstGenre) arr.push({ kind: "genre", value: firstGenre });

    if (movie?.director) arr.push({ kind: "search", value: movie.director });
    if (movie?.title) arr.push({ kind: "search", value: movie.title });

    arr.push({ kind: "paged", value: "" }); // fallback
    return arr;
  }, [movie]);

  // Benzersiz ekle + kendisini çıkar
  const mergeUnique = (prev, next) => {
    const seen = new Set(prev.map((m) => m.id ?? m.slug));
    const out = [...prev];
    for (const m of next) {
      const key = m.id ?? m.slug;
      if (!key) continue;
      if (movie?.id && m.id === movie.id) continue;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(m);
      }
    }
    return out;
  };

  // Tek sayfa çek
  async function fetchPage(kind, value, page) {
    if (kind === "genre") return await getMoviesByGenre(value, page, 10);
    if (kind === "search") return await searchMovies(value, page, 10);
    return await getMoviesPaged(page, 10);
  }

  // İlk yük: sırayla dener; ilk sonuçta boyar ve kaynağı set eder
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setInitialLoading(true);
        setError(null);
        setItems([]);

        for (const a of attempts) {
          const data = await fetchPage(a.kind, a.value, 0);
          const content = data?.content || [];
          if (content.length) {
            if (cancelled) return;
            setItems(mergeUnique([], content));
            setSource({
              kind: a.kind,
              value: a.value,
              page: data?.number ?? 0,
              hasMore: (data?.number ?? 0) + 1 < (data?.totalPages ?? 1),
            });
            break;
          }
        }
      } catch (e) {
        console.error(e);
        setError(tErrors("unknown"));            // ⬅️ sadece burası çevrildi
        setSource((s) => ({ ...s, hasMore: false }));
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // attempts değişince yeniden dene
  }, [attempts, tErrors]);                         // ⬅️ tErrors dependency eklendi

  // Sonsuz kaydırma: aynı kaynaktan sayfa sayfa devam
  const handleReachEnd = async () => {
    if (initialLoading || fetchingMore || !source.hasMore) return;
    setFetchingMore(true);
    try {
      const nextPage = (source.page ?? 0) + 1;
      const data = await fetchPage(source.kind, source.value, nextPage);
      const content = data?.content || [];
      setItems((prev) => mergeUnique(prev, content));
      setSource((s) => ({
        ...s,
        page: data?.number ?? nextPage,
        hasMore: ((data?.number ?? nextPage) + 1) < (data?.totalPages ?? 1),
      }));
    } catch (e) {
      console.error(e);
      setSource((s) => ({ ...s, hasMore: false }));
    } finally {
      setFetchingMore(false);
    }
  };

  const renderSkeletons = (n) =>
    Array.from({ length: n }).map((_, i) => (
      <SwiperSlide key={`sk-${i}`} style={{ height: "100%" }}>
        <div className="p-2">
          <Skeleton width="100%" height="250px" borderRadius="1rem" />
          <div className="p-2">
            <Skeleton width="80%" className="mb-2" />
            <Skeleton width="60%" />
          </div>
        </div>
      </SwiperSlide>
    ));

  return (
    <>
      {error && <div className="text-center text-danger py-2">{error}</div>}

      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={10}
        slidesPerGroup={1}
        onReachEnd={handleReachEnd}
        allowTouchMove={false}
        simulateTouch={false}
        style={{ overflow: "visible" }}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 10, slidesPerGroup: 1 },
          640: { slidesPerView: 2, spaceBetween: 15, slidesPerGroup: 2 },
          768: { slidesPerView: 3, spaceBetween: 20, slidesPerGroup: 3 },
          1024: { slidesPerView: 4, spaceBetween: 25, slidesPerGroup: 4 },
          1300: { slidesPerView: 5, spaceBetween: 25, slidesPerGroup: 5 },
          1600: { slidesPerView: 6, spaceBetween: 25, slidesPerGroup: 6 },
        }}
      >
        {initialLoading
          ? renderSkeletons(slidesPerView)
          : items.map((m, i) => (
              <SwiperSlide
                key={m.id ?? m.slug}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  height: "100%",
                  overflow: "visible",
                  position: "relative",
                  zIndex: hovered === i ? 10 : 1,
                }}
              >
                <MovieCard movie={m} />
              </SwiperSlide>
            ))}

        {fetchingMore &&
          renderSkeletons(Math.max(1, Math.floor(slidesPerView / 2)))}
      </Swiper>
    </>
  );
};