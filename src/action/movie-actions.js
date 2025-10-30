"use server";

import {
  response,
  transformFormDataToJSON,
  transformYupErrors,
  YupValidationError,
} from "@/helpers/data/form-validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createMovie, deleteMovie, updateMovie } from "@/service/movie-service";
import { MovieSchema } from "@/helpers/schemas/movie-schema";

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
      cast: JSON.parse(fields.cast),
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
  if (!formData.get("id")) throw new Error("Id is missing");
  let isSuccess = false;

  try {
    const fields = transformFormDataToJSON(formData);
    MovieSchema.validateSync(fields, { abortEarly: false });

    const payload = {
      ...fields,
      id: parseInt(fields.id),
      duration: parseInt(fields.duration),
      genre: JSON.parse(fields.genre),
      cast: JSON.parse(fields.cast),
      formats: JSON.parse(fields.formats),
      locale: fields.locale,
    };

    const res = await updateMovie(payload);
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
