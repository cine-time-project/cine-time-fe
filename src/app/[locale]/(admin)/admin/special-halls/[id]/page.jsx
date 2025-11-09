"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SpecialHallForm from "@/components/dashboard/special-hall/SpecialHallForm";
import { fetchSpecialHallById, updateSpecialHall } from "@/service/special-hall-service";
import { swAlert } from "@/helpers/sweetalert";

export default function SpecialHallEditPage() {
  const { id } = useParams();              // route param (string gelir)
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchSpecialHallById(id);
        if (!alive) return;

        // Gelen response farklı şekillerde olabilir; ikisini de destekleyelim:
        const hallId = String(data?.hallId ?? data?.hall?.id ?? "");
        const typeId = String(data?.typeId ?? data?.type?.id ?? "");

        setItem({ id: String(id), hallId, typeId });
      } finally {
        if (alive) setBusy(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  const handleUpdate = async (fd) => {
    try {
      setBusy(true);
      const hallId = Number(fd.get("hallId"));
      const typeId = Number(fd.get("typeId"));
      await updateSpecialHall(item.id, { hallId, typeId });
      swAlert("success", "Özel salon ataması güncellendi.");
      router.push("/tr/admin/special-halls"); // listeye dön
    } catch (err) {
      swAlert("error", err?.message || "Güncelleme başarısız.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <SpecialHallForm
          key={`${item?.hallId}-${item?.typeId}`}   // güvenli re-render
          initialValues={{ hallId: item?.hallId ?? "", typeId: item?.typeId ?? "" }}
          onSubmit={handleUpdate}
          submitLabel="Güncelle"
          busy={busy}
        />
      </div>
    </div>
  );
}
