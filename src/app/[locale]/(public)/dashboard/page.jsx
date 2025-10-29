import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "./_DashboardClient";
import React from "react";

export default async function Page({ params }) {
  const { locale } = await params; // ✅ no need for React.use
  const cookieStore = await cookies(); // ✅ await cookies()
  const raw = cookieStore.get("authRoles")?.value || "";
  const roles = raw.split(/[\s,]+/).map(s => s.toUpperCase()).filter(Boolean);

  if (roles.length === 0) {
    redirect(`/${locale}/login?redirect=/${locale}/dashboard`);
  }

  if (roles.includes("MEMBER")) {
    redirect(`/${locale}/account`);
  }

  return <DashboardClient locale={locale} />;
}
