"use client";

import React from "react";
import { Tag } from "primereact/tag";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "react-bootstrap";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

export function HallCardForDashboard({
  hall,
  tCinemas,
  isDashboard = false,
  isEditMode = false,
  selectedMovieID,
  selectedDate,
}) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  if (!hall) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem",
          color: "#999",
          fontSize: "1.1rem",
        }}
      >
        {t("cinemas.noHalls")}
      </div>
    );
  }

  const handleEditHall = () => {
    router.push(`/${locale}/admin/halls/${hall.id}`);
  };

  const handleEditShowtime = (showtimeId) => {
    console.log("Edit showtime:", showtimeId)
    router.push(`/${locale}/admin/showtimes/${showtimeId}`);
  };

  const filteredShowtimes = hall?.showtimes?.filter((showtime) => {
    const matchDate = selectedDate ? showtime.date === selectedDate : true;
    const matchMovie = selectedMovieID
      ? showtime.movieId === Number(selectedMovieID)
      : true;
    return matchDate && matchMovie;
  });

  const thumbnailTemplate = (showtime) => (
    <img
      src={showtime.moviePosterUrl}
      alt={showtime.movieTitle}
      style={{
        width: "60px",
        height: "90px",
        objectFit: "cover",
        borderRadius: "8px",
        boxShadow: "0 0 8px rgba(0,0,0,0.3)",
      }}
    />
  );

  const dateTemplate = (showtime) => (
    <span>{new Date(showtime.date).toLocaleDateString()}</span>
  );

  const timeTemplate = (showtime) => (
    <span>
      {showtime.startTime.slice(0, 5)} - {showtime.endTime.slice(0, 5)}
    </span>
  );

  const actionTemplate = (showtime) => (
    <Button
      variant="outline-warning"
      size="sm"
      onClick={() => handleEditShowtime(showtime.id)}
    >
      <i className="pi pi-pencil"></i>
    </Button>
  );

  return (
    <div
      style={{
        backgroundColor: "#1c1c1e",
        borderRadius: "16px",
        padding: "2rem",
        color: "#eaeaea",
        border: "1px solid #2a2a2a",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        marginBottom: "20px",
      }}
    >
      {/* Header */}
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
              value={`${hall.seatCapacity} ${t("cinemas.capacity")}`}
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
                value={t("cinemas.specialHall")}
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

        {isDashboard && isEditMode && (
          <Button variant="outline-warning" onClick={handleEditHall}>
            <i className="pi pi-pen-to-square"></i> {t("cinemas.edit")}
          </Button>
        )}
      </div>

      {/* Meta Info */}
      {isDashboard && (
        <p style={{ color: "#888", fontSize: "0.85rem" }}>
          {t("cinemas.created")}:{" "}
          <span style={{ color: "#ccc" }}>
            {new Date(hall.createdAt).toLocaleString()}
          </span>{" "}
          • {t("cinemas.updated")}:{" "}
          <span style={{ color: "#ccc" }}>
            {new Date(hall.updatedAt).toLocaleString()}
          </span>
        </p>
      )}

      <hr style={{ borderColor: "#2a2a2a" }} />

      <h5
        style={{
          color: "#eaeaea",
          fontWeight: "500",
          marginBottom: "1rem",
          marginTop: "1.5rem",
        }}
      >
        {t("cinemas.showtimes")}
      </h5>

      {/* Showtimes Table */}
      {filteredShowtimes && filteredShowtimes.length > 0 ? (
        <DataTable
          value={filteredShowtimes}
          stripedRows
          responsiveLayout="scroll"
          className="p-datatable-sm dark-table"
          style={{
            backgroundColor: "#1e1e1e",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <Column
            header="#"
            body={(_, { rowIndex }) => rowIndex + 1}
            style={{ width: "50px" }}
          />
          <Column
            header={t("cinemas.image")}
            body={thumbnailTemplate}
            style={{ width: "80px" }}
          />
          <Column
            field="movieTitle"
            header={tCinemas("movie")}
            sortable
            style={{ minWidth: "200px" }}
          />
          <Column
            field="date"
            header={tCinemas("date")}
            body={dateTemplate}
            sortable
            style={{ width: "150px" }}
          />
          <Column
            header={t("filters.time")}
            body={timeTemplate}
            style={{ width: "150px" }}
          />
          <Column
            header={t("images.actions")}
            body={actionTemplate}
            style={{ width: "100px", textAlign: "center" }}
          />
        </DataTable>
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
