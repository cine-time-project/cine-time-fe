// app/(public)/movies/[slug]/page.jsx
import MovieHero from "@/components/movies/movieDetail/MovieHero";
import DetailsTabs from "@/components/movies/movieDetail/DetailsTabs";
import { getMovieById, searchMovies } from "@/services/movie-serviceDP";
import { notFound } from "next/navigation";

// bu sayfanın server-side fetch'lerinde cache kullanmayalım (dev için güvenli)
export const revalidate = 0;

// slug şu şekillerde gelebilir:
//  - "1959" (sadece ID)  → /api/movies/id/1959
//  - "play-dirty-2025-941109" (metin + id sondaysa) → sondaki numarayı al
//  - "avatar-the-way-of-water" (sadece metin) → search ile ilk kaydı al (fallback)
async function loadMovieBySlug(slug) {
  // 1) tamamen sayı ise direkt ID
  if (/^\d+$/.test(slug)) {
    const m = await getMovieById(Number(slug));
    return m;
  }

  // 2) sonda id benzeri sayı varsa onu dene
  const tailId = slug.match(/(\d{3,})$/)?.[1];
  if (tailId) {
    try {
      const m = await getMovieById(Number(tailId));
      if (m?.id) return m;
    } catch {}
  }

  // 3) fallback: arama ile ilk eşleşeni al
  const res = await searchMovies(slug, 0, 1);
  const first = res?.content?.[0];
  if (first) return first;

  return null;
}

export default async function MovieDetailsPage({ params }) {
  const slug = params?.slug;
  const movie = await loadMovieBySlug(slug);

  if (!movie) {
    notFound();
  }

  return (
    <>
      <MovieHero movie={movie} />
      {/* alt içerik/sekme; STRIPE'A DOKUNMADIK */}
      <DetailsTabs movie={movie} />
    </>
  );
}
