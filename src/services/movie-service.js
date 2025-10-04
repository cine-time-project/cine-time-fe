import axios from "axios";

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
export async function searchMovies(query = "", page = 0, size = 20) {
  try {
    const res = await axios.get("http://localhost:8090/api/movies/search", {
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
