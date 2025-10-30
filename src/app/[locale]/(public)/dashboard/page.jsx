import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./_DashboardClient";

export default async function Page({ params }) {
  const { locale } = await params; // Next.js 15.5 değişikliği

  // cookies() artık Promise döndürüyor
  const cookieStore = await cookies();
  const raw = cookieStore.get("authRoles")?.value || "";

  const roles = raw
    .split(/[\s,]+/)
    .map((s) => s.toUpperCase())
    .filter(Boolean);

  // Rollere göre yönlendirme
  if (roles.length === 0) {
    redirect(`/${locale}/login?redirect=/${locale}/dashboard`);
  }

  if (roles.includes("MEMBER")) {
    redirect(`/${locale}/account`);
  }

  // Dashboard client’ı render et
  return <DashboardClient locale={locale} />;
}
