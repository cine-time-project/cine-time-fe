"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import ShowtimesForm from "@/components/dashboard/showtimes/ShowtimesForm";
import { getShowtime } from "@/action/showtimes-actions";

export default function ShowtimeEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const locale = useLocale();

  const [initial, setInitial] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getShowtime(id);
        setInitial({
          id: data.id,
          date: data.date,
          startTime: String(data.startTime || "").slice(0, 5),
          endTime: String(data.endTime || "").slice(0, 5),
          hallId: data.hallId,
          movieId: data.movieId,
        });
      } catch (e) {
        setErr(e?.message || "Kayıt bulunamadı.");
      }
    })();
  }, [id]);

  const handleSaved = () => router.replace(`/${locale}/admin/showtimes`);

  if (err) return <div className="alert alert-warning m-3" style={{ whiteSpace: "pre-line" }}>{err}</div>;
  if (!initial) return <div className="p-3">Yükleniyor…</div>;

  return (
    <div className="container-fluid">
      <h1 className="mb-4">Showtime Düzenle</h1>
      <ShowtimesForm mode="edit" initial={initial} onSaved={handleSaved} />
    </div>
  );
}
