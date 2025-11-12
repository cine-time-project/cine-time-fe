"use client";

import React from "react";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { ShowtimeCard } from "./ShowtimeCard";

export function HallCard({
  hall,
  tCinemas,
  isEditMode = false,
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
                  color: "#ffd700",
                  border: "none",
                }}
              />
            )}
          </div>
        </div>
        {isEditMode && (
          <Button
            label={tCinemas("edit") || "Add Showtime"}
            icon="pi pi-plus"
            className="p-button-rounded p-button-text"
            style={{
              color: "#00b4ff",
              border: "1px solid #2f2f2f",
              fontWeight: "500",
            }}
          />
        )}
      </div>

      {/* META INFO */}
      {isEditMode && (
        <p style={{ color: "#888", fontSize: "0.85rem" }}>
          {tCinemas("created")}:{" "}
          <span style={{ color: "#ccc" }}>
            {new Date(hall.createdAt).toLocaleString()}
          </span>{" "}
          • {tCinemas("updated")}:{" "}
          <span style={{ color: "#ccc" }}>
            {new Date(hall.updatedAt).toLocaleString()}
          </span>
        </p>
      )}

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
