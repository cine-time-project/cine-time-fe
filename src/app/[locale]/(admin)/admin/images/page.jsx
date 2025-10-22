import ModuleList from "../_ModuleList";
export default function AdminImagesPage({ params: { locale } }) {
  return <ModuleList title="Images" basePath={`/${locale}/admin/images`} showNew={false} />;
}
