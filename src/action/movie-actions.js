"use server";

import {
  response,
  transformFormDataToJSON,
  transformYupErrors,
  YupValidationError,
} from "@/helpers/data/form-validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMovie, deleteMovie } from "@/service/movie-service";
import { MovieSchema } from "@/helpers/schemas/movie-schema";
import { updateMovie } from "@/service/movie-service.server";

export const deleteMovieAction = async (id, locale) => {
  if (!id) throw new Error("Id is missing");

  try {
    const res = await deleteMovie(id);
    const data = await res.json();

    if (!res.ok) return response(false, data?.message, null);

    revalidatePath(`/${locale}/admin/movies`);
    return response(true, data?.message, null);
  } catch (error) {
    return response(false, error.message, null);
  }
};

export const createMovieAction = async (prevState, formData) => {
  let isSuccess = false;

  try {
    const fields = transformFormDataToJSON(formData);
    MovieSchema.validateSync(fields, { abortEarly: false });

    const payload = {
      ...fields,
      duration: parseInt(fields.duration),
      genre: JSON.parse(fields.genre),
      cast: fields.cast,
      formats: JSON.parse(fields.formats),
      locale: fields.locale,
    };

    const res = await createMovie(payload);
    const data = await res.json();

    if (!res.ok) return response(false, data?.message, data?.validations);

    isSuccess = true;
    return response(true, data?.message, null);
  } catch (error) {
    if (error instanceof YupValidationError) {
      return transformYupErrors(error.inner);
    }
    throw error;
  } finally {
    if (isSuccess) {
      revalidatePath(`/${formData.get("locale")}/admin/movies`);
      redirect(`/${formData.get("locale")}/admin/movies`);
    }
  }
};

export const updateMovieAction = async (prevState, formData) => {
  console.log("✅ updateMovieAction called");

  if (!formData.get("id")) throw new Error("Movie ID is missing");
  let isSuccess = false;

  try {
    // --- 1. Transform and validate ---
    const fields = transformFormDataToJSON(formData);
    console.log("Fields before validation:", fields);

    MovieSchema.validateSync(fields, { abortEarly: false });

    // --- 2. Prepare payload ---
    const castRaw = fields.cast || "";
    const token = formData.get("token"); // 🔑 optional if you pass it from form

    const payload = {
      ...fields,
      id: parseInt(fields.id),
      duration: parseInt(fields.duration),
      genre: JSON.parse(fields.genre || "[]"),
      formats: JSON.parse(fields.formats || "[]"),
      cast: castRaw
        ? castRaw
            .split(",")
            .map((name) => name.trim())
            .filter(Boolean)
        : [],
      locale: fields.locale,
    };

    console.log("📦 update movie payload:", payload);

    // --- 3. Call backend ---
    const data = await updateMovie(payload, token); // ✅ server-safe version
    console.log("🎬 Backend response:", data);

    // --- 4. Check response (our updateMovie now returns data directly) ---
    isSuccess = true;
    return response(true, "Movie updated successfully", null);
  } catch (error) {
    console.error("❌ updateMovieAction error:", error);
    if (error instanceof YupValidationError) {
      return transformYupErrors(error.inner);
    }
    return response(false, error.message || "Unexpected error occurred");
  } finally {
    // --- 5. Revalidate and redirect on success ---
    if (isSuccess) {
      const locale = formData.get("locale") || "en";
      revalidatePath(`/${locale}/admin/movies`);
      redirect(`/${locale}/admin/movies`);
    }
  }
};
