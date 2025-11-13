import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";
import { MovieCreateForm } from "@/components/dashboard/movie/MovieCreateForm";

export default async function AdminMovieNewPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations("movie");
  return (
    <>
      <PageHeader title={t("createTitle")} />
      <Spacer />
      <MovieCreateForm locale={locale} />
      <Spacer />
    </>
  );
}
