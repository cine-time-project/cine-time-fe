// app/(public)/movies/[slug]/page.jsx
import MovieHero from "@/components/movies/movieDetail/MovieHero";
import DetailsTabs from "@/components/movies/movieDetail/DetailsTabs";

const mockMovie = {
  id: 1,
  title: "Guglhupfgeschwader",
  slug: "guglhupfgeschwader",
  summary:
    "In GUGLHUPFGESCHWADER, der achten Rita Falk-Verfilmung des ErfolgsduoIn GUGLHUPFGESCHWADER, der achten Rita Falk-Verfilmung des ErfolgsduosIn GUGLHUPFGESCHWADER, der achten Rita Falk-Verfilmung des ErfolgsduosIn GUGLHUPFGESCHWADER, der achten Rita Falk-Verfilmung des Erfolgsduoss ...",
  releaseYear: 2022,
  duration: 93,
  rating: 6.4,
  genres: ["Komödie"],
  director: "Ed Herzog",
  cast: ["Sebastian Bezzel", "Simon Schwarz", "Stefanie Reinsperger"],
  formats: ["X-RAY"],
  specialHalls: "IMAX, 3D",
  status: "IN_THEATRES",
  posterUrl: "/images/hero/avatar-pandora-film-IMAGO.jpg",
  backdropUrl: "/images/hero/avatar-pandora-film-IMAGO.jpg",
  releaseDate: "2022-08-01",
};

export default function MovieDetailsPage() {
  const movie = mockMovie;

  return (
    <>
      <MovieHero movie={movie} />
      {/* siyah zemin + sekmeler + içerik */}
      <DetailsTabs movie={movie} />
    </>
  );
}
