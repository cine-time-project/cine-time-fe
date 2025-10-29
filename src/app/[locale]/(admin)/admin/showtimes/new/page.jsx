"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import ShowtimesForm from "@/components/dashboard/showtimes/ShowtimesForm";
import { createShowtime } from "@/action/showtimes-actions";

export default function ShowtimeNewPage() {
  const router = useRouter();
  const [submitting, startTransition] = useTransition();

  const initial = {
    date: "",
    startTime: "",
    endTime: "",
    hallId: "",
    movieId: "",
  };

  const onSubmit = (values) =>
    startTransition(async () => {
      await createShowtime(values);
      router.push("../"); // listeye geri dön
    });

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0">Yeni Showtime</h1>
      </div>
      <ShowtimesForm initialValues={initial} onSubmit={onSubmit} submitting={submitting} />
    </div>
  );
}
