"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import ShowtimesForm from "@/components/dashboard/showtimes/ShowtimesForm";

export default function ShowtimeNewPage() {
  const router = useRouter();
  const locale = useLocale();

  const handleSaved = () => {
    // Göreli yerine locale'li absolute path
    router.replace(`/${locale}/admin/showtimes`);
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0">Yeni Showtime</h1>
      </div>
      <ShowtimesForm mode="create" onSaved={handleSaved} />
    </div>
  );
}
