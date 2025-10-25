import ModuleList from "../_ModuleList";
export default function AdminPaymentsPage({ params: { locale } }) {
  return <ModuleList title="Payments" basePath={`/${locale}/admin/payments`} showNew />;
}
