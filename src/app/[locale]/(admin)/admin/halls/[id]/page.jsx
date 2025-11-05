"use client";

import { HallEditForm } from "@/components/dashboard/hall/HallEditForm";
import { getHallById } from "@/service/hall-service";
import { useLocale, useTranslations } from "next-intl";
import { getToken } from "@/lib/utils/http";
import { swAlert } from "@/helpers/sweetalert";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";
import { useEffect, useState } from "react";

export default function EditHallPage({ params }) {
  const locale = useLocale();
  const t = useTranslations("hall");
  const { id } = params;

  const [hall, setHall] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHall = async () => {
      try {
        const token = getToken();
        const res = await getHallById(id, token);
        const hallData = res?.returnBody ?? res;
        if (!hallData) throw new Error("Hall not found");
        setHall(hallData);
      } catch (err) {
        console.error("Failed to load hall:", err);
        setError(t("notFound"));
        swAlert(t("notFound"), "error");
      }
    };
    loadHall();
  }, [id, t]);

  if (error) {
    return <div className="p-4 text-danger">{error}</div>;
  }

  if (!hall) {
    return (
      <div className="p-4 text-secondary">{t("loading") || "Loading..."}</div>
    );
  }

  return (
    <>
      <PageHeader title={t("updateTitle")} />
      <Spacer />
      <div className="bg-white p-4 rounded shadow-sm">
        <HallEditForm hall={hall} locale={locale} />
      </div>
      <Spacer />
    </>
  );
}
