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
  cinemaHallsPricingApi, // GET /cinemas/{id}/halls/pricing
} from "@/helpers/api-routes";
import { savePendingOrder } from "@/lib/utils/checkout";

export default function BuyTicketPage() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const localeSegment = pathname?.split("/")?.[1] || "tr";
  const basePath = `/${localeSegment}`;

  // --- Query Params ---
  const cinemaId = params.get("cinemaId");
  const date = params.get("date");       // YYYY-MM-DD
  const movieId = params.get("movieId");
  const timeFromUrlRaw = params.get("time"); // "20:00"

  const timeFromUrl =
    timeFromUrlRaw ? (timeFromUrlRaw.length === 5 ? timeFromUrlRaw + ":00" : timeFromUrlRaw) : "";

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cinema, setCinema] = useState(null); // { id, name }
  const [movie, setMovie] = useState(null);   // { id, title }

  const [halls, setHalls] = useState([]);     // [{id,name,movies:[...]}]
  // hallId -> { isSpecial, label, percent, fixed }
  const [specialByHallId, setSpecialByHallId] = useState({});

  const [selectedHallId, setSelectedHallId] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);

  const didAutoSelectRef = useRef(false);
  const initialHallIdRef = useRef(null);
  const initialTimeRef = useRef("");

  // Seat grid
  const ROWS = 8;
  const COLS = 12;

  // Helpers
  const BASE_PRICE = 9.99;

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

  const normTime = (iso) => String(iso).slice(11, 19);
  const findHallById = (id) =>
    halls.find((h) => String(h?.id ?? h?.hallId) === String(id)) || null;

  // fallback special meta
  function readSpecialMetaFromHallObj(h) {
    if (!h) return { isSpecial: false, label: "", percent: 0, fixed: 0 };
    const isSpecial =
      !!h?.isSpecial ||
      !!h?.specialHall ||
      !!h?.specialType ||
      !!h?.type ||
      (Number(h?.surchargePercent) > 0) ||
      (Number(h?.surchargeFixed) > 0);

    const typeObj = h?.specialHall?.type || h?.specialType || h?.type || {};
    const label =
      typeObj?.name || h?.specialHall?.name || h?.label || (isSpecial ? "Special Hall" : "");
    const percent =
      Number(
        typeObj?.surchargePercent ??
          typeObj?.priceDeltaPercent ??
          h?.surchargePercent ??
          0
      ) || 0;
    const fixed =
      Number(
        typeObj?.surchargeFixed ??
          typeObj?.priceDeltaFixed ??
          h?.surchargeFixed ??
          0
      ) || 0;

    return { isSpecial, label, percent, fixed };
  }

  function getHallSpecialMetaById(hallId) {
    if (!hallId) return { isSpecial: false, label: "", percent: 0, fixed: 0 };
    const hit = specialByHallId[String(hallId)];
    if (hit) return hit;
    return readSpecialMetaFromHallObj(findHallById(hallId));
  }

  const effectiveHallId = selectedHallId ?? initialHallIdRef.current ?? null;
  const effectiveTime = selectedTime || initialTimeRef.current || "";

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

        // cinema
        const cRes = await axios.get(cinemaByIdApi(cinemaId), { headers: authHeaders() });
        const cBody = cRes.data?.returnBody ?? cRes.data;
        setCinema({ id: cinemaId, name: cBody?.name });

        // movie
        const mRes = await axios.get(movieByIdApi(movieId), { headers: authHeaders() });
        const mBody = mRes.data?.returnBody ?? mRes.data;
        setMovie({ id: movieId, title: mBody?.title });

        // halls + showtimes
        const sRes = await axios.get(cinemaHallsApi(cinemaId), { headers: authHeaders() });
        const sBody = sRes.data?.returnBody ?? sRes.data;
        const hallsArr = Array.isArray(sBody) ? sBody : [];
        setHalls(hallsArr);

        // pricing (id-bazlı)
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
            if (hallId == null) continue;

            const isSpecial = Boolean(
              row?.isSpecial ?? row?.special ?? row?.specialHall ?? row?.type
            );

            const percentRaw =
              row?.surchargePercent ??
              row?.priceDeltaPercent ??
              row?.deltaPercent ??
              row?.extraPercent ??
              row?.percent ??
              row?.surcharge?.percent ??
              row?.type?.surchargePercent ??
              row?.type?.priceDeltaPercent ??
              row?.type?.percent ??
              0;

            const fixedRaw =
              row?.surchargeFixed ??
              row?.priceDeltaFixed ??
              row?.deltaFixed ??
              row?.extraFixed ??
              row?.fixed ??
              row?.surcharge?.fixed ??
              row?.type?.surchargeFixed ??
              row?.type?.priceDeltaFixed ??
              row?.type?.fixed ??
              0;

            const toNumber = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
            let percent = toNumber(percentRaw);
            if (percent > 0 && percent < 1) percent = Number((percent * 100).toFixed(4));
            const fixed = toNumber(fixedRaw);

            const label = row?.typeName ?? row?.type?.name ?? (isSpecial ? "Special Hall" : "");

            byId[String(hallId)] = { isSpecial, label, percent, fixed };
          }

          setSpecialByHallId(byId);
        } catch {
          // pricing yoksa base ile devam
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

  /* =================== Prefill hall/time from URL =================== */
  useEffect(() => {
    if (!sessions.length || !timeFromUrl) return;
    if (initialHallIdRef.current && initialTimeRef.current) return;

    const match = sessions.find((s) => s.times.includes(timeFromUrl));
    if (match) {
      initialHallIdRef.current = match.hallId;
      initialTimeRef.current = timeFromUrl;
      setSelectedHallId(match.hallId);
      setSelectedTime(timeFromUrl);
      didAutoSelectRef.current = true;
    }
  }, [sessions, timeFromUrl]);

  /* ========== Keep selections valid if sessions change ========== */
  useEffect(() => {
    if (
      !didAutoSelectRef.current &&
      !selectedHallId &&
      !selectedTime &&
      !initialHallIdRef.current &&
      !initialTimeRef.current
    ) {
      return;
    }

    const hallStillValid = sessions.some((s) => String(s.hallId) === String(effectiveHallId));
    if (!hallStillValid) {
      initialHallIdRef.current = null;
      initialTimeRef.current = "";
      setSelectedHallId(null);
      setSelectedTime("");
      setSelectedSeats([]);
      return;
    }

    const hallObj = sessions.find((s) => String(s.hallId) === String(effectiveHallId));
    if (hallObj && !hallObj.times.includes(effectiveTime)) {
      initialTimeRef.current = "";
      setSelectedTime("");
      setSelectedSeats([]);
      return;
    }

    setSelectedSeats([]);
  }, [sessions, selectedHallId, selectedTime, effectiveHallId, effectiveTime]);

  /* ============================ Pricing ============================ */
  const specialMeta = useMemo(
    () => getHallSpecialMetaById(effectiveHallId),
    [effectiveHallId, specialByHallId, halls]
  );

  const unitPrice = useMemo(() => {
    const base = BASE_PRICE;
    const extraFromPercent = base * (Number(specialMeta.percent || 0) / 100);
    const extraFromFixed = Number(specialMeta.fixed || 0);
    return Number((base + extraFromPercent + extraFromFixed).toFixed(2));
  }, [specialMeta]);

  const seatCount = selectedSeats.length;
  const totalPrice = useMemo(
    () => Number((seatCount * unitPrice).toFixed(2)),
    [seatCount, unitPrice]
  );

  /* ============== CONTINUE TO PAYMENT (save -> nav) ============== */
  const continueToPayment = () => {
    setError(null);

    const hallObj = findHallById(effectiveHallId);
    const hallName = hallObj?.name ?? hallObj?.hallName ?? "";

    if (
      !movie?.title ||
      !cinema?.name ||
      !effectiveHallId ||
      !hallName ||
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
      hallId: effectiveHallId,
      hall: hallName,
      seats: [...selectedSeats],
      pricing: {
        currency: "USD",
        baseUnit: BASE_PRICE,
        special: {
          isSpecial: !!specialMeta.isSpecial,
          label: specialMeta.label || "",
          percent: Number(specialMeta.percent || 0),
          fixed: Number(specialMeta.fixed || 0),
        },
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

        {/* hall (value = hallId) */}
        <Form.Group className="mb-3">
          <Form.Label className="text-muted">Salon</Form.Label>
          <Form.Select
            value={String(selectedHallId ?? initialHallIdRef.current ?? "")}
            onChange={(e) => {
              const newId = e.target.value ? Number(e.target.value) : null;
              initialHallIdRef.current = newId;
              setSelectedHallId(newId);
              initialTimeRef.current = "";
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

        {/* time */}
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
            disabled={!effectiveHallId}
          >
            <option value="">Saat Seçiniz</option>
            {(sessions.find((s) => String(s.hallId) === String(effectiveHallId))?.times ?? [])
              .map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
          </Form.Select>
        </Form.Group>

        {/* price summary */}
        <div className="mb-3">
          <div className="p-3 rounded" style={{ background: "#22252b", border: "1px solid #333" }}>
            <div className="d-flex flex-wrap align-items-center gap-3">
              <div>
                <div className="text-muted small">Bilet Sayısı</div>
                <div className="fs-4 fw-bold text-warning">{seatCount}</div>
              </div>
              <div className="vr" />
              <div>
                <div className="text-muted small">Birim Fiyat</div>
                <div className="fs-5">
                  {formatUSD(unitPrice)}{" "}
                  {specialMeta.isSpecial && (
                    <Badge bg="warning" className="ms-2 text-dark">
                      {specialMeta.label || "Special"}
                      {specialMeta.fixed ? ` +${formatUSD(specialMeta.fixed)}` : ""}
                      {specialMeta.percent ? ` +${specialMeta.percent}%` : ""}
                    </Badge>
                  )}
                </div>
                {specialMeta.isSpecial && (
                  <div className="small text-secondary">
                    Base: {formatUSD(BASE_PRICE)}
                    {specialMeta.fixed ? <> · Fixed: {formatUSD(specialMeta.fixed)}</> : null}
                    {specialMeta.percent ? <> · %: {specialMeta.percent}%</> : null}
                  </div>
                )}
              </div>
              <div className="vr" />
              <div className="flex-grow-1">
                <div className="text-muted small">Seçilen Koltuklar</div>
                <div className="d-flex flex-wrap gap-2">
                  {selectedSeats.length === 0
                    ? <span className="text-secondary">Koltuk seçilmedi</span>
                    : selectedSeats.sort((a, b) => a.localeCompare(b)).map((s) => (
                        <Badge key={s} bg="secondary" className="px-2 py-1">{s}</Badge>
                      ))}
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
            hall={findHallById(effectiveHallId)?.name || ""}
            cinema={cinema?.name || ""}
            dateISO={date}
            timeISO={effectiveTime}
            value={selectedSeats}
            onChange={setSelectedSeats}
            lockWhenMissingFields={true}
          />
        </div>

        <Button
          variant="warning"
          className="w-100"
          disabled={!effectiveHallId || !effectiveTime || selectedSeats.length === 0}
          onClick={continueToPayment}
        >
          {seatCount > 0 ? `Devam Et — ${formatUSD(totalPrice)}` : "Devam Et"}
        </Button>
      </div>
    </div>
  );
}
