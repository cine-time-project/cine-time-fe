"use client";

import React from "react";
import { Tag } from "primereact/tag";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { ShowtimeCard } from "./ShowtimeCard";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

export function HallCard({
  hall,
  tCinemas,
  selectedMovieID,
  selectedDate,
}) {
  if (!hall) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem",
          color: "#777",
          fontSize: "1.1rem",
        }}
      >
        {tCinemas("noHalls")}
      </div>
    );
  }

  const router = useRouter();
  const locale = useLocale();

  const filteredShowtimes = hall?.showtimes?.filter((showtime) => {
    const matchDate = showtime.date === selectedDate;
    const matchMovie = selectedMovieID
      ? showtime.movieId === Number(selectedMovieID)
      : true;
    return matchDate && matchMovie;
  });

  return (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        borderRadius: "16px",
        padding: "2rem",
        color: "#eaeaea",
        border: "1px solid #2a2a2a",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        marginBottom: "20px",
      }}
    >
      {/* HALL HEADER */}
      <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
        <div>
          <h3
            style={{
              color: "#ffffff",
              fontWeight: 600,
              marginBottom: "0.3rem",
              letterSpacing: "0.3px",
            }}
          >
            {hall.name}
          </h3>
          <div className="d-flex align-items-center gap-2 mt-2 flex-wrap">
            <Tag
              value={`${hall.seatCapacity} ${tCinemas("capacity")}`}
              icon="pi pi-users"
              style={{
                fontSize: "1rem",
                backgroundColor: "#2a2a2a",
                color: "#bcbcbc",
                border: "none",
              }}
            />
            {hall.isSpecial && (
              <Tag
                value={tCinemas("specialHall")}
                icon="pi pi-star"
                style={{
                  backgroundColor: "#2a2a2a",
                  color: "#ffc107",
                  border: "none",
                }}
              />
            )}
          </div>
        </div>
        
      </div>

      <hr style={{ borderColor: "#2a2a2a" }} />

      {/* SHOWTIMES */}

      <h5
        style={{
          color: "#eaeaea",
          fontWeight: "500",
          marginBottom: "1rem",
          marginTop: "1.5rem",
        }}
      >
        {tCinemas("showtimes")}
      </h5>

      {hall.showtimes && hall.showtimes.length > 0 ? (
        <Swiper
          style={{ overflowX: "hidden", padding: "10px" }}
          navigation
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerGroup={1}
          slidesOffsetBefore={20}
          slidesOffsetAfter={20}
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 20, slidesPerGroup: 1 },
            640: { slidesPerView: 1, spaceBetween: 20, slidesPerGroup: 1 },
            768: { slidesPerView: 1, spaceBetween: 20, slidesPerGroup: 1 },
            1024: { slidesPerView: 2, spaceBetween: 20, slidesPerGroup: 1 },
            1300: { slidesPerView: 3, spaceBetween: 20, slidesPerGroup: 1 },
            1600: { slidesPerView: 3, spaceBetween: 20, slidesPerGroup: 1 },
          }}
        >
          {filteredShowtimes.map((showtime) => (
            <SwiperSlide key={showtime.id} style={{ height: "100%" }}>
              <ShowtimeCard showtime={showtime} tCinemas={tCinemas} />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div
          className="text-center py-5"
          style={{ color: "#777", fontSize: "1rem" }}
        >
          {tCinemas("noShowtimes")}
        </div>
      )}
    </div>
  );
}
