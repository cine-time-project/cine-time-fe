import ModuleList from "../_ModuleList";
export default function AdminShowtimesPage({ params: { locale } }) {
  return <ModuleList title="Showtimes" basePath={`/${locale}/admin/showtimes`} showNew />;
}
