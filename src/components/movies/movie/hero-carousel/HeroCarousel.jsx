"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "./hero-carousel.scss";

export const HeroCarousel = ({ movies }) => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay, EffectFade]}
      navigation
      pagination={{ clickable: true }}
      effect="fade" // 🔹 Smooth fade transition
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      loop
      className="movie-hero-carousel"
      onAutoplayTimeLeft={(s, time, progress) => {
        const progressBar = document.querySelector(".autoplay-progress span");
        if (progressBar) {
          progressBar.style.transform = `scaleX(${1 - progress})`;
        }
      }}
    >
{/*       
      {movies.map((movie) => (
        <SwiperSlide key={movie.id}>
          <div
            className="hero-card"
            style={{ backgroundImage: `url(${movie.imageUrl})` }}
          >
            <div className="hero-overlay" />

            <div className="hero-content">
              <h2 className="hero-title">{movie.title}</h2>
              <p className="hero-summary">{movie.summary}</p>
              <div className="hero-buttons">
                <button className="btn primary">🎟️ Buy Ticket</button>
                <button className="btn secondary">▶️ Watch Trailer</button>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))} */}

      {/* 🔹 Autoplay progress bar */}
      <div className="autoplay-progress">
        <span></span>
      </div>
    </Swiper>
  );
};
