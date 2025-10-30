"use client";

import { useEffect, useTransition, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ShowtimesForm from "@/components/dashboard/showtimes/ShowtimesForm";
import { getShowtime, updateShowtime } from "@/action/showtimes-actions";

export default function ShowtimeEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getShowtime(id);
        setInitial({
          date: data.date,
          startTime: String(data.startTime || "").slice(0,5),
          endTime: String(data.endTime || "").slice(0,5),
          hallId: data.hallId,
          movieId: data.movieId,
          id: data.id,
        });
      } catch (e) {
        alert("Kayıt bulunamadı.");
        router.push("../");
      }
    });
  }, [id, router]);

  const handleSaved = () => router.push("../");

  if (!initial) return <div className="p-3">Yükleniyor…</div>;

  return (
    <div className="container-fluid">
      <h1 className="mb-4">Showtime Düzenle</h1>
      <ShowtimesForm mode="edit" initial={initial} onSaved={handleSaved} submitting={isPending}/>
    </div>
  );
}
