// components/contact/WhatsAppFab.jsx
"use client";
import { config } from "@/helpers/config";
import { useTranslations } from "next-intl";
import Image from "next/image";
import "./WhatsAppFab.scss";

export default function WhatsAppFab() {
  // feature flag kapalıysa gösterme
  if (!config.features?.whatsapp) return null;

  const t = useTranslations("contact");

  // numara yoksa gösterme
  const raw = config.contact?.whatsapp?.number || "";
  const number = raw.replace(/\D/g, "");
  if (!number) return null;

  const text = encodeURIComponent(
    config.contact?.whatsapp?.defaultText || t("defaultText")
  );
  const href = `https://wa.me/${number}?text=${text}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-fab"
      aria-label={t("ctaWhatsAppShort")}
      title={t("ctaWhatsAppShort")}
    >
      <span className="wa-icon-wrap" aria-hidden="true">
        <Image
          src="/icons/WhatsApp.png"   // <-- tam dosya adı (case-sensitive)
          alt=""
          width={24}
          height={24}
          className="wa-icon-img"
          priority
        />
      </span>

      <span className="wa-label">{t("ctaWhatsAppShort")}</span>
    </a>
  );
}
