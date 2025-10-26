/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { Form, Button, Spinner, Alert, Badge } from "react-bootstrap";
import SeatPickerRemote from "@/components/tickets/SeatMap";
import { authHeaders } from "@/lib/utils/http";
import {
  cinemaByIdApi,
  movieByIdApi,
  cinemaHallsApi,
} from "@/helpers/api-routes";
import { savePendingOrder } from "@/lib/utils/checkout"; // <-- handoff to payment

export default function BuyTicketPage() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const localeSegment = pathname?.split("/")?.[1] || "tr";
  const basePath = `/${localeSegment}`;

  // --- query params from TicketSelector ---
  const cityId = params.get("cityId");
  const cinemaId = params.get("cinemaId");
  const date = params.get("date"); // YYYY-MM-DD
  const movieId = params.get("movieId");
  const timeFromUrlRaw = params.get("time"); // "20:00" from previous page

  // normalize ?time=20:00 -> "20:00:00"
  const timeFromUrl = timeFromUrlRaw
    ? timeFromUrlRaw.length === 5
      ? timeFromUrlRaw + ":00"
      : timeFromUrlRaw
    : "";

  // --- page state ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // names for payload
  const [cinema, setCinema] = useState(null); // { id, name }
  const [movie, setMovie] = useState(null); // { id, title }

  // halls+showtimes payload (from /show-times/cinema/{cinemaId})
  // shape from backend:
  // [
  //   {
  //     name: "Hall 1",
  //     movies: [
  //       {
  //         movie: { id: 2063, title: "Avatar..." },
  //         times: ["2025-10-26T20:00:00", "2025-10-26T22:00:00"]
  //       }
  //     ]
  //   },
  //   ...
  // ]
  const [halls, setHalls] = useState([]);

  // user selections
  const [selectedHall, setSelectedHall] = useState(""); // "Hall 1"
  const [selectedTime, setSelectedTime] = useState(""); // "HH:mm:ss"
  const [selectedSeats, setSelectedSeats] = useState([]); // ["A1","A2",...]

  // after we auto-fill from URL the first time, we mark it so we don't instantly wipe it
  const didAutoSelectRef = useRef(false);

  // refs that hold the initial guess for hall/time so they survive remounts / hydration mismatch
  const initialHallRef = useRef("");
  const initialTimeRef = useRef("");

  // SeatMap grid config
  const ROWS = 8; // A..H
  const COLS = 12; // 1..12

  // --- PRICING -------------------------------------------------
  const getUnitPrice = () => 9.99; // USD
  const unitPrice = getUnitPrice();

  const formatUSD = (n) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(n);
    } catch {
      return `$${Number(n).toFixed(2)}`;
    }
  };

  const seatCount = selectedSeats.length;
  const totalPrice = seatCount * unitPrice;

  // --- fetch basics (cinema, movie, halls/showtimes) -----------
  useEffect(() => {
    if (!cinemaId || !movieId || !date) {
      setError(
        "Gerekli parametreler eksik. Lütfen seçim sayfasına geri dönün."
      );
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // cinema name
        const cRes = await axios.get(cinemaByIdApi(cinemaId), {
          headers: authHeaders(),
        });
        const cBody = cRes.data?.returnBody ?? cRes.data;
        setCinema({ id: cinemaId, name: cBody?.name });

        // movie title
        const mRes = await axios.get(movieByIdApi(movieId), {
          headers: authHeaders(),
        });
        const mBody = mRes.data?.returnBody ?? mRes.data;
        setMovie({ id: movieId, title: mBody?.title });

        // halls + showtimes
        const sRes = await axios.get(cinemaHallsApi(cinemaId), {
          headers: authHeaders(),
        });
        const sBody = sRes.data?.returnBody ?? sRes.data;
        setHalls(Array.isArray(sBody) ? sBody : []);
      } catch (e) {
        console.error(e);
        setError("Veriler yüklenemedi. Lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    })();
  }, [cinemaId, movieId, date]);

  // --- sessions available for this date + movie (group by hall) ---
  // we flatten backend shape into:
  // [
  //   { hallName: "Hall 1", times: ["20:00:00","22:00:00"] },
  //   { hallName: "Hall 2", times: ["18:30:00"] }
  // ]
  const sessions = useMemo(() => {
    if (!halls?.length || !date || !movieId) return [];
    return halls
      .map((h) => {
        const times = (h.movies || [])
          .filter((mm) => String(mm?.movie?.id) === String(movieId))
          .flatMap((mm) => mm.times || [])
          .filter((iso) => String(iso).slice(0, 10) === date)
          .map((iso) => String(iso).slice(11, 19)); // "HH:mm:ss"
        return { hallName: h.name, times: [...new Set(times)] };
      })
      .filter((x) => x.times.length > 0);
  }, [halls, movieId, date]);

  // --- PREFILL hall/time from URL ---
  // 1. When sessions load, try to match the ?time= param to a hall
  // 2. Store that in both state AND refs
  // 3. Refs survive hot reload / hydration mismatch so dropdown still shows correct default visually
  useEffect(() => {
    if (!sessions.length) return;
    if (!timeFromUrl) return;

    // if we already stored an initial guess, don't redo it
    if (initialHallRef.current && initialTimeRef.current) return;

    const match = sessions.find((s) => s.times.includes(timeFromUrl));
    if (match) {
      initialHallRef.current = match.hallName;
      initialTimeRef.current = timeFromUrl;

      setSelectedHall(match.hallName);
      setSelectedTime(timeFromUrl);
      didAutoSelectRef.current = true;
    }
  }, [sessions, timeFromUrl]);

  // --- keep selections valid if sessions change after initial load ---
  useEffect(() => {
    // If nothing is chosen at all, don't touch anything
    if (
      !didAutoSelectRef.current &&
      !selectedHall &&
      !selectedTime &&
      !initialHallRef.current &&
      !initialTimeRef.current
    ) {
      return;
    }

    // figure out what hall/time we're "showing" right now:
    const effectiveHall = selectedHall || initialHallRef.current || "";
    const effectiveTime = selectedTime || initialTimeRef.current || "";

    // check hall still exists
    const hallStillValid = sessions.some((s) => s.hallName === effectiveHall);

    if (!hallStillValid) {
      // wipe everything because that hall isn't in sessions anymore
      initialHallRef.current = "";
      initialTimeRef.current = "";
      setSelectedHall("");
      setSelectedTime("");
      setSelectedSeats([]);
      return;
    }

    // hall exists. does that hall still have this time?
    const hallObj = sessions.find((s) => s.hallName === effectiveHall);
    if (hallObj && !hallObj.times.includes(effectiveTime)) {
      // time is gone, keep hall but drop time
      initialTimeRef.current = "";
      setSelectedTime("");
      setSelectedSeats([]);
      return;
    }

    // If hall/time changed, always clear seats
    setSelectedSeats([]);
  }, [sessions, selectedHall, selectedTime]);

  // ---- CONTINUE TO PAYMENT (save order -> navigate) ----
  const continueToPayment = () => {
    setError(null);

    const effectiveHall = selectedHall || initialHallRef.current || "";
    const effectiveTime = selectedTime || initialTimeRef.current || "";

    if (
      !movie?.title ||
      !cinema?.name ||
      !effectiveHall ||
      !date ||
      !effectiveTime ||
      selectedSeats.length === 0
    ) {
      setError("Lütfen salon, seans ve koltuk seçin.");
      return;
    }

    const order = {
      cinemaId,
      movieId,
      cinemaName: cinema.name,
      movieTitle: movie.title,
      date,
      time: effectiveTime,
      hall: effectiveHall,
      seats: [...selectedSeats],
      pricing: {
        unitPrice,
        currency: "USD",
        total: totalPrice,
        seats: selectedSeats.length,
      },
    };

    savePendingOrder(order);
    router.push(`${basePath}/payment`);
  };

  // seat picker is only active if we have a hall+time picked
  const effectiveHall = selectedHall || initialHallRef.current || "";
  const effectiveTime = selectedTime || initialTimeRef.current || "";
  const canPickSeats = Boolean(effectiveHall && effectiveTime);

  if (loading)
    return (
      <div className="container py-4">
        <Spinner animation="border" />
      </div>
    );

  return (
    <div className="container py-4" style={{ maxWidth: 960 }}>
      <div className="p-3 bg-dark text-light rounded">
        <h4 className="text-warning mb-3">🎟️ Bilet Satın Al</h4>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        {/* context */}
        <div className="mb-3">
          <div>
            <b>Sinema:</b> {cinema?.name}
          </div>
          <div>
            <b>Tarih:</b> {date}
          </div>
          <div>
            <b>Film:</b> {movie?.title}
          </div>
        </div>

        {/* hall */}
        <Form.Group className="mb-3">
          <Form.Label className="text-muted">Salon</Form.Label>
          <Form.Select
            value={selectedHall || initialHallRef.current || ""}
            onChange={(e) => {
              // user manually changed hall, so from now on we trust state, not ref
              const newHall = e.target.value;
              initialHallRef.current = newHall;
              setSelectedHall(newHall);

              // when hall changes, reset time + seats
              initialTimeRef.current = "";
              setSelectedTime("");
              setSelectedSeats([]);
            }}
          >
            <option value="">Salon Seçiniz</option>
            {sessions.map((s) => (
              <option key={s.hallName} value={s.hallName}>
                {s.hallName}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* time */}
        <Form.Group className="mb-3">
          <Form.Label className="text-muted">Seans</Form.Label>
          <Form.Select
            value={selectedTime || initialTimeRef.current || ""}
            onChange={(e) => {
              // user manually changed time, so trust state, not ref
              const newTime = e.target.value;
              initialTimeRef.current = newTime;
              setSelectedTime(newTime);

              // when time changes, reset seats
              setSelectedSeats([]);
            }}
            disabled={!(selectedHall || initialHallRef.current)}
          >
            <option value="">Saat Seçiniz</option>
            {(
              sessions.find(
                (s) =>
                  s.hallName === (selectedHall || initialHallRef.current || "")
              )?.times ?? []
            ).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* price summary */}
        <div className="mb-3">
          <div
            className="p-3 rounded"
            style={{ background: "#22252b", border: "1px solid #333" }}
          >
            <div className="d-flex flex-wrap align-items-center gap-3">
              <div>
                <div className="text-muted small">Bilet Sayısı</div>
                <div className="fs-4 fw-bold text-warning">{seatCount}</div>
              </div>
              <div className="vr" />
              <div>
                <div className="text-muted small">Birim Fiyat</div>
                <div className="fs-5">{formatUSD(unitPrice)}</div>
              </div>
              <div className="vr" />
              <div className="flex-grow-1">
                <div className="text-muted small">Seçilen Koltuklar</div>
                <div className="d-flex flex-wrap gap-2">
                  {selectedSeats.length === 0 ? (
                    <span className="text-secondary">Koltuk seçilmedi</span>
                  ) : (
                    selectedSeats
                      .sort((a, b) => a.localeCompare(b))
                      .map((s) => (
                        <Badge key={s} bg="secondary" className="px-2 py-1">
                          {s}
                        </Badge>
                      ))
                  )}
                </div>
              </div>
              <div className="vr" />
              <div>
                <div className="text-muted small">Toplam</div>
                <div className="fs-4 fw-bold">{formatUSD(totalPrice)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* seat map */}
        <div className="mb-3">
          <Form.Label className="text-muted">Koltuk Seçimi</Form.Label>
          <SeatPickerRemote
            rows={ROWS}
            cols={COLS}
            movieName={movie?.title || ""}
            hall={effectiveHall}
            cinema={cinema?.name || ""}
            dateISO={date}
            timeISO={effectiveTime}
            value={selectedSeats}
            onChange={setSelectedSeats}
            lockWhenMissingFields={true}
            // SeatPickerRemote should already ignore clicks if hall/time missing,
            // but we also computed canPickSeats if you want to gray it out, etc.
          />
        </div>

        <Button
          variant="warning"
          className="w-100"
          disabled={
            !effectiveHall || !effectiveTime || selectedSeats.length === 0
          }
          onClick={continueToPayment}
        >
          {seatCount > 0 ? `Devam Et — ${formatUSD(totalPrice)}` : "Devam Et"}
        </Button>
      </div>
    </div>
  );
}
