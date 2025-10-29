import ModuleList from "../_ModuleList";
export default async function AdminCinemasPage({ params }) {
  const { locale } = await params;
  return <ModuleList title="Cinemas" basePath={`/${locale}/admin/cinemas`} showNew />;
}
