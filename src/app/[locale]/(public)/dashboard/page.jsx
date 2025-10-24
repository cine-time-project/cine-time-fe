import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./_DashboardClient";

export default function Page({ params: { locale } }) {
  const raw = cookies().get("authRoles")?.value || "";
  const roles = raw.split(/[\s,]+/).map(s => s.toUpperCase()).filter(Boolean);

  if (roles.length === 0) redirect(`/${locale}/login?redirect=/${locale}/dashboard`);
  if (roles.includes("MEMBER")) redirect(`/${locale}/account`);

  return <DashboardClient locale={locale} />;
}
