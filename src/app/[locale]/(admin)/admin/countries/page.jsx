import ModuleList from "../_ModuleList";
export default function AdminCountriesPage({ params: { locale } }) {
  return <ModuleList title="Countries" basePath={`/${locale}/admin/countries`} showNew />;
}
