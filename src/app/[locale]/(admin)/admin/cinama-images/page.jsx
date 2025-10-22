import ModuleList from "../_ModuleList";
export default function AdminCinemaImagesPage({ params: { locale } }) {
  return <ModuleList title="Cinema Images" basePath={`/${locale}/admin/cinema-images`} showNew={false} />;
}
