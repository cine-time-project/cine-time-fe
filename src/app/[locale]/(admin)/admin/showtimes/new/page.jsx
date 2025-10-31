"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import ShowtimesForm from "@/components/dashboard/showtimes/ShowtimesForm";
import SectionTitle from "@/components/common/SectionTitle";

export default function ShowtimeNewPage() {
  const router = useRouter();
  const locale = useLocale();

  const handleSaved = () => router.replace(`/${locale}/admin/showtimes`);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <SectionTitle align="center" textColor="text-light">Yeni Showtime</SectionTitle>
        <h1 className="m-0" />
      </div>
      <ShowtimesForm mode="create" onSaved={handleSaved} />
    </div>
  );
}
