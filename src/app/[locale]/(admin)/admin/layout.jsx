import {setRequestLocale} from "next-intl/server";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({ children, params }) {
  const { locale } = await params;     // ← Next.js 
  setRequestLocale(locale);
  return <AdminShell locale={locale}>{children}</AdminShell>;
}
