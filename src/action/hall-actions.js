"use server";

import { revalidatePath } from "next/cache";
import { createHall, updateHall, deleteHall } from "@/service/hall-service";
import { swAlert } from "@/helpers/sweetalert";
import { useTranslations } from "next-intl";


export const createHallAction = async (prevState, formData) => {
  try {
    const locale = formData.get("locale");
    const token = formData.get("token");
    const payload = {
      name: formData.get("name"),
      seatCapacity: parseInt(formData.get("seatCapacity")),
      isSpecial: formData.get("isSpecial") === "true",
      cinemaId: parseInt(formData.get("cinemaId")),
    };
    const res = await createHall(payload, token);

    if (res.httpStatus !== "CREATED" && res.httpStatus !== "OK") {
      return {
        ok: false,
        message: res.message || "Failed to create hall",
        errors: res.errors,
      };
    }
    revalidatePath(`/${locale}/admin/halls`);
    return { ok: true, message: res.message || "Hall created successfully" };
  } catch (err) {
    console.error("Create hall failed:", err);

    if (err.status === 409) {
      return {
        ok: false,
        message: "A hall with this name already exists in the selected cinema.",
      };
    }
    if (err.status === 404) {
      return {
        ok: false,
        message: "Endpoint not found. Check your HALL_API URL.",
      };
    }
    // Diğer hatalar için varsayılan dönüş
    return { ok: false, message: "Failed to create hall" };
  }
};

export const updateHallAction = async (prevState, formData) => {
  try {
    const id = formData.get("id");
    const locale = formData.get("locale");
    const token = formData.get("token");

    const payload = {
      name: formData.get("name"),
      seatCapacity: parseInt(formData.get("seatCapacity")),
      isSpecial: formData.get("isSpecial") === "true",
      cinemaId: parseInt(formData.get("cinemaId")),
    };

    const res = await updateHall(id, payload, token);

    if (!res.ok && res.message)
      return { ok: false, message: res.message, errors: res.errors };

    revalidatePath(`/${locale}/admin/halls`);
    return { ok: true, message: res.message || "Hall updated successfully" };
  } catch (err) {
    console.error("Update hall failed:", err);
    return { ok: false, message: "Failed to update hall" };
  }
};

export const deleteHallAction = async (id, locale, token) => {
  try {
    const res = await deleteHall(id, token);

    if (!res.ok && res.message) return { ok: false, message: res.message };

    revalidatePath(`/${locale}/admin/halls`);
    return { ok: true, message: res.message || "Hall deleted successfully" };
  } catch (err) {
    console.error("Delete hall failed:", err);
    return { ok: false, message: "Failed to delete hall" };
  }
};
