import ModuleList from "../_ModuleList";
export default function AdminRolesPage({ params: { locale } }) {
  return <ModuleList title="Roles" basePath={`/${locale}/admin/roles`} showNew />;
}
