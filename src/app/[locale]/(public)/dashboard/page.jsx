import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./_DashboardClient"; // az sonra

export default function Page({ params: { locale } }) {
  const raw = cookies().get("authRoles")?.value || "";
  const roles = raw
    .split(/[\s,]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  // Girişsiz kullanıcıyı login'e gönder
  if (roles.length === 0) {
    redirect(`/${locale}/login?redirect=/${locale}/dashboard`);
  }

  // MEMBER'ı direkt account'a gönder (flicker yok)
  if (roles.includes("MEMBER")) {
    redirect(`/${locale}/account`);
  }

  // ADMIN / EMPLOYEE dashboard'ı görür
  return <DashboardClient locale={locale} />;
}
