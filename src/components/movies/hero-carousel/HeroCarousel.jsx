"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "./hero-carousel.scss";
import { HeroCard } from "./HeroCard";
import { useEffect, useState, useRef } from "react";
import { getMoviesByStatus } from "@/services/movie-service";
import { useTranslations } from "next-intl";

export const HeroCarousel = ({ query }) => {
  // State for storing movies and errors
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const t = useTranslations("movies");

  // Ref for Swiper instance
  const swiperRef = useRef(null);

  // 🔹 Fetch movies from backend when query changes
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await getMoviesByStatus(query, 0);
        const content = response?.content || [];
        setMovies(content); // Update movies state
      } catch (err) {
        console.error(err);
        setError(t("failed"));
      }
    };

    fetchMovies();
  }, [query]);

  // 🔹 Ensure autoplay starts and pagination bullets are updated after movies load
  useEffect(() => {
    if (swiperRef.current && movies.length > 0) {
      swiperRef.current.autoplay.start();      // Start autoplay
      swiperRef.current.pagination?.update();  // Update pagination bullets
    }
  }, [movies]);

  // 🔹 Display error message if fetch fails
  if (error) {
    return <div className="hero-carousel__error">{error}</div>;
  }

  // 🔹 Render nothing while movies are loading
  if (movies.length === 0) return null;

  return (
    <Swiper
      key={movies.length}                   // Rebuild Swiper when movies change
      onSwiper={(swiper) => (swiperRef.current = swiper)} // Get Swiper instance
      modules={[Navigation, Pagination, Autoplay]}
      centeredSlides={true}                 // Center active slide
      navigation={true}                     // Enable next/prev arrows
      pagination={{ clickable: true }}      // Enable clickable pagination bullets
      autoplay={{ delay: 5000, disableOnInteraction: false }} // Autoplay settings
      loop                                  // Enable infinite loop
      allowTouchMove={false}                // Disable touch drag
      simulateTouch={false}                 // Disable mouse drag
      className="movie-hero-carousel"
      
    >
      {/* Render each movie as a SwiperSlide */}
      {movies.map((movie) => (
        <SwiperSlide key={movie.id}>
          <HeroCard movie={movie} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
