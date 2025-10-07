/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Form, Button, Spinner, Alert } from "react-bootstrap";
import SeatMap from "@/components/tickets/SeatMap";
import { API_BASE as API, authHeaders } from "@/lib/utils/http";

export default function BuyTicketPage() {
  const params = useSearchParams();
  const router = useRouter();

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
        const cRes = await axios.get(`${API}/cinemas/${cinemaId}`, {
          headers: authHeaders(),
        });
        const cBody = cRes.data?.returnBody ?? cRes.data;
        setCinema({ id: cinemaId, name: cBody?.name });

        // movie title (M09)
        const mRes = await axios.get(`${API}/movies/id/${movieId}`, {
          headers: authHeaders(),
        });
        const mBody = mRes.data?.returnBody ?? mRes.data;
        setMovie({ id: movieId, title: mBody?.title });

        // halls + showtimes (S01)
        const sRes = await axios.get(`${API}/show-times/cinema/${cinemaId}`, {
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

  // SeatMap toggler: stores "A1","B3",...
  const toggleSeat = (letter, number) => {
    const id = `${letter}${number}`;
    setSelectedSeats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // convert "A1" → { seatLetter:"A", seatNumber:1 }
  const toSeatInfo = (id) => {
    const seatLetter = id[0];
    const seatNumber = Number(id.slice(1));
    return { seatLetter, seatNumber };
  };

  // call /tickets/buy-ticket with your payload (uses authHeaders from lib)
  const buy = async () => {
    try {
      setError(null);

      // minimal validation
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

      const idempotencyKey = `BUY-${cinemaId}-${movieId}-${selectedHall}-${date}-${selectedTime}-${selectedSeats
        .sort()
        .join("_")}`;

      const payload = {
        movieName: movie.title,
        cinema: cinema.name,
        hall: selectedHall,
        date, // 'YYYY-MM-DD'
        showtime: selectedTime, // 'HH:mm:ss'
        seatInformation: selectedSeats.map(toSeatInfo),
      };

      const headers = authHeaders({
        Accept: "application/json",
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      });

      // NOTE: Right now we only create the order; payment UI will be on a separate page.
      const res = await axios.post(`${API}/tickets/buy-ticket`, payload, {
        headers,
        validateStatus: () => true,
      });

      if (res.status === 401) {
        setError("Unauthorized (401). Check CORS / token / roles.");
        return;
      }
      if (res.status >= 400) {
        setError(res.data?.message ? res.data.message : `Request failed: ${res.status}`);
        return;
      }

      // Redirect to a dedicated payment page with reference info (to be implemented)
      // Example: router.push(`/payment?paymentId=${res.data?.returnBody?.paymentId}`);
      alert("Sipariş oluşturuldu. Ödeme sayfasına yönlendirme eklenecek.");
      setSelectedSeats([]);
    } catch (e) {
      console.error(e);
      setError(
        "Satın alma başarısız. Lütfen seçimlerinizi kontrol edin veya tekrar deneyin."
      );
    }
  };

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

        {/* seat map */}
        <div className="mb-3">
          <Form.Label className="text-muted">Koltuk Seçimi</Form.Label>
          <SeatMap
            rows={ROWS}
            cols={COLS}
            selectedSeats={selectedSeats}
            onToggleSeat={toggleSeat}
          />
        </div>

        <Button
          variant="warning"
          className="w-100"
          disabled={
            !selectedHall || !selectedTime || selectedSeats.length === 0
          }
          onClick={buy}
        >
          Satın Al
        </Button>
      </div>
    </div>
  );
}
