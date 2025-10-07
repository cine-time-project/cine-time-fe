"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "./hero-carousel.scss";
import { HeroCard } from "./HeroCard";
import { useEffect, useState } from "react";
import { getMoviesByStatus } from "@/services/movie-service";

export const HeroCarousel = ({ query }) => {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);

  // 🔹 Fetch movies from backend
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await getMoviesByStatus(query, 0);
        const content = response?.content || [];
        setMovies(content);
      } catch (err) {
        console.error(err);
        setError("Failed to load movies.");
      }
    };

    fetchMovies();
  }, [query]);

  if (error) {
    return <div className="hero-carousel__error">{error}</div>;
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      centeredSlides={true}
      navigation={true}
      pagination={{ clickable: true }}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      loop
      allowTouchMove={false} // 🔹 Swipe/drag devre dışı
      simulateTouch={false} // 🔹 Mouse drag devre dışı
      className="movie-hero-carousel"
    >
      {movies.map((movie) => (
        <SwiperSlide key={movie.id}>
          <HeroCard movie={movie} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
