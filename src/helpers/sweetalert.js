// src/helpers/sweetalert.js
import Swal from "sweetalert2";

const VALID_ICONS = new Set(["success", "error", "warning", "info", "question"]);

/** Ortak argüman normalizasyonu (alert) */
function normalizeAlertArgs(a, b, c, extra = {}) {
  // Objeli kullanım: swAlert({ title, text, icon, ... })
  if (a && typeof a === "object") {
    const { title = "", text = "", icon = "info", ...rest } = a;
    return {
      title,
      text,
      icon: VALID_ICONS.has(icon) ? icon : "info",
      ...rest,
      ...extra,
    };
  }

  // Eski imzalar:
  // 1) swAlert(title, icon?, text?)
  // 2) swAlert(title, text?, icon?)  <-- bazı yerlerde böyle kullanılmış olabilir
  const title = a ?? "";
  let icon = "info";
  let text = "";

  // 2. argüman ikon mu metin mi?
  if (typeof b === "string" && VALID_ICONS.has(b)) {
    // (title, icon, text?)
    icon = b;
    text = typeof c === "string" ? c : "";
  } else {
    // (title, text, icon?)
    text = typeof b === "string" ? b : "";
    icon = typeof c === "string" && VALID_ICONS.has(c) ? c : "info";
  }

  return { title, text, icon, ...extra };
}

export function swAlert(a, b, c) {
  const opts = normalizeAlertArgs(a, b, c);
  return Swal.fire(opts);
}

/** Ortak argüman normalizasyonu (confirm) */
function normalizeConfirmArgs(a, b, c, d) {
  // Objeli kullanım: swConfirm({ title, text, icon, confirmButtonText, ... })
  if (a && typeof a === "object") {
    const {
      title = "",
      text = "",
      icon = "warning",
      confirmButtonText = "Yes",
      ...rest
    } = a;
    return {
      title,
      text,
      icon: VALID_ICONS.has(icon) ? icon : "warning",
      confirmButtonText,
      showCancelButton: true,
      ...rest,
    };
  }

  // Eski imzalar:
  // 1) swConfirm(title, icon="warning", text="", confirmButtonText="Yes")
  // 2) swConfirm(title, text, confirmButtonText?, icon?)
  const title = a ?? "";

  let icon = "warning";
  let text = "";
  let confirmButtonText = "Yes";

  // 2. argümanda ikon mu metin mi var?
  if (typeof b === "string" && VALID_ICONS.has(b)) {
    // (title, icon, text?, confirmText?)
    icon = b;
    text = typeof c === "string" ? c : "";
    confirmButtonText =
      typeof d === "string" && !VALID_ICONS.has(d) ? d : "Yes";
  } else {
    // (title, text, confirmText?, icon?)
    text = typeof b === "string" ? b : "";
    if (typeof c === "string" && VALID_ICONS.has(c)) {
      icon = c;
    } else if (typeof c === "string") {
      confirmButtonText = c;
    }
    if (typeof d === "string" && VALID_ICONS.has(d)) {
      icon = d;
    }
  }

  return {
    title,
    text,
    icon,
    confirmButtonText,
    showCancelButton: true,
  };
}

export function swConfirm(a, b, c, d) {
  const opts = normalizeConfirmArgs(a, b, c, d);
  return Swal.fire(opts);
}

// İsteğe bağlı kısa yollar (değiştirmeden kullanabilirsiniz)
export const swSuccess = (text, title = "Başarılı") =>
  swAlert({ title, text, icon: "success" });

export const swError = (text, title = "Hata") =>
  swAlert({ title, text, icon: "error" });
