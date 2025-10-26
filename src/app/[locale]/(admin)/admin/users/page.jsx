import ModuleList from "../_ModuleList";

export default function AdminUsersPage({ params: { locale } }) {
  return (
    <ModuleList
      title="Users"
      basePath={`/${locale}/admin/users`}
      showNew
      createRoles={["ADMIN", "EMPLOYEE"]}  // + New: Admin + Employee
      detailRoles={["ADMIN", "EMPLOYEE"]}  // Detay/Düzenle linki: Admin + Employee
    />
  );
}
