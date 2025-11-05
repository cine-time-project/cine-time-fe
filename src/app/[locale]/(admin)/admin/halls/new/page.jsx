"use client";

import { HallCreateForm } from "@/components/dashboard/hall/HallCreateForm";
import { useLocale, useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";

export default function NewHallPage() {
  const locale = useLocale();
  const t = useTranslations("hall");

  return (
    <>
      <PageHeader title={t("createTitle")} />
      <Spacer />
      <div className="bg-white p-4 rounded shadow-sm">
        <HallCreateForm locale={locale} />
      </div>
      <Spacer />
    </>
  );
}
