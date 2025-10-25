import MovieHero from "@/components/movies/movieDetail/MovieHero";
import DetailsTabs from "@/components/movies/movieDetail/DetailsTabs";
import { notFound, redirect } from "next/navigation";
import { getMovieById, getMovieBySlug, searchMovies } from "@/services/movie-serviceDP";

export const revalidate = 0;

function tailId(s){ const m = String(s).match(/(\d{3,})$/); return m ? Number(m[1]) : null; }

async function resolveMovie(seg) {
  // 1) tamamen sayı -> ID
  if (/^\d+$/.test(seg)) return await getMovieById(Number(seg));

  // 2) metin -> SLUG endpoint
  const bySlug = await getMovieBySlug(seg).catch(() => null);
  if (bySlug?.id) return bySlug;

  // 3) slug+id olabilir -> sondaki id
  const id = tailId(seg);
  if (id) {
    const byId = await getMovieById(id).catch(() => null);
    if (byId?.id) return byId;
  }

  // 4) son çare: search
  const page = await searchMovies(seg, 0, 1).catch(() => null);
  return page?.content?.[0] ?? null;
}

export default async function Page({ params }) {
  const {locale, slug} = await params;
  const movie = await resolveMovie(slug);
  if (!movie) notFound();

  // Kanonik yönlendirme: id veya slug+id ile gelindiyse düz slug'a taşı
  const isPureId = /^\d+$/.test(slug);
  const hasTailId = /-\d{3,}$/.test(slug);
  if ((isPureId || hasTailId) && movie.slug && movie.slug !== slug) {
    redirect(`/${locale}/movies/${movie.slug}`);
  }

  return (
    <>
      <MovieHero movie={movie} />
      <DetailsTabs movie={movie} />
    </>
  );
}