"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SpecialHallForm from "@/components/dashboard/special-hall/SpecialHallForm";
import { createSpecialHallAction } from "@/action/special-hall-actions";

export default function SpecialHallNewPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // ✅ stabil referans
  const initial = useMemo(() => ({ hallId: "", typeId: "" }), []);

  const handleSubmit = async (formData) => {
    setBusy(true);
    const res = await createSpecialHallAction(formData);
    setBusy(false);
    if (res?.ok) router.back();
  };

  return (
    <div className="container py-4">
      <h2>New Special Hall</h2>
      <div className="card shadow-sm mt-3">
        <SpecialHallForm initialValues={initial} onSubmit={handleSubmit} busy={busy} submitLabel="Oluştur" />
      </div>
    </div>
  );
}
