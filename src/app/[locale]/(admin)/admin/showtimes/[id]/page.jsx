"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import ShowtimesForm from "@/components/dashboard/showtimes/ShowtimesForm";
import { getShowtime, updateShowtime } from "@/action/showtimes-actions";

export default function ShowtimeEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [initial, setInitial] = useState(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
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
      } catch {
        router.replace("../");
      }
    });
  }, [id, router]);

  const handleSaved = () => router.replace("../");

  if (!initial) return <div className="p-3">Yükleniyor…</div>;

  return (
    <div className="container-fluid">
      <h1 className="mb-4">Showtime Düzenle</h1>
      <ShowtimesForm mode="edit" initial={initial} onSaved={handleSaved} submitting={pending} />
    </div>
  );
}
