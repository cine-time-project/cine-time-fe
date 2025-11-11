"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import SpecialHallForm from "@/components/dashboard/special-hall/SpecialHallForm";
import { createSpecialHallAction } from "@/action/special-hall-actions";

export default function SpecialHallNewPage() {
  const router = useRouter();
  const tSH = useTranslations("specialHall");
  const tCommon = useTranslations("common");
  const [busy, setBusy] = useState(false);

  const initial = useMemo(() => ({ hallId: "", typeId: "" }), []);

  const handleSubmit = async (formData) => {
    setBusy(true);
    const res = await createSpecialHallAction(formData);
    setBusy(false);
    if (res?.ok) router.back();
  };

  return (
    <div className="container py-4">
      <h2 className="fw-semibold mb-4 text-white">{tSH("new.title")}</h2>
      <div className="card shadow-sm mt-3">
        <SpecialHallForm
          initialValues={initial}
          onSubmit={handleSubmit}
          busy={busy}
          submitLabel={tCommon("create")}
        />
      </div>
    </div>
  );
}
