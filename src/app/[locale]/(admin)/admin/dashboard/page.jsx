"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";

export default function AdminDashboardPage() {
  const { roles = [], loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "tr";

  useEffect(() => {
    if (!loading && roles.length === 0) {
      router.replace(`/${locale}/login?redirect=${pathname}`);
    }
  }, [loading, roles, locale, pathname, router]);

  if (loading) return null;
  // ...
}
