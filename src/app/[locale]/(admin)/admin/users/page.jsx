
import ModuleList from "../_ModuleList";
export default function AdminUsersPage({ params: { locale } }) {
  return <ModuleList title="Users" basePath={`/${locale}/admin/users`} showNew />;
}
