import axios from "axios";

export async function searchMovies(query = "") {
  try {
    const res = await axios.get("http://localhost:8090/api/movies/search", {
      params: { q: query },
    });
    return res.data.returnBody; // artık .content erişilebilir
  } catch (error) {
    throw new Error("Failed to fetch movies");
  }
}