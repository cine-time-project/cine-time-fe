"use server";

import { imageUploadForMovieApi } from "@/helpers/api-routes";
import { getAuthHeader } from "@/helpers/auth-helpers";

/**
 * Uploads a movie poster (image file)
 * @param {number} movieId
 * @param {FormData} formData - must contain file field named 'poster'
 */
export const uploadMoviePoster = async (movieId, formData) => {
  const headers = await getAuthHeader();
  delete headers["Content-Type"]; // fetch otomatik ayarlayacak (multipart için)

  return fetch(imageUploadForMovieApi(movieId), {
    method: "POST",
    headers,
    body: formData,
  });
};
