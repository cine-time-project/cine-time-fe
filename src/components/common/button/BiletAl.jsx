"use client";
import { useTranslations } from "next-intl";

export default function BiletAl({
  ns = "nav",            // ← varsayılan namespace
  i18nKey = "buy",       // ← varsayılan key
  defaultLabel = "Bilet Al",
  label,                 // isteğe bağlı: metni manuel geçmek istersen
  onClick,
  href,
  disabled = false,
  className = "",
  children,
  ...rest
}) {
  const t = useTranslations(ns);

  // Öncelik: children > label > i18n(nav.buy) > fallback
  const text =
    (typeof children === "string" && children) ||
    label ||
    t(i18nKey, { default: defaultLabel });

  const common = {
    className: `btn-bilet ${className}`,
    "aria-label": text,
    ...rest,
  };

  if (href) {
    return (
      <a
        href={href}
        {...common}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
        aria-disabled={disabled}
      >
        {text}
      </a>
    );
  }

  return (
    <button type="button" {...common} onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
}
