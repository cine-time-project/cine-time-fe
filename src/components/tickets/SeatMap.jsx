"use client";

import React from "react";
import "@/styles/seatmap.scss";
import axios from "axios";
import { config } from "@/helpers/config.js";

/**
 * SeatMap Component
 *
 * @param {number} rows - Number of seat rows (A, B, C…)
 * @param {number} cols - Number of seats per row
 * @param {string[]} selectedSeats - Currently selected seat IDs (e.g. ["A1", "A2"])
 * @param {string[]} disabledSeats - Seats that should be shown as unavailable (e.g. ["B3", "C7"])
 * @param {function} onToggleSeat - Callback when a seat is clicked
 * @param {boolean} [lockSelection=false] - When true, all seats are disabled and selection is locked
 * @param {string} [lockMessage="Önce salon ve saat seçiniz"] - Message to show when selection is locked
 */
export function SeatMap({
  rows,
  cols,
  selectedSeats = [],
  disabledSeats = [],
  onToggleSeat,
  lockSelection = false,
  lockMessage = "Önce salon ve saat seçiniz",
}) {
  const rowLetters = Array.from({ length: rows }, (_, i) =>
    String.fromCharCode(65 + i)
  );

  const isSelected = (id) => selectedSeats.includes(id);
  const isDisabled = (id) => disabledSeats.includes(id);

  return (
    <div className={`seatmap ${lockSelection ? "is-locked" : ""}`}>
      {lockSelection && (
        <div className="seatmap-lock" aria-live="polite">
          <div className="lock-text">{lockMessage}</div>
        </div>
      )}

      {/* Screen (Perde) */}
      <div className="screen-wrap" aria-hidden="true">
        <div className="screen" />
        <div className="screen-label">Perde</div>
      </div>

      {/* Legend */}
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

      {/* Seat Grid */}
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
                  className={`seat ${selected ? "is-selected" : ""} ${
                    disabled ? "is-disabled" : ""
                  }`}
                  onClick={() =>
                    !(disabled || lockSelection) &&
                    onToggleSeat(letter, seatNumber)
                  }
                  disabled={disabled || lockSelection}
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
    </div>
  );
}

/**
 * SeatPickerRemote
 *
 * Fetches unavailable seats for the given identifiers and renders <SeatMap />.
 * Default export so it can be imported as:
 *   import SeatPickerRemote from "@/components/tickets/SeatMap";
 *
 * Props:
 *  - rows, cols: numbers
 *  - movieName: string
 *  - hall: string
 *  - cinema: string
 *  - dateISO: "YYYY-MM-DD"
 *  - timeISO: "HH:mm" or "HH:mm:ss"
 *  - value: string[] (controlled selected seats)
 *  - onChange: (ids: string[]) => void
 *  - extraDisabled?: string[]
 *  - lockWhenMissingFields?: boolean (default true)
 */
export default function SeatPickerRemote({
  rows,
  cols,
  movieName,
  hall,
  cinema,
  dateISO,
  timeISO,
  value = [],
  onChange,
  extraDisabled,
  lockWhenMissingFields = true,
}) {
  const API = config.apiURL;
  const [disabledSeats, setDisabledSeats] = React.useState([]);
  const [err, setErr] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // Helper: normalize HH:mm -> HH:mm:ss
  function toIsoTime(t) {
    if (!t) return "";
    const s = String(t).trim();
    if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s;
    if (/^\d{2}:\d{2}$/.test(s)) return `${s}:00`;
    return s;
  }

  const fetchKey = React.useMemo(() => {
    const t = toIsoTime(timeISO);
    if (!movieName || !hall || !cinema || !dateISO || !t) return "";
    return `${movieName}||${hall}||${cinema}||${dateISO}||${t}`;
  }, [movieName, hall, cinema, dateISO, timeISO]);
  
  const lastKeyRef = React.useRef("");

  React.useEffect(() => {
    if (!fetchKey) {
      setDisabledSeats(Array.isArray(extraDisabled) ? extraDisabled : []);
      setErr(null);
      return;
    }
  
    if (lastKeyRef.current === fetchKey) return;
    lastKeyRef.current = fetchKey;
  
    let cancel;
    setLoading(true);
    setErr(null);
  
    const src = axios.CancelToken.source();
    cancel = () => src.cancel("cancelled");
  
    (async () => {
      try {
        const [movieName2, hall2, cinema2, date2, time2] = fetchKey.split("||");
        const res = await axios.get(`${API}/show-times/unavailable-seats`, {
          params: {
            movieName: movieName2,
            hall: hall2,
            cinema: cinema2,
            date: date2,
            showtime: time2,
          },
          cancelToken: src.token,
          validateStatus: () => true,
          headers: { Accept: "application/json" },
        });
        if (res.status >= 400) {
          throw new Error(res.data?.message || `HTTP ${res.status}`);
        }
        const list = Array.isArray(res.data) ? res.data : [];
        const merged = Array.from(
          new Set([...(Array.isArray(extraDisabled) ? extraDisabled : []), ...list])
        );
        setDisabledSeats(merged);
  
        if (Array.isArray(value) && value.length) {
          const keep = value.filter((id) => !merged.includes(id));
          if (keep.length !== value.length && onChange) onChange(keep);
        }
      } catch (e) {
        if (!axios.isCancel(e)) setErr(e?.message || "Failed to load seats.");
      } finally {
        setLoading(false);
      }
    })();
  
    return () => {
      if (cancel) cancel();
    };
  }, [fetchKey]);

  // Toggle handler delegates to parent
  function handleToggle(letter, number) {
    const id = `${letter}${number}`;
    const next = value.includes(id)
      ? value.filter((x) => x !== id)
      : [...value, id];
    if (onChange) onChange(next);
  }

  const lockSelection = lockWhenMissingFields && !fetchKey;

  return (
    <div className="seat-picker-remote">
      {err && (
        <div className="alert alert-danger py-2 px-3 mb-2">{err}</div>
      )}
      {loading && !lockSelection && (
        <div className="text-secondary small mb-2">
          Uygun koltuklar yükleniyor…
        </div>
      )}
      <SeatMap
        rows={rows}
        cols={cols}
        selectedSeats={value}
        disabledSeats={disabledSeats}
        onToggleSeat={handleToggle}
        lockSelection={lockSelection}
        lockMessage="Önce salon ve saat seçiniz"
      />
    </div>
  );
}
