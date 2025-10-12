import axios from "axios";
import { MOVIE_SEARCH_API, MOVIE_STATUS_API} from "@/helpers/api-routes.js";

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
        page,  // backend page parameter
        size,  // backend page size parameter
      },
    });
    
    // returnBody artık Page<Movie> formatında olmalı
    return res.data.returnBody; 
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw new Error("Failed to fetch movies");
  }
}

export async function getMoviesByStatus(status = "IN_THEATERS", page = 0, size = 12) {
  try {
    const res = await axios.get(`${MOVIE_STATUS_API}`, {
      params: { 
        status,
        page,  // backend page parameter
        size,  // backend page size parameter
      },
    });
    
    // returnBody artık Page<Movie> formatında olmalı
    return res.data.returnBody; 
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw new Error("Failed to fetch movies");
  }
}

export async function fetchComingSoon({ page = 1, size = 12 } = {}) {
  const p = Math.max(0, page - 1); // backend 0-based
  const pageData = await getMoviesByStatus("COMING_SOON", p, size);

  // Page map (Spring Page standardı)
  return {
    movies: pageData?.content ?? [],
    page: (pageData?.number ?? p) + 1, // UI 1-based
    size: pageData?.size ?? size,
    totalPages: pageData?.totalPages ?? 1,
    totalElements: pageData?.totalElements ?? 0,
  };
}
