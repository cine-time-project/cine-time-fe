import {setRequestLocale} from "next-intl/server";
import AdminShell from "@/components/admin/AdminShell";

export default function AdminLayout({children, params}) {
  const {locale} = params;
  // v3 API
  setRequestLocale(locale);

  return <AdminShell locale={locale}>{children}</AdminShell>;
}
