"use server";

import {
  response,
  transformFormDataToJSON,
} from "@/helpers/data/form-validation";
import { revalidatePath } from "next/cache";
import {
  uploadImage,
  updateImageServer,
  deleteImageServer,
} from "@/service/image-service.server";

/**
 * Upload a new image for a movie
 * @param {FormData} formData - must contain: movieId, file, poster (boolean), locale, token
 */
export const uploadImageAction = async (prevState, formData) => {
  try {
    const movieId = formData.get("movieId");
    const file = formData.get("file");
    const poster = formData.get("poster") === "true";
    const token = formData.get("token");
    const locale = formData.get("locale") || "en";

    if (!movieId) {
      return response(false, "Movie ID is required", null);
    }

    if (!file || file.size === 0) {
      return response(false, "Please select an image file", null);
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      return response(
        false,
        "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed",
        null
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return response(false, "File size must be less than 5MB", null);
    }

    const res = await uploadImage(movieId, formData, token);

    if (!res.ok) {
      const error = await res.json();
      return response(false, error.message || "Failed to upload image", null);
    }

    revalidatePath(`/${locale}/admin/movies/${movieId}/images`);
    revalidatePath(`/${locale}/admin/movies`);

    return response(true, "Image uploaded successfully", null);
  } catch (error) {
    console.error("Upload Image Error:", error);
    return response(false, error.message || "Unexpected error occurred", null);
  }
};

/**
 * Update an existing image
 * @param {FormData} formData - must contain: imageId, file, poster (optional), locale, token
 */
export const updateImageAction = async (prevState, formData) => {
  try {
    const imageId = formData.get("imageId");
    const movieId = formData.get("movieId");
    const file = formData.get("file");
    const poster = formData.get("poster");
    const token = formData.get("token");
    const locale = formData.get("locale") || "en";

    if (!imageId) {
      return response(false, "Image ID is required", null);
    }

    if (!file || file.size === 0) {
      return response(false, "Please select an image file", null);
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      return response(
        false,
        "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed",
        null
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return response(false, "File size must be less than 5MB", null);
    }

    const res = await updateImageServer(imageId, formData, token);

    if (!res.ok) {
      const error = await res.json();
      return response(false, error.message || "Failed to update image", null);
    }

    revalidatePath(`/${locale}/admin/movies/${movieId}/images`);
    revalidatePath(`/${locale}/admin/movies`);

    return response(true, "Image updated successfully", null);
  } catch (error) {
    console.error("Update Image Error:", error);
    return response(false, error.message || "Unexpected error occurred", null);
  }
};

/**
 * Delete an image
 * @param {number} imageId
 * @param {number} movieId
 * @param {string} locale
 * @param {string} token
 */
export const deleteImageAction = async (imageId, movieId, locale, token) => {
  if (!imageId) {
    return response(false, "Image ID is required", null);
  }

  try {
    const res = await deleteImageServer(imageId, token);

    if (!res.ok) {
      const error = await res.json();
      return response(false, error.message || "Failed to delete image", null);
    }

    revalidatePath(`/${locale}/admin/movies/${movieId}/images`);
    revalidatePath(`/${locale}/admin/movies`);

    return response(true, "Image deleted successfully", null);
  } catch (error) {
    console.error("Delete Image Error:", error);
    return response(false, error.message || "Unexpected error occurred", null);
  }
};
