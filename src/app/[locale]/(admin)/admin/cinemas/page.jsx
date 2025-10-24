import ModuleList from "../_ModuleList";
export default function AdminCinemasPage({ params: { locale } }) {
  return <ModuleList title="Cinemas" basePath={`/${locale}/admin/cinemas`} showNew />;
}
