import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";
import { MovieEditForm } from "@/components/dashboard/movie/MovieEditForm";
import { getMovieById } from "@/service/movie-service";

export default async function AdminEditMoviePage({ params }) {
  const { locale, id } = await params;
  const res = await getMovieById(id);
  const movie = await res.json();

  return (
    <>
      <PageHeader title="Edit Movie" />
      <Spacer />
      <MovieEditForm movie={movie} locale={locale} />
      <Spacer />
    </>
  );
}
