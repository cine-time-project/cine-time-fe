import ModuleList from "../_ModuleList";
export default function AdminDistrictsPage({ params: { locale } }) {
  return <ModuleList title="Districts" basePath={`/${locale}/admin/districts`} showNew />;
}
