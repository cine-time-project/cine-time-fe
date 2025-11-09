"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SpecialHallForm from "@/components/dashboard/special-hall/SpecialHallForm";
import { fetchSpecialHallById } from "@/service/special-hall-service";
import { updateSpecialHallAction } from "@/action/special-hall-actions";
import { Spinner } from "react-bootstrap";

export default function SpecialHallEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [initial, setInitial] = useState({ hallId: "", typeId: "" });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const detail = await fetchSpecialHallById(id);
        if (!mounted) return;
        // Backend response: { id, name(type), seatCapacity, cinemaId, cinemaName }
        // Edit için hallId ve typeId gerekir → backend getById bunları döndürmüyorsa
        // detail endpointini genişletmen iyi olur. Şimdilik formu boş bırakmayalım diye:
        // (Hall ve Type ID’lerini bilmeden update etmek doğru olmaz)
        // Eğer BE’de SpecialHallResponse’a hallId ve typeId eklersen süper olur.
        setInitial({
          hallId: detail?.hallId ?? "",
          typeId: detail?.typeId ?? "",
        });
      } finally {
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  const handleSubmit = async (formData) => {
    setBusy(true);
    const res = await updateSpecialHallAction(id, formData);
    setBusy(false);
    if (res?.ok) router.back();
  };

  if (loading) {
    return (
      <div className="container py-4">
        <Spinner size="sm" /> Yükleniyor…
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2>Edit Special Hall #{id}</h2>
      <div className="card shadow-sm mt-3">
        <SpecialHallForm
          initialValues={initial}
          onSubmit={handleSubmit}
          busy={busy}
          submitLabel="Güncelle"
        />
      </div>
    </div>
  );
}
