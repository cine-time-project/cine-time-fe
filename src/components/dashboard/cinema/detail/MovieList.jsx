"use client";
import MovieCard from "@/components/movies/movie-card/MovieCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import MovieCardInCinemaDetail from "./MovieCardInCinemaDetail";
import { useState } from "react";

export default function MovieList({ movies, tCinemas }) {
  const [selectedMovieID, setSelectedMovieID] = useState(null);

  if (!movies.length)
    return <p className="text-muted">{tCinemas("noMovieForCinema")}</p>;

  const isDisabled = selectedMovieID !== null;

  return (
    <div>
      <h3 className="fw-bold mb-3 text-light">{tCinemas("currentMovies")}</h3>
      <Swiper
        style={{ overflowX: "hidden", padding: "40px 0" }}
        navigation={!isDisabled}           // ← okları gizle/engelle
        modules={[Navigation]}
        allowTouchMove={!isDisabled}       // ← dokunarak kaydırmayı kapat
        allowSlideNext={!isDisabled}       // ← ileri kaydırmayı kapat
        allowSlidePrev={!isDisabled}       // ← geri kaydırmayı kapat
        keyboard={{ enabled: !isDisabled }} // ← klavye yön tuşlarını kapat
        spaceBetween={20}
        slidesPerGroup={1}
        slidesOffsetBefore={30}
        slidesOffsetAfter={30}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 20, slidesPerGroup: 1 },
          640: { slidesPerView: 2, spaceBetween: 20, slidesPerGroup: 1 },
          768: { slidesPerView: 3, spaceBetween: 20, slidesPerGroup: 1 },
          1024: { slidesPerView: 3, spaceBetween: 20, slidesPerGroup: 1 },
          1300: { slidesPerView: 4, spaceBetween: 20, slidesPerGroup: 1 },
          1600: { slidesPerView: 5, spaceBetween: 20, slidesPerGroup: 1 },
        }}
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id} style={{ height: "100%" }}>
            <MovieCardInCinemaDetail
              movie={movie}
              selectedMovieID={selectedMovieID}
              setSelectedMovieID={setSelectedMovieID}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
