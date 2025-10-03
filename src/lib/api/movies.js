export async function searchMovies(query = "") {
  const res = await fetch(`http://localhost:8090/api/movies/search?q=${query}`);
  if (!res.ok) throw new Error("Failed to fetch movies");
  const json = await res.json();
  return json.returnBody; // artık .content erişilebilir
}