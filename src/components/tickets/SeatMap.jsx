"use client";
import React from "react";
import "@/styles/seatmap.scss";

/**
 * SeatMap Component
 *
 * @param {number} rows - Number of seat rows (A, B, C…)
 * @param {number} cols - Number of seats per row
 * @param {string[]} selectedSeats - Currently selected seat IDs (e.g. ["A1", "A2"])
 * @param {string[]} disabledSeats - Seats that should be shown as unavailable (e.g. ["B3", "C7"])
 * @param {function} onToggleSeat - Callback when a seat is clicked
 */
export default function SeatMap({
  rows,
  cols,
  selectedSeats = [],
  disabledSeats = [],
  onToggleSeat,
}) {
  const rowLetters = Array.from({ length: rows }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const isSelected = (id) => selectedSeats.includes(id);
  const isDisabled = (id) => disabledSeats.includes(id);

  return (
    <div className="seatmap">
      <div className="seatmap-grid">
        {rowLetters.map((letter) => (
          <div className="seatmap-row" key={letter}>
            {Array.from({ length: cols }, (_, i) => {
              const seatNumber = i + 1;
              const seatId = `${letter}${seatNumber}`;
              const selected = isSelected(seatId);
              const disabled = isDisabled(seatId);

              return (
                <button
                  type="button"
                  key={seatId}
                  className={`seat
                    ${selected ? "is-selected" : ""}
                    ${disabled ? "is-disabled" : ""}`}
                  onClick={() => !disabled && onToggleSeat(letter, seatNumber)}
                  disabled={disabled}
                  aria-pressed={selected}
                  aria-label={`Seat ${seatId}${selected ? " selected" : ""}`}
                >
                  {seatId}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* screen / perde */}
      <div className="screen-wrap" aria-hidden="true">
        <div className="screen" />
        <div className="screen-label">Perde</div>
      </div>

      {/* legend */}
      <div className="legend">
        <span className="legend-item">
          <span className="chip chip-selected" /> Seçilen
        </span>
        <span className="legend-item">
          <span className="chip chip-empty" /> Boş
        </span>
        <span className="legend-item">
          <span className="chip chip-disabled" /> Dolu / Kapalı
        </span>
      </div>
    </div>
  );
}
