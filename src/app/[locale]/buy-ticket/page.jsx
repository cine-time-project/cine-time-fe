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
  cinemaHallsPricingApi,
} from "@/helpers/api-routes";
import { savePendingOrder } from "@/lib/utils/checkout";

export default function BuyTicketPage() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const localeSegment = pathname?.split("/")?.[1] || "tr";
  const basePath = `/${localeSegment}`;

  // --- Query Params ---
  const cityId = params.get("cityId");
  const cinemaId = params.get("cinemaId");
  const date = params.get("date");
  const movieId = params.get("movieId");
  const hallIdFromUrl = params.get("hallId");

  // Normalize time param (e.g. "17:00" → "17:00:00")
  const timeFromUrlRaw = params.get("time");
  const timeFromUrl =
    timeFromUrlRaw && timeFromUrlRaw.length === 5
      ? `${timeFromUrlRaw}:00`
      : timeFromUrlRaw || "";

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cinema, setCinema] = useState(null);
  const [movie, setMovie] = useState(null);
  const [halls, setHalls] = useState([]);
  const [specialByHallId, setSpecialByHallId] = useState({});

  const [selectedHallId, setSelectedHallId] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);

  const didAutoSelectRef = useRef(false);
  const initialHallIdRef = useRef(null);
  const initialTimeRef = useRef("");

  const ROWS = 8;
  const COLS = 12;
  const BASE_PRICE = 9.99;

  const formatUSD = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  const normTime = (iso) => String(iso).slice(11, 19);
  const findHallById = (id) =>
    halls.find((h) => String(h?.id ?? h?.hallId) === String(id)) || null;

  /* =============================== Fetch =============================== */
  useEffect(() => {
    if (!cinemaId || !movieId || !date) {
      setError("Gerekli parametreler eksik. Lütfen seçim sayfasına geri dönün.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch cinema
        const cRes = await axios.get(cinemaByIdApi(cinemaId), { headers: authHeaders() });
        const cBody = cRes.data?.returnBody ?? cRes.data;
        setCinema({ id: cinemaId, name: cBody?.name });

        // Fetch movie
        const mRes = await axios.get(movieByIdApi(movieId), { headers: authHeaders() });
        const mBody = mRes.data?.returnBody ?? mRes.data;
        setMovie({ id: movieId, title: mBody?.title });

        // Fetch halls + showtimes
        const sRes = await axios.get(cinemaHallsApi(cinemaId), { headers: authHeaders() });
        const sBody = sRes.data?.returnBody ?? sRes.data;
        setHalls(Array.isArray(sBody) ? sBody : []);

        // Fetch hall pricing info
        try {
          const pRes = await axios.get(cinemaHallsPricingApi(cinemaId), {
            headers: authHeaders(),
            validateStatus: () => true,
          });

          const raw = pRes.data?.returnBody ?? pRes.data ?? [];
          const list = Array.isArray(raw) ? raw : raw?.content ?? [];
          const byId = {};

          for (const row of list) {
            const hallId =
              row?.hallId ?? row?.id ?? row?.hall?.id ?? row?.hallID ?? row?.hall_id;
            if (!hallId) continue;

            const isSpecial = Boolean(
              row?.isSpecial ?? row?.special ?? row?.specialHall ?? row?.type
            );

            const percent = Number(
              row?.surchargePercent ??
                row?.priceDeltaPercent ??
                row?.deltaPercent ??
                0
            );

            const fixed = Number(
              row?.surchargeFixed ??
                row?.priceDeltaFixed ??
                row?.deltaFixed ??
                0
            );

            const label = row?.typeName ?? row?.type?.name ?? (isSpecial ? "Special Hall" : "");

            byId[String(hallId)] = { isSpecial, label, percent, fixed };
          }

          setSpecialByHallId(byId);
        } catch {
          // If pricing not available, skip silently
        }
      } catch (e) {
        console.error(e);
        setError("Veriler yüklenemedi. Lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    })();
  }, [cinemaId, movieId, date]);

  /* ============================ Sessions ============================ */
  const sessions = useMemo(() => {
    if (!halls?.length || !date || !movieId) return [];
    return halls
      .map((h) => {
        const id = h?.id ?? h?.hallId;
        const name = h?.name ?? h?.hallName ?? `Hall ${id ?? "?"}`;
        const times = (h?.movies || [])
          .filter((mm) => String(mm?.movie?.id) === String(movieId))
          .flatMap((mm) => mm?.times || [])
          .filter((iso) => String(iso).slice(0, 10) === date)
          .map(normTime);
        return { hallId: id, hallName: name, times: [...new Set(times)] };
      })
      .filter((x) => x.hallId != null && x.times.length > 0);
  }, [halls, movieId, date]);

  /* =================== AUTO PREFILL FROM URL =================== */
  useEffect(() => {
    // Wait until sessions are loaded
    if (!sessions.length) return;
    if (didAutoSelectRef.current) return;

    // If hallId param is provided, preselect that hall
    if (hallIdFromUrl) {
      const hallExists = sessions.some((s) => String(s.hallId) === String(hallIdFromUrl));
      if (hallExists) {
        initialHallIdRef.current = Number(hallIdFromUrl);
        setSelectedHallId(Number(hallIdFromUrl));
      }
    }

    // If time param is provided, match it to hall
    if (timeFromUrl) {
      const match = sessions.find((s) => s.times.includes(timeFromUrl));
      if (match) {
        initialHallIdRef.current = match.hallId;
        initialTimeRef.current = timeFromUrl;
        setSelectedHallId(match.hallId);
        setSelectedTime(timeFromUrl);
      }
    }

    didAutoSelectRef.current = true;
  }, [sessions, hallIdFromUrl, timeFromUrl]);

  /* ============================ Pricing ============================ */
  const specialMeta = useMemo(() => {
    const id = selectedHallId ?? initialHallIdRef.current;
    return specialByHallId[String(id)] || { isSpecial: false, label: "", percent: 0, fixed: 0 };
  }, [selectedHallId, specialByHallId]);

  const unitPrice = useMemo(() => {
    const extraFromPercent = BASE_PRICE * (Number(specialMeta.percent || 0) / 100);
    const extraFromFixed = Number(specialMeta.fixed || 0);
    return Number((BASE_PRICE + extraFromPercent + extraFromFixed).toFixed(2));
  }, [specialMeta]);

  const totalPrice = Number((selectedSeats.length * unitPrice).toFixed(2));

  /* =================== CONTINUE TO PAYMENT =================== */
  const continueToPayment = () => {
    if (!cinema || !movie || !date || !selectedHallId || !selectedTime || !selectedSeats.length) {
      setError("Lütfen salon, seans ve koltuk seçin.");
      return;
    }

    const hallObj = findHallById(selectedHallId);
    const order = {
      cinemaId,
      movieId,
      cinemaName: cinema.name,
      movieTitle: movie.title,
      date,
      time: selectedTime,
      hallId: selectedHallId,
      hall: hallObj?.name || "",
      seats: selectedSeats,
      pricing: {
        currency: "USD",
        baseUnit: BASE_PRICE,
        special: specialMeta,
        unitPrice,
        seats: selectedSeats.length,
        total: totalPrice,
      },
    };

    savePendingOrder(order);
    router.push(`${basePath}/payment`);
  };

  /* =============================== Render =============================== */
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
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

        <div className="mb-3">
          <div><b>Sinema:</b> {cinema?.name}</div>
          <div><b>Tarih:</b> {date}</div>
          <div><b>Film:</b> {movie?.title}</div>
        </div>

        {/* Hall Selector */}
        <Form.Group className="mb-3">
          <Form.Label className="text-muted">Salon</Form.Label>
          <Form.Select
            value={String(selectedHallId ?? initialHallIdRef.current ?? "")}
            onChange={(e) => {
              const newId = e.target.value ? Number(e.target.value) : null;
              initialHallIdRef.current = newId;
              setSelectedHallId(newId);
              setSelectedTime("");
              setSelectedSeats([]);
            }}
          >
            <option value="">Salon Seçiniz</option>
            {sessions.map((s) => (
              <option key={s.hallId} value={s.hallId}>
                {s.hallName}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Time Selector */}
        <Form.Group className="mb-3">
          <Form.Label className="text-muted">Seans</Form.Label>
          <Form.Select
            value={selectedTime || initialTimeRef.current || ""}
            onChange={(e) => {
              const newTime = e.target.value;
              initialTimeRef.current = newTime;
              setSelectedTime(newTime);
              setSelectedSeats([]);
            }}
            disabled={!selectedHallId}
          >
            <option value="">Saat Seçiniz</option>
            {(sessions.find((s) => String(s.hallId) === String(selectedHallId))?.times ?? [])
              .map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
          </Form.Select>
        </Form.Group>

        {/* Seat map */}
        <div className="mb-3">
          <Form.Label className="text-muted">Koltuk Seçimi</Form.Label>
          <SeatPickerRemote
            rows={ROWS}
            cols={COLS}
            movieName={movie?.title || ""}
            hall={findHallById(selectedHallId)?.name || ""}
            cinema={cinema?.name || ""}
            dateISO={date}
            timeISO={selectedTime}
            value={selectedSeats}
            onChange={setSelectedSeats}
            lockWhenMissingFields={true}
          />
        </div>

        <Button
          variant="warning"
          className="w-100"
          disabled={!selectedHallId || !selectedTime || selectedSeats.length === 0}
          onClick={continueToPayment}
        >
          {selectedSeats.length > 0
            ? `Devam Et — ${formatUSD(totalPrice)}`
            : "Devam Et"}
        </Button>
      </div>
    </div>
  );
}
