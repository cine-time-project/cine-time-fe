"use client";

import dynamic from "next/dynamic";
import SectionTitle from "../common/SectionTitle";
import { useTranslations } from "next-intl";


// Harita component’ini sadece client-side render et
const NearbyCinemasLeaflet = dynamic(
  () => import("./NearbyCinemasLeaflet"),
  { ssr: false }
);

export default function NearbyCinemasMapWrapper() {
  const tCinema = useTranslations("cinemas");
  return (
    <div className="">
      <SectionTitle>{tCinema("findMore")}</SectionTitle>
      <NearbyCinemasLeaflet />
    </div>
  );
}
