import ModuleList from "../_ModuleList";
export default function AdminFavoritePage({ params: { locale } }) {
  return <ModuleList title="Favorites" basePath={`/${locale}/admin/favorites`} showNew />;
}
