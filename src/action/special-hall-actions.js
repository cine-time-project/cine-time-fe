// src/action/special-hall-actions.js
"use client";

import { swAlert } from "@/helpers/sweetalert";
import {
  createSpecialHall,
  updateSpecialHall,
  deleteSpecialHall,
} from "@/service/special-hall-service";

/** CREATE */
export async function createSpecialHallAction(formData) {
  try {
    const hallId = Number(formData.get("hallId"));
    const typeId = Number(formData.get("typeId"));
    if (!hallId || !typeId) throw new Error("Hall ve Özel Salon Tipi seçilmelidir.");
    const resp = await createSpecialHall({ hallId, typeId });
    swAlert("success", "Özel salon ataması oluşturuldu.");
    return { ok: true, data: resp };
  } catch (err) {
    swAlert("error", err?.message || "Kayıt oluşturulamadı.");
    return { ok: false, error: err?.message };
  }
}

/** UPDATE */
export async function updateSpecialHallAction(id, formData) {
  try {
    const hallId = Number(formData.get("hallId"));
    const typeId = Number(formData.get("typeId"));
    if (!hallId || !typeId) throw new Error("Hall ve Özel Salon Tipi seçilmelidir.");
    const resp = await updateSpecialHall(id, { hallId, typeId });
    swAlert("success", "Özel salon ataması güncellendi.");
    return { ok: true, data: resp };
  } catch (err) {
    swAlert("error", err?.message || "Güncelleme başarısız.");
    return { ok: false, error: err?.message };
  }
}

/** DELETE */
export async function deleteSpecialHallAction(id) {
  try {
    await deleteSpecialHall(id);
    swAlert("success", "Kayıt silindi.");
    return { ok: true };
  } catch (err) {
    swAlert("error", err?.message || "Silme işlemi başarısız.");
    return { ok: false, error: err?.message };
  }
}
