import ModuleList from "../_ModuleList";

export default function AdminMoviesPage({ params: { locale } }) {
  return <ModuleList title="Movies" basePath={`/${locale}/admin/movies`} locale={locale} />;
}
