"use server";

import { revalidatePath } from "next/cache";
import { createHall, updateHall, deleteHall } from "@/service/hall-service";
import { swAlert } from "@/helpers/sweetalert";
import { useTranslations } from "next-intl";
import { config } from "@/helpers/config";
import { HallSchema } from "@/helpers/schemas/hall-schema";

export const createHallAction = async (prevState, formData) => {
  try {
    const locale = formData.get("locale");
    const token = formData.get("token");

    const fields = {
      name: formData.get("name"),
      seatCapacity: formData.get("seatCapacity"),
      isSpecial: formData.get("isSpecial"),
      cinemaId: formData.get("cinemaId"),
    };

    HallSchema.validateSync(fields, { abortEarly: false });
    const payload = {
      name: fields.name,
      seatCapacity: parseInt(fields.seatCapacity),
      isSpecial:
        fields.isSpecial === "true"
          ? true
          : fields.isSpecial === "false"
          ? false
          : false,

      cinemaId: parseInt(fields.cinemaId),
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

    if (err.name === "ValidationError") {
      const errors = {};
      err.inner.forEach((e) => {
        if (e.path && !errors[e.path]) errors[e.path] = e.message;
      });

      return {
        ok: false,
        message: "Please fill in the required fields.",
        errors,
      };
    }
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
    return { ok: false, message: "Failed to create hall" };
  }
};


export const updateHallAction = async (prevState, formData) => {
  try {
    const id = formData.get("id");
    const locale = formData.get("locale");
    const token = formData.get("token");

    const fields = {
      name: formData.get("name"),
      seatCapacity: formData.get("seatCapacity"),
      isSpecial: formData.get("isSpecial"),
      cinemaId: formData.get("cinemaId"),
    };

    HallSchema.validateSync(fields, { abortEarly: false });
    const payload = {
      name: fields.name,
      seatCapacity: parseInt(fields.seatCapacity),
      isSpecial:
        fields.isSpecial === "true"
          ? true
          : fields.isSpecial === "false"
          ? false
          : false,

      cinemaId: parseInt(fields.cinemaId),
    };
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || config.apiURL}/hall/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        message: data.message || "Update failed",
        errors: data.errors,
      };
    }

    revalidatePath(`/${locale}/admin/halls`);
    //return { ok: true, message: data.message || "Hall updated successfully" };
    return { ok: true };
  } catch (err) {
    console.error("Update hall failed:", err);

    if (err.name === "ValidationError") {
      const errors = {};
      err.inner.forEach((e) => {
        if (e.path && !errors[e.path]) errors[e.path] = e.message;
      });

      return {
        ok: false,
        message: "Please fill in the required fields.",
        errors,
      };
    }
    return { ok: false, message: "Failed to update hall" };
  }
};


export const deleteHallAction = async (id, locale, token) => {
  try {
    const res = await deleteHall(id, token);
    if (!res.ok && res.message) return { ok: false, message: "errorDelete" };

    revalidatePath(`/${locale}/admin/halls`);
    return { ok: true, message: "successDelete" };
  } catch (err) {
    console.error("Delete hall failed:", err);
    return { ok: false, message: "errorDelete" };
  }
};
