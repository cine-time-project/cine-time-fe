"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import SpecialHallForm from "@/components/dashboard/special-hall/SpecialHallForm";
import {
  fetchSpecialHallById,
  updateSpecialHall,
} from "@/service/special-hall-service";
import { swAlert } from "@/helpers/sweetalert";

export default function SpecialHallEditPage() {
  const { id } = useParams(); 
  const router = useRouter();
  const locale = useLocale();

  const tSH = useTranslations("specialHall");
  const tCommon = useTranslations("common");

  const [item, setItem] = useState(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchSpecialHallById(id);

        if (!alive) return;

        // Eski/yeni BE şemaları için güvenli map
        const hallId = String(data?.hallId ?? data?.hall?.id ?? "");
        const typeId = String(data?.typeId ?? data?.type?.id ?? "");

        setItem({ id: String(id), hallId, typeId });
      } finally {
        if (alive) setBusy(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const handleUpdate = async (fd) => {
    try {
      setBusy(true);
      const hallId = Number(fd.get("hallId"));
      const typeId = Number(fd.get("typeId"));

      await updateSpecialHall(item.id, { hallId, typeId });

      swAlert("success", tSH("edit.updated")); 
      router.push(`/${locale}/admin/special-halls`);
    } catch (err) {
      swAlert("error", err?.message || tCommon("errors.updateFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
   <h2 className="fw-semibold mb-4 text-white">{tSH("updateTitle")}</h2>

    <div className="card shadow-sm">
      
      <div className="card-body">
        <SpecialHallForm
          key={`${item?.hallId}-${item?.typeId}`} 
          initialValues={{
            hallId: item?.hallId ?? "",
            typeId: item?.typeId ?? "",
          }}
          onSubmit={handleUpdate}
          submitLabel={tCommon("update")}
          busy={busy}
        />
      </div>
    </div></>
  );
}
