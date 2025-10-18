import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Form, InputGroup } from "react-bootstrap";
import { searchMovies } from "@/services/movie-serviceDP";

export default function SearchBar({ locale, tNav }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecentSearches(saved);
  }, []);

  const handleSelectMovie = (movie) => {
    const updatedHistory = [
      movie.title,
      ...recentSearches.filter((t) => t !== movie.title),
    ].slice(0, 5);
    localStorage.setItem("recentSearches", JSON.stringify(updatedHistory));
    setRecentSearches(updatedHistory);
    setShowResults(false);
    setSearch("");

    router.push(`/${locale}/movies/${movie.slug || movie.id}`);
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const data = await searchMovies(value, 0, 5);
      setResults(data?.content || []);
      setShowResults(true);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      className="search-form mx-auto position-relative"
      onSubmit={(e) => e.preventDefault()}
    >
      <InputGroup>
        <Form.Control
          type="search"
          placeholder={tNav("search")}
          value={search}
          onChange={handleSearchChange}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        <InputGroup.Text className="search-icon">
          <svg
            className="search-icon__icon"
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 24 24"
          >
            <path d="M10.5 3a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" />
            <path d="m15.57 14.15 4.64 4.64a1 1 0 0 1-1.42 1.42l-4.64-4.64a1 1 0 1 1 1.42-1.42Z" />
          </svg>
        </InputGroup.Text>
      </InputGroup>

      {showResults && (
        <div className="search-dropdown">
          {loading && <div className="search-loading">Aranıyor...</div>}

          {!loading && results.length > 0
            ? results.map((movie) => (
                <div
                  key={movie.id}
                  className="search-item"
                  onMouseDown={() => handleSelectMovie(movie)}
                >
                  {movie.posterUrl && (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="poster"
                    />
                  )}
                  <span>{movie.title}</span>
                </div>
              ))
            : !loading &&
              search.trim() &&
              recentSearches.length > 0 && (
                <>
                  <div className="recent-title">Son Aramalar</div>
                  {recentSearches.map((t, i) => (
                    <div
                      key={i}
                      className="search-item recent"
                      onMouseDown={() => router.push(`/${locale}/movies/${t}`)}
                    >
                      {t}
                    </div>
                  ))}
                </>
              )}
        </div>
      )}
    </Form>
  );
}