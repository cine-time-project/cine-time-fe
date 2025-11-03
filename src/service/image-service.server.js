"use server";

import { config } from "@/helpers/config";
import { getAuthHeader } from "@/helpers/auth-helpers";

/**
 * Upload image for a movie
 * @param {number} movieId
 * @param {FormData} formData - must contain file and poster fields
 * @param {string} token
 */
export const uploadImage = async (movieId, formData, token) => {
  const url = `${config.apiURL}/images/${movieId}`;

  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
};

/**
 * Update an existing image
 * @param {number} imageId
 * @param {FormData} formData - must contain file and optionally poster fields
 * @param {string} token
 */
export const updateImageServer = async (imageId, formData, token) => {
  const url = `${config.apiURL}/images/${imageId}`;

  return fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
};

/**
 * Delete an image
 * @param {number} imageId
 * @param {string} token
 */
export const deleteImageServer = async (imageId, token) => {
  const url = `${config.apiURL}/images/${imageId}`;

  return fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

/**
 * Get all images for a movie
 * @param {number} movieId
 * @param {string} token
 */
export const getMovieImages = async (movieId, token) => {
  const url = `${config.apiURL}/movies/${movieId}/images`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store", // Don't cache for server components
  });

  if (!response.ok) {
    throw new Error("Failed to fetch movie images");
  }

  return response.json();
};

/**
 * Get poster image ID for a movie
 * @param {number} movieId
 * @param {string} token
 */
export const getPosterImageId = async (movieId, token) => {
  const url = `${config.apiURL}/movies/${movieId}/poster`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch poster image ID");
  }

  return response.json();
};

/**
 * Get image by ID (server-side)
 * @param {number} imageId
 */
export const getImageById = async (imageId) => {
  try {
    const headers = await getAuthHeader();
    const url = `${config.apiURL}/images/${imageId}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Response is not JSON");
    }

    const data = await response.json();
    return data.returnBody || data;
  } catch (error) {
    console.error("Error fetching image by ID:", error);
    throw error;
  }
};

/**
 * Get all images with pagination (server-side)
 * @param {number} page
 * @param {number} size
 * @param {string} sort
 * @param {string} type
 * @param {string} q
 * @param {string} movieId
 */
export const getAllImagesByPageServer = async (
  page = 0,
  size = 12,
  sort = "createdAt",
  type = "desc",
  q = "",
  movieId = ""
) => {
  const headers = await getAuthHeader();
  const params = new URLSearchParams({
    q: q || "",
    page: page.toString(),
    size: size.toString(),
    sort: sort,
    type: type,
  });

  if (movieId) {
    params.append("movieId", movieId);
  }

  const url = `${config.apiURL}/images/admin?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch images: ${response.statusText}`);
  }

  const data = await response.json();
  return data.returnBody || data;
};
