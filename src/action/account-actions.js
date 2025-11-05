"use client";

import { http, authHeaders } from "@/lib/utils/http";
import {
  USER_INFORMATION_API,
  USER_AUTH_PUT_API,
  USER_AUTH_DELETE_API,
  USER_RESET_PASSWORD_API,
} from "@/helpers/api-routes";

/* helpers */
const unwrap = (r) => r?.returnBody ?? r?.data ?? r ?? null;

function pickValidationMessage(err) {
  const d = err?.response?.data;
  if (!d) return null;
  const bags = [d.errors, d.validations, d.validationErrors, d.details, d.fieldErrors];
  for (const bag of bags) {
    if (!bag) continue;
    if (Array.isArray(bag) && bag.length) {
      return bag
        .map((x) => (x?.field ? `${x.field}: ${x.message || x.defaultMessage || ""}` : String(x)))
        .join("\n");
    }
    if (typeof bag === "object") {
      return Object.entries(bag).map(([k, v]) => `${k}: ${v}`).join("\n");
    }
  }
  return d.message || null;
}

/* actions */
export async function fetchMyInfoAction() {
  try {
    const { data } = await http.get(USER_INFORMATION_API, { headers: authHeaders() });
    return { ok: true, data: unwrap(data) };
  } catch (err) {
    return { ok: false, error: err?.response?.data?.message ?? err?.message ?? "Fetch failed" };
  }
}

export async function updateMyInfoAction(payload) {
  try {
    const { data } = await http.put(USER_AUTH_PUT_API, payload, { headers: authHeaders() });
    return { ok: true, data: unwrap(data) };
  } catch (err) {
    return { ok: false, error: pickValidationMessage(err) ?? err?.message ?? "Update failed" };
  }
}

// Opsiyonel (forgot/reset by email akışı için)
export async function resetMyPasswordAction(payload) {
  try {
    const { data } = await http.post(USER_RESET_PASSWORD_API, payload, { headers: authHeaders() });
    return { ok: true, data: unwrap(data) };
  } catch (err) {
    return { ok: false, error: pickValidationMessage(err) ?? err?.message ?? "Reset failed" };
  }
}

export async function deleteMyAccountAction() {
  try {
    const { data } = await http.delete(USER_AUTH_DELETE_API, { headers: authHeaders() });
    return { ok: true, data: unwrap(data) };
  } catch (err) {
    return { ok: false, error: pickValidationMessage(err) ?? err?.message ?? "Delete failed" };
  }
}

// Auth kullanıcısının şifresini günceller (UserUpdateRequest.password)
export async function changeMyPasswordAction(newPassword) {
  try {
    const { data } = await http.put(
      USER_AUTH_PUT_API,
      { password: newPassword },
      { headers: authHeaders() }
    );
    return { ok: true, data: unwrap(data) };
  } catch (err) {
    return { ok: false, error: pickValidationMessage(err) ?? err?.message ?? "Password change failed" };
  }
}
