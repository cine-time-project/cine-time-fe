"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/page-header/PageHeader";
import Spacer from "@/components/common/Spacer";
import { ImageCreateForm } from "@/components/dashboard/images/ImageCreateForm";

export default function AdminImageNewPage({ params }) {
  const { locale } = React.use(params);
  const t = useTranslations("images.new");

  return (
    <>
      <PageHeader title={t("title")} />
      <Spacer />
      <ImageCreateForm locale={locale} />
      <Spacer />
    </>
  );
}
