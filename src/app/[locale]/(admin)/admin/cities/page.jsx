import ModuleList from "../_ModuleList";
export default function AdminCitiesPage({ params: { locale } }) {
  return <ModuleList title="Cities" basePath={`/${locale}/admin/cities`} showNew />;
}
