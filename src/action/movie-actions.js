"use server";

import {response,transformFormDataToJSON,transformYupErrors,YupValidationError,
} from "@/helpers/data/form-validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MovieSchema } from "@/helpers/schemas/movie-schema";
import {updateMovie,deleteMovieServer,createMovie,
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
  try {
    const fields = transformFormDataToJSON(formData);
    MovieSchema.validateSync(fields, { abortEarly: false });

    const castRaw = fields.cast || "";
    const payload = {
      ...fields,
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

    const token = formData.get("token");
    const res = await createMovie(payload, token);

    if (!res) {
      return response(false, "Failed to create movie", null);
    }
    if (res?.message?.toLowerCase?.().includes("already")) {
      return response(false, "A movie with this title already exists.", null);
    }

    return response(true, "Movie created successfully", null);
  } catch (error) {
    console.error("Creation Error:", error);

    if (error.message?.includes("409")) {
      return response(false, "A movie with this title already exists.", null);
    }

    if (error.message?.includes("Validation failed")) {
      return response(
        false,
        "Validation error: please check input fields",
        null
      );
    }
    return response(false, error.message || "Unexpected error occurred", null);
  } finally {
    const locale = formData.get("locale") || "en";
    revalidatePath(`/${locale}/admin/movies`);
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
