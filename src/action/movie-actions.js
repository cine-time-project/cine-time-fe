"use server";

import {
  response,
  transformFormDataToJSON,
  transformYupErrors,
  YupValidationError,
} from "@/helpers/data/form-validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { MovieSchema } from "@/helpers/schemas/movie-schema";
import {
  updateMovie,
  deleteMovieServer,
  createMovie,
} from "@/service/movie-service.server";

export const deleteMovieAction = async (id, locale, token) => {
  if (!id) throw new Error("Id is missing");

  try {
    const res = await deleteMovieServer(id, token);

    if (!res) return response(false, "Failed to delete movie", null);

    revalidatePath(`/${locale}/admin/movies`);
    return response(true, "Movie deleted successfully", null);
  } catch (error) {
    console.error("Delete Error:", error);
    return response(false, error.message, null);
  }
};

export const createMovieAction = async (prevState, formData) => {
  let isSuccess = false;

  try {
    const fields = transformFormDataToJSON(formData);
    MovieSchema.validateSync(fields, { abortEarly: false });

    const castRaw = fields.cast || "";

    const payload = {
      ...fields,
      duration: parseInt(fields.duration),
      genre: Array.isArray(fields.genre) ? fields.genre : [fields.genre],
      cast: castRaw
        ? castRaw
            .split(",")
            .map((name) => name.trim())
            .filter(Boolean)
        : [],
      formats: Array.isArray(fields.formats)
        ? fields.formats
        : [fields.formats],
      locale: fields.locale,
    };
    const token = formData.get("token");
    console.log(payload);
    const res = await createMovie(payload, token);
    isSuccess = true;
    return response(true, "Movie created successfully", null);
  } catch (error) {
    if (error instanceof YupValidationError) {
      return transformYupErrors(error.inner);
    }
  } finally {
    if (isSuccess) {
      const locale = formData.get("locale") || "en";
      revalidatePath(`/${formData.get("locale")}/admin/movies`);
      redirect(`/${formData.get("locale")}/admin/movies`);
    }
  }
};

export const updateMovieAction = async (prevState, formData) => {
  if (!formData.get("id")) throw new Error("Movie ID is missing");
  let isSuccess = false;

  try {
    const fields = transformFormDataToJSON(formData);
    MovieSchema.validateSync(fields, { abortEarly: false });

    const castRaw = fields.cast || "";
    const token = formData.get("token");

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

    await updateMovie(payload, token);
    isSuccess = true;
    return response(true, "Movie updated successfully", null);
  } catch (error) {
    console.error("updateMovieAction error:", error);
    if (error instanceof YupValidationError) {
      return transformYupErrors(error.inner);
    }
    return response(false, error.message || "Unexpected error occurred");
  } finally {
    if (isSuccess) {
      const locale = formData.get("locale") || "en";
      revalidatePath(`/${locale}/admin/movies`);
      redirect(`/${locale}/admin/movies`);
    }
  }
};
