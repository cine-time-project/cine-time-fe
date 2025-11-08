"use client";

import {
  IMAGES_ADMIN_LIST_API,
  MOVIES_ADMIN_LIST_API,
  imageByIdApi,
  imageUploadForMovieApi,
  imageUpdateApi,
  imageDeleteApi,
  movieImagesApi,
  moviePosterIdApi,
  imageDetailsApi,
} from "@/helpers/api-routes";
import { authHeaders } from "@/lib/utils/http";

/**
 * Get all images with pagination and filtering
 * Since /images/admin requires imageId parameter, we get images through movies
 */
export const getAllImagesByPage = async (
  page = 0,
  size = 12,
  sort = "createdAt",
  type = "desc",
  q = "",
  movieId = ""
) => {
  // Convert parameters to correct types
  const pageNum = parseInt(page) || 0;
  const sizeNum = parseInt(size) || 12;
  const queryStr = String(q || "");
  const movieIdStr = String(movieId || "");

  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
  };

  try {
    // Get all movies first
    const moviesParams = new URLSearchParams({
      q: "",
      page: 0,
      size: 1000,
      sort: "title",
      type: "asc",
    });

    const moviesResponse = await fetch(
      `${MOVIES_ADMIN_LIST_API}?${moviesParams.toString()}`,
      { method: "GET", headers }
    );

    if (!moviesResponse.ok) {
      console.error(
        "🎬 Movies API failed:",
        moviesResponse.status,
        moviesResponse.statusText
      );
      throw new Error(`Failed to fetch movies: ${moviesResponse.statusText}`);
    }

    const moviesData = await moviesResponse.json();

    // Use same pattern as MovieList component
    const page = moviesData?.returnBody ?? moviesData ?? {};
    const movies = page.content || [];

    // Check if we have movies 26-35 (from your database)
    const testIds = [26, 27, 28, 29, 30, 31, 32, 33, 34, 35];
    const foundTestMovies = movies.filter((m) => testIds.includes(m.id));

    let allImages = [];

    // Get images for each movie
    for (const movie of movies) {
      // Skip if filtering by specific movie
      if (movieIdStr && movie.id.toString() !== movieIdStr) {
        continue;
      }

      try {
        const imageUrl = movieImagesApi(movie.id);
        const imagesResponse = await fetch(imageUrl, {
          method: "GET",
          headers,
        });

        if (imagesResponse.ok) {
          const movieImages = await imagesResponse.json();

          if (movieImages.length > 0) {
            const imagesWithMovie = movieImages.map((image) => {
              return {
                ...image,
                movie: { id: movie.id, title: movie.title },
                isPoster: image.poster || false,
                // Convert base64 data to data URL for browser display
                url: image.data ? `data:image/jpeg;base64,${image.data}` : null,
              };
            });

            allImages = [...allImages, ...imagesWithMovie];
          }
        }
      } catch (err) {
        console.warn(`Error fetching images for movie ${movie.id}:`, err);
      }
    }

    // Apply search filter - search by exact image ID, image name, or movie title (case-insensitive)
    if (queryStr) {
      allImages = allImages.filter((image) => {
        // Check if query is a number for exact ID matching
        const queryAsNumber = parseInt(queryStr);
        const isNumericQuery =
          !isNaN(queryAsNumber) && queryAsNumber.toString() === queryStr;

        if (isNumericQuery) {
          // For numeric queries, only match exact image ID
          return image.id === queryAsNumber;
        } else {
          // For text queries, search in image name OR movie title
          const imageName = image.name?.toLowerCase() || "";
          const movieTitle = image.movie?.title?.toLowerCase() || "";
          const query = queryStr.toLowerCase();

          return imageName.includes(query) || movieTitle.includes(query);
        }
      });
    }

    // Sort by image ID in ascending order
    allImages.sort((a, b) => a.id - b.id);

    // Apply pagination
    const startIndex = pageNum * sizeNum;
    const endIndex = startIndex + sizeNum;
    const paginatedImages = allImages.slice(startIndex, endIndex);

    const result = {
      returnBody: {
        content: paginatedImages,
        totalElements: allImages.length,
        totalPages: Math.ceil(allImages.length / sizeNum),
        size: sizeNum,
        number: pageNum,
        numberOfElements: paginatedImages.length,
        first: pageNum === 0,
        last: pageNum >= Math.ceil(allImages.length / sizeNum) - 1,
      },
    };

    return result;
  } catch (error) {
    console.error("❌ Image collection failed:", error);
    return {
      returnBody: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: parseInt(size) || 12,
        number: parseInt(page) || 0,
        numberOfElements: 0,
        first: true,
        last: true,
      },
    };
  }
};

// Keep other functions unchanged...
export const getImageById = async (id) => {
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
  };
  if (!id) throw new Error("Id is missing");
  return fetch(imageByIdApi(id), { headers });
};

export const uploadImage = async (movieId, formData) => {
  const headers = { ...authHeaders() };
  return fetch(imageUploadForMovieApi(movieId), {
    method: "POST",
    headers,
    body: formData,
  });
};

export const updateImage = async (id, payload) => {
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
  };
  return fetch(imageUpdateApi(id), {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });
};

export const deleteImage = async (id) => {
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
  };
  return fetch(imageDeleteApi(id), {
    method: "DELETE",
    headers,
  });
};
