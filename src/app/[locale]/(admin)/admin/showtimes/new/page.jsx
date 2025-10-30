"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import ShowtimesForm from "@/components/dashboard/showtimes/ShowtimesForm";
import { createShowtime } from "@/action/showtimes-actions";

export default function ShowtimeNewPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initial = { date: "", startTime: "", endTime: "", hallId: "", movieId: "" };

  const handleSaved = () => router.push("../"); // listeye dön

  const onSubmit = (values) => startTransition(async () => {
    await createShowtime(values);
    handleSaved();
  });

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0">Yeni Showtime</h1>
      </div>
      <ShowtimesForm mode="create" initial={initial} onSaved={handleSaved} submitting={isPending} onSubmit={onSubmit}/>
    </div>
  );
}
