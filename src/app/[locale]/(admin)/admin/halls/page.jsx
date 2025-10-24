import ModuleList from "../_ModuleList";
export default function AdminHallsPage({ params: { locale } }) {
  return <ModuleList title="Halls" basePath={`/${locale}/admin/halls`} showNew />;
}
