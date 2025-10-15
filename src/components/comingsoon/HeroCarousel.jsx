"use client";

import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import "./hero-carousel.scss";

import { HeroCard } from "./HeroCard";

export const HeroCarousel = ({ movies = [] }) => {
  const swiperRef = useRef(null);

  useEffect(() => {
    if (swiperRef.current && movies.length > 0) {
      swiperRef.current.autoplay?.start();
      swiperRef.current.pagination?.update();
    }
  }, [movies]);

  if (movies.length === 0) return null;

  return (
    <Swiper
      onSwiper={(sw) => (swiperRef.current = sw)}
      modules={[Navigation, Pagination, Autoplay, EffectFade]}
      className="comingsoon-hero-carousel"
      effect="fade"
      fadeEffect={{ crossFade: true }}
      speed={800}
      navigation
      pagination={{
        clickable: true,
        dynamicBullets: false,
      }}
      autoplay={{
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      loop={movies.length > 1}
      allowTouchMove={true}
      grabCursor={true}
    >
      {movies.map((m, index) => (
        <SwiperSlide key={m.id}>
          <HeroCard movie={m} slideNumber={index + 1} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
