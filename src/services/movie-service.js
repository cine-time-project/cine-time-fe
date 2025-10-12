import axios from "axios";
import { API_BASE, MOVIE_SEARCH_API, MOVIE_STATUS_API, MOVIE_FILTER_API, MOVIE_GENRE_LIST } from "@/helpers/api-routes.js";


/**
 * searchMovies
 * ------------
 * Fetches movies from backend with optional search query and pagination.
 *
 * @param query (string) - Search query (default: "")
 * @param page (number) - Page number for pagination (default: 0)
 * @param size (number) - Number of items per page (default: 20)
 * @returns {Promise<Page<Movie>>} - Paginated movie results
 */
export async function searchMovies(query = "", page = 0, size = 10) {
  try {
    const res = await axios.get(`${MOVIE_SEARCH_API}`, {
      params: {
        q: query,
        page, // backend page parameter
        size, // backend page size parameter
      },
    });

    // returnBody artık Page<Movie> formatında olmalı
    return res.data.returnBody;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw new Error("Failed to fetch movies");
  }
}

export async function getMoviesByStatus(
  status = "IN_THEATERS",
  page = 0,
  size = 12
) {
  try {
    const res = await axios.get(`${MOVIE_STATUS_API}`, {
      params: {
        status,
        page, // backend page parameter
        size, // backend page size parameter
      },
    });

    // returnBody artık Page<Movie> formatında olmalı
    return res.data.returnBody;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw new Error("Failed to fetch movies");
  }
}

export async function getGenres() {
  const { data } = await axios.get(`${MOVIE_GENRE_LIST}`);
  return data.returnBody || [];
}

export async function filterMovies(filters = {}, page = 0, size = 10) {
  const params = new URLSearchParams({
    page,
    size,
  });

  // Dynamically append filters
  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else {
        params.append(key, value);
      }
    }
  });

  const { data } = await axios.get(`${MOVIE_FILTER_API}?${params.toString()}`);
  return data.returnBody;
}
