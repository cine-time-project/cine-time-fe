import { redirect } from "next/navigation";
export default function AdminIndex({ params: { locale } }) {
  redirect(`/${locale}/admin/dashboard`);
}