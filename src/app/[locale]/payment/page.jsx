"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { Form, Button, Alert, Spinner, Badge } from "react-bootstrap";
import { loadPendingOrder, clearPendingOrder } from "@/lib/utils/checkout";
import { API_BASE as API, authHeaders } from "@/lib/utils/http";
import { useAuth } from "@/components/providers/AuthProvider";
import QRCode from "react-qr-code";

// --- UI helpers ---
const fmtDateLong = (dateStr) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};
const fmtTime = (timeStr) => (timeStr || "").slice(0, 5);

// Very simple .ics generator for "Add to calendar"
function buildCalendarICS({ title, description, startISO, endISO, location }) {
  const pad = (n) => String(n).padStart(2, "0");
  const toUTC = (iso) => {
    const d = new Date(iso);
    return (
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      "T" +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      "Z"
    );
  };
  const dtStart = toUTC(startISO);
  const dtEnd = toUTC(endISO);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CineTime//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@cinetime`,
    `DTSTAMP:${dtStart}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${(title || "").replace(/\n/g, " ")}`,
    `DESCRIPTION:${(description || "").replace(/\n/g, " ")}`,
    `LOCATION:${(location || "").replace(/\n/g, " ")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Blob([ics], { type: "text/calendar" });
}

export default function PaymentPage() {
  const router = useRouter();
  const pathname = usePathname();
  const localeSegment = pathname?.split("/")?.[1] || "tr";
  const basePath = `/${localeSegment}`;

  const [order, setOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // QR Code
  const [qrData, setQrData] = useState("");

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [policy, setPolicy] = useState(false);

  const formatUSD = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(n);

  useEffect(() => {
    const o = loadPendingOrder();
    setOrder(o);
    if (!o) {
      setError("Sipariş bulunamadı. Lütfen bilet seçim sayfasına dönün.");
    }
  }, []);

  // Prefill purchaser fields from backend profile (/api/user-information)
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await axios.get(`${API}/user-information`, {
          headers: authHeaders({ Accept: "application/json" }),
          validateStatus: () => true,
        });

        if (res.status === 200) {
          const body = res.data?.returnBody ?? res.data ?? {};
          const f = (body?.name || "").trim();
          const l = (body?.surname || "").trim();
          const em = (body?.email || "").trim();
          const ph = (body?.phoneNumber || "").trim();

          if (!isMounted) return;

          // Only set if user hasn't typed yet
          if (!firstName && f) setFirstName(f);
          if (!lastName && l) setLastName(l);
          if (!email && em) setEmail(em);
          if (!phone && ph) setPhone(ph);

          // Suggest card holder name from profile if empty
          const fullName = `${f} ${l}`.trim();
          if (!cardName && fullName) setCardName(fullName);
        }
      } catch (_e) {
        // ignore prefill failures; do not block checkout
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [API]);

  // Helper: deterministic QR payload builder
  const buildFallbackQr = () => {
    if (!order) return "";
    try {
      const sortedSeats = (order.seats || []).slice().sort().join("_");
      return [
        "TICKET",
        order.cinemaId,
        order.movieId,
        order.hall,
        order.date,
        order.time,
        sortedSeats,
      ].join("-");
    } catch {
      return "";
    }
  };

  const seatBadges = useMemo(() => {
    if (!order?.seats?.length) return null;
    return order.seats
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .map((s) => (
        <Badge key={s} bg="secondary" className="me-2 mb-2">
          {s}
        </Badge>
      ));
  }, [order]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!order) return;
    if (!policy) {
      setError("Lütfen gizlilik/politika kutucuğunu onaylayın.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Deterministic idempotency key
      const idempotencyKey = [
        "BUY",
        order.cinemaId,
        order.movieId,
        order.hall,
        order.date,
        order.time,
        order.seats.slice().sort().join("_"),
      ].join("-");

      // Optimistically set QR data
      setQrData(idempotencyKey);

      // Backend payload
      const payload = {
        movieName: order.movieTitle,
        cinema: order.cinemaName,
        hall: order.hall,
        date: order.date,
        showtime: order.time,
        seatInformation: order.seats.map((s) => ({
          seatLetter: s[0],
          seatNumber: Number(s.slice(1)),
        })),
        pricing: order.pricing, // { unitPrice: 9.99, currency: "USD", total, seats }
        purchaser: { firstName, lastName, phone, email }, // optional
        card: { cardName, cardNumber, expMonth, expYear, cvc }, // optional
      };

      const headers = authHeaders({
        Accept: "application/json",
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      });

      const res = await axios.post(`${API}/tickets/buy-ticket`, payload, {
        headers,
        validateStatus: () => true,
      });

      if (res.status === 401) {
        setError("Unauthorized (401). Giriş gerekli olabilir.");
        setSubmitting(false);
        return;
      }
      if (res.status >= 400) {
        setError(res.data?.message || `Ödeme başarısız: ${res.status}`);
        setSubmitting(false);
        return;
      }

      clearPendingOrder();
      const rb = res.data?.returnBody;
      setSuccess(rb || { message: "Ödeme başarılı." });

      const backendQr =
        rb?.qrData ||
        rb?.ticketCode ||
        (rb?.paymentId != null ? String(rb.paymentId) : null) ||
        idempotencyKey;

      if (backendQr) {
        setQrData(backendQr);
      } else {
        setQrData(buildFallbackQr());
      }
    } catch (err) {
      console.error(err);
      setError("Ödeme sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!order) {
    return (
      <div className="container py-4" style={{ maxWidth: 1000 }}>
        <div className="p-3 bg-dark text-light rounded">
          <h4 className="text-warning mb-3">Ödeme</h4>
          {error && <Alert variant="danger">{error}</Alert>}
          <Button
            variant="secondary"
            onClick={() => router.push(`${basePath}/buy-ticket`)}
          >
            Bilet Seçimine Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 1100 }}>
      <div className="p-3 bg-dark text-light rounded">
        <h4 className="text-warning mb-3">Ödeme Yapınız</h4>

        {error && <Alert variant="danger">{error}</Alert>}
        <div className="row g-3">
          {/* Left summary (ticket look) */}
          <div className="col-lg-4">
            <div className="ticket-summary p-3 rounded">
              <div className="d-flex justify-content-between align-items-center mb-2">
                {!success ? (
                  <Button
                    variant="link"
                    className="p-0 link-light link-underline-opacity-0"
                    onClick={() => router.back()}
                  >
                    Cancel My Reservation
                  </Button>
                ) : (
                  <span className="text-success fw-semibold">
                    ✔ Ödeme Onaylandı
                  </span>
                )}
              </div>

              {/* QR Code */}
              <div className="d-flex justify-content-center my-3">
                <div className="qr-circle d-flex align-items-center justify-content-center">
                  {success || qrData ? (
                    <QRCode
                      value={qrData || buildFallbackQr()}
                      size={104}
                      viewBox="0 0 104 104"
                    />
                  ) : (
                    <img
                      src="/images/qr-placeholder.png"
                      alt="QR Code"
                      className="qr-img"
                    />
                  )}
                </div>
              </div>

              <div className="ticket-field">
                <div className="label">TICKETS</div>
                <div className="value">
                  {order.seats.length} Adult{order.seats.length > 1 ? "s" : ""}
                </div>
              </div>

              <div className="ticket-field">
                <div className="label">AUDITORIUM</div>
                <div className="value">{order.hall}</div>
              </div>

              <div className="ticket-field">
                <div className="label">SEATS</div>
                <div className="value">{seatBadges}</div>
              </div>

              <div className="ticket-field">
                <div className="label">THEATRE</div>
                <div className="value">{order.cinemaName}</div>
              </div>

              <div className="ticket-field">
                <div className="label">DATE</div>
                <div className="value d-grid gap-1">
                  <div className="fw-semibold">{fmtDateLong(order.date)}</div>
                  <div className="text-muted small">
                    at {fmtTime(order.time)}
                  </div>
                  <div>
                    <Button
                      size="sm"
                      variant="link"
                      className="p-0 link-warning"
                      onClick={() => {
                        const start = new Date(
                          `${order.date}T${fmtTime(order.time)}:00`
                        );
                        const end = new Date(
                          start.getTime() + 2 * 60 * 60 * 1000
                        ); // +2h
                        const blob = buildCalendarICS({
                          title: order.movieTitle,
                          description: `${order.cinemaName} — ${order.hall}`,
                          startISO: start.toISOString(),
                          endISO: end.toISOString(),
                          location: order.cinemaName,
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${order.movieTitle.replace(
                          /[^a-z0-9]+/gi,
                          "-"
                        )}.ics`;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      Add to calendar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="ticket-field mt-3">
                <div className="label">PAYMENT</div>
                <div className="value fw-bold">
                  {formatUSD(order.pricing.total)}
                </div>
              </div>
            </div>
          </div>

          {/* Right side: form OR success panel */}
          <div className="col-lg-8">
            {!success ? (
              <Form onSubmit={onSubmit}>
                <h6 className="text-warning mt-2">Kişi Bilgileri</h6>
                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <Form.Control
                      placeholder="Adınız"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <Form.Control
                      placeholder="Soyadınız"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <Form.Control
                      placeholder="Telefon No"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <Form.Control
                      type="email"
                      placeholder="E-Posta"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <h6 className="text-warning mt-3">Kart Bilgileri</h6>
                <div className="row g-2 mb-2">
                  <div className="col-md-12">
                    <Form.Control
                      placeholder="Kart Üzerindeki İsim"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-12">
                    <Form.Control
                      placeholder="Kart Numarası"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                      inputMode="numeric"
                    />
                  </div>
                  <div className="col-md-4">
                    <Form.Control
                      placeholder="AA"
                      value={expMonth}
                      onChange={(e) => setExpMonth(e.target.value)}
                      required
                      inputMode="numeric"
                    />
                  </div>
                  <div className="col-md-4">
                    <Form.Control
                      placeholder="YYYY"
                      value={expYear}
                      onChange={(e) => setExpYear(e.target.value)}
                      required
                      inputMode="numeric"
                    />
                  </div>
                  <div className="col-md-4">
                    <Form.Control
                      placeholder="CVV"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      required
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <Form.Check
                  className="my-3"
                  type="checkbox"
                  id="policy"
                  label="Gizlilik ve kişisel verilerin korunması politikasını okudum ve anladım"
                  checked={policy}
                  onChange={(e) => setPolicy(e.target.checked)}
                  required
                />

                <Button
                  type="submit"
                  variant="warning"
                  disabled={submitting}
                  className="w-100"
                >
                  {submitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      İşlem yapılıyor...
                    </>
                  ) : (
                    `Devam Et — ${formatUSD(order.pricing.total)}`
                  )}
                </Button>
              </Form>
            ) : (
              <div className="p-4 bg-dark rounded border border-success-subtle">
                <h5 className="text-success mb-2">✅ Ödeme Başarılı</h5>
                <p className="text-secondary mb-3">
                  Biletleriniz hazır. Aşağıdaki buton ile ana sayfaya dönebilir
                  veya soldaki karttan etkinliği takviminize ekleyebilirsiniz.
                </p>
                <div className="d-flex gap-2">
                  <Button
                    variant="warning"
                    onClick={() => router.push(`${basePath}/mytickets`)}
                  >
                    Biletlerim'e Git
                  </Button>
                  <Button
                    variant="warning"
                    onClick={() => router.push(basePath)}
                  >
                    Ana Sayfaya Dön
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .ticket-summary {
          background: #111418;
          border: 1px solid #23262d;
        }
        .ticket-field {
          margin-bottom: 12px;
        }
        .ticket-field .label {
          color: #9aa0a6;
          font-size: 12px;
          letter-spacing: 0.08em;
        }
        .ticket-field .value {
          color: #e9ecef;
        }
        .qr-circle {
          width: 156px;
          height: 156px;
          border-radius: 50%;
          border: 6px solid #e5465a;
          display: grid;
          place-items: center;
        }
        .qr-inner {
          width: 104px;
          height: 104px;
          background: repeating-linear-gradient(
            45deg,
            #000,
            #000 6px,
            #222 6px,
            #222 12px
          );
          border-radius: 8px;
          color: #fff;
          display: grid;
          place-items: center;
          font-weight: 800;
        }
        .qr-img {
          width: 104px;
          height: 104px;
          border-radius: 8px;
          object-fit: cover;
          background: #fff;
        }
      `}</style>
    </div>
  );
}
