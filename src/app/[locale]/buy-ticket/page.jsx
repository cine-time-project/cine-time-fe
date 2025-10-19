/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useMemo, useState } from "react";
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

  // --- page state ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // names for payload
  const [cinema, setCinema] = useState(null); // { id, name }
  const [movie, setMovie] = useState(null); // { id, title }

  // halls+showtimes payload (from /show-times/cinema/{cinemaId})
  const [halls, setHalls] = useState([]); // [{ name, movies:[{movie:{id,title}, times:[ISO...]}], ... }]

  // user selections
  const [selectedHall, setSelectedHall] = useState(""); // "Hall 2"
  const [selectedTime, setSelectedTime] = useState(""); // "HH:mm:ss"
  const [selectedSeats, setSelectedSeats] = useState([]); // ["A1","A2",...]

  // SeatMap grid config (change to match your halls if needed)
  const ROWS = 8; // A..H
  const COLS = 12; // 1..12

  // --- PRICING (simple flat price for now) -------------------------------
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

  // --- fetch basics ---
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

        // cinema name (C03)
       const cRes = await axios.get(cinemaByIdApi(cinemaId), {
    headers: authHeaders(),
  });
        const cBody = cRes.data?.returnBody ?? cRes.data;
        setCinema({ id: cinemaId, name: cBody?.name });

        // movie title (M09)
    const mRes = await axios.get(movieByIdApi(movieId), {
    headers: authHeaders(),
  });
        const mBody = mRes.data?.returnBody ?? mRes.data;
        setMovie({ id: movieId, title: mBody?.title });

        // halls + showtimes (S01)
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
  const sessions = useMemo(() => {
    if (!halls?.length || !date || !movieId) return [];
    // shape: [{ hallName, times: ["HH:mm:ss", ...] }]
    return halls
      .map((h) => {
        const times = (h.movies || [])
          .filter((mm) => String(mm?.movie?.id) === String(movieId))
          .flatMap((mm) => mm.times || [])
          .filter((iso) => String(iso).slice(0, 10) === date)
          .map((iso) => String(iso).slice(11, 19)); // HH:mm:ss
        return { hallName: h.name, times: [...new Set(times)] };
      })
      .filter((x) => x.times.length > 0);
  }, [halls, movieId, date]);

  // keep selections valid if data changes
  useEffect(() => {
    if (!sessions.some((s) => s.hallName === selectedHall)) {
      setSelectedHall("");
      setSelectedTime("");
    } else if (selectedHall) {
      const hall = sessions.find((s) => s.hallName === selectedHall);
      if (hall && !hall.times.includes(selectedTime)) {
        setSelectedTime("");
      }
    }
    // anytime hall/time changes → clear seat picks
    setSelectedSeats([]);
  }, [sessions, selectedHall, selectedTime]);


  // ---- CONTINUE TO PAYMENT (save order -> navigate) ----------------------
  const continueToPayment = () => {
    setError(null);

    if (
      !movie?.title ||
      !cinema?.name ||
      !selectedHall ||
      !date ||
      !selectedTime ||
      selectedSeats.length === 0
    ) {
      setError("Lütfen salon, seans ve koltuk seçin.");
      return;
    }

    // Build order snapshot for the payment page
    const order = {
      cinemaId,
      movieId,
      cinemaName: cinema.name,
      movieTitle: movie.title,
      date,
      time: selectedTime,
      hall: selectedHall,
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

  // ✅ compute once per render, NOT inside JSX
  const canPickSeats = Boolean(selectedHall && selectedTime);

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
            value={selectedHall}
            onChange={(e) => setSelectedHall(e.target.value)}
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
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            disabled={!selectedHall}
          >
            <option value="">Saat Seçiniz</option>
            {(
              sessions.find((s) => s.hallName === selectedHall)?.times ?? []
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
            hall={selectedHall}
            cinema={cinema?.name || ""}
            dateISO={date}
            timeISO={selectedTime}
            value={selectedSeats}
            onChange={setSelectedSeats}
            // Automatically locks until all identifiers exist
            lockWhenMissingFields={true}
          />
        </div>

        <Button
          variant="warning"
          className="w-100"
          disabled={
            !selectedHall || !selectedTime || selectedSeats.length === 0
          }
          onClick={continueToPayment}
        >
          {seatCount > 0 ? `Devam Et — ${formatUSD(totalPrice)}` : "Devam Et"}
        </Button>
      </div>
    </div>
  );
}
