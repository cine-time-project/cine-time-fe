"use client";

import { swAlert } from "@/helpers/sweetalert";
import {
  createSpecialHall,
  deleteSpecialHall,
  updateSpecialHall,
} from "@/service/special-hall-service";

export async function createSpecialHallAction(formData) {
  try {
    const hallId = Number(formData.get("hallId"));
    const typeId = Number(formData.get("typeId"));
    if (!hallId || !typeId) throw new Error("Hall ve Special Hall Type seçilmelidir.");
    const resp = await createSpecialHall({ hallId, typeId });
    swAlert("success", "Özel salon ataması oluşturuldu.");
    return { ok: true, data: resp };
  } catch (err) {
    swAlert("error", err?.message || "Kayıt oluşturulamadı.");
    return { ok: false, error: err?.message };
  }
}

export async function updateSpecialHallAction(id, formData) {
  try {
    const hallId = Number(formData.get("hallId"));
    const typeId = Number(formData.get("typeId"));
    if (!hallId || !typeId) throw new Error("Hall ve Special Hall Type seçilmelidir.");
    const resp = await updateSpecialHall(id, { hallId, typeId });
    swAlert("success", "Özel salon ataması güncellendi.");
    return { ok: true, data: resp };
  } catch (err) {
    swAlert("error", err?.message || "Güncelleme başarısız.");
    return { ok: false, error: err?.message };
  }
}

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
