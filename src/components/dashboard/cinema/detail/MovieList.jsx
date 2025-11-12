"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import MovieCardInCinemaDetail from "./MovieCardInCinemaDetail";
import { Alert } from "react-bootstrap";


export default function MovieList({ movies, tCinemas, selectedMovieID, pickMovie }) {

  if (!movies?.length)
    return <Alert variant="warning">{tCinemas("noMovieForCinema")}</Alert>;


  const isDisabled = selectedMovieID !== null;

  return (
    <div>
      <Swiper
        style={{ overflowX: "hidden", padding: "20px 0" }}
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
              setSelectedMovieID={pickMovie}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
