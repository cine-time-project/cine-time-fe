"use client";

// ...existing code...
import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NearbyCinemasMapWrapper from "@/components/cinemas/NearbyCinemasMapWrapper";

import CinemasGrid from "@/components/cinemas/CinemasGrid";
import { useTranslations } from "next-intl";

import styles from "@/components/cinemas/cinemas.module.scss";
import SectionTitle from "@/components/common/SectionTitle";
import Spacer from "@/components/common/Spacer";

export default function CinemasPage() {
  const pathname = usePathname() || "/";
  const locale = pathname.split("/")[1] || "tr";
  const sp = useSearchParams();
  const cityFilter = sp.get("city") || "";

  const t = useTranslations ? useTranslations("cinemas") : () => (k) => k;

  const L = (rest = "") =>
    rest ? `/${locale}/${rest.replace(/^\/+/, "")}` : `/${locale}`;

  return (
    <div className={`container py-4 ${styles.cinemasPage}`}>
      <SectionTitle>{t("cinemas")}</SectionTitle>

      <CinemasGrid cityFilter={cityFilter} L={L} />
      <Spacer/>
      <NearbyCinemasMapWrapper />
    </div>
  );
}