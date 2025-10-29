"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import ShowtimesForm from "@/components/dashboard/showtimes/ShowtimesForm";
import { getShowtime, updateShowtime } from "@/action/showtimes-actions";

export default function ShowtimeEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    startTransition(async () => {
      const data = await getShowtime(id);
      // form alanlarına uygun objeyi aldık
      setInitial({
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        hallId: data.hallId,
        movieId: data.movieId,
      });
    });
  }, [id]);

  const onSubmit = (values) =>
    startTransition(async () => {
      await updateShowtime(id, values);
      router.push("../"); // listeye dön
    });

  if (!initial) return <div className="p-3">Yükleniyor…</div>;

  return (
    <div className="container-fluid">
      <h1 className="mb-4">Showtime Düzenle</h1>
      <ShowtimesForm initialValues={initial} onSubmit={onSubmit} submitting={loading} />
    </div>
  );
}
