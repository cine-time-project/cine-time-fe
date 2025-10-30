
import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";
import { MovieCreateForm } from "@/components/dashboard/movie/MovieCreateForm";

export default async function AdminMovieNewPage({ params }) {
  const { locale } = await params;
  return (
    <>
      <PageHeader title="New Movie" />
      <Spacer />
      <MovieCreateForm locale={locale} />
      <Spacer />
    </>
  );
}
