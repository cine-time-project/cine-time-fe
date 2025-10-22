"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("comingSoon");

  useEffect(() => {
    if (swiperRef.current && movies.length > 0) {
      swiperRef.current.autoplay?.start();
      swiperRef.current.pagination?.update();
    }
  }, [movies]);

  console.log("HeroCarousel movies:", movies);

  if (movies.length === 0) {
    return (
      <div className="comingsoon-hero-carousel">
        <div
          className="comingsoon-hero-card"
          style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #333 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ textAlign: "center", color: "#fff" }}>
            <h2 style={{ fontSize: "24px", marginBottom: "12px" }}>
              {t("heading")}
            </h2>
            <p style={{ opacity: 0.7 }}>{t("loadingMovies")}</p>
          </div>
        </div>
      </div>
    );
  }

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
