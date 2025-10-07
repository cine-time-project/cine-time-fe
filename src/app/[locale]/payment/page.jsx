"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { Form, Button, Alert, Spinner, Badge } from "react-bootstrap";
import { loadPendingOrder, clearPendingOrder } from "@/lib/utils/checkout";
import { API_BASE as API, authHeaders } from "@/lib/utils/http";

export default function PaymentPage() {
  const router = useRouter();
  const pathname = usePathname();
  const localeSegment = pathname?.split("/")?.[1] || "tr";
  const basePath = `/${localeSegment}`;

  const [order, setOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
      setSuccess(res.data?.returnBody || { message: "Ödeme başarılı." });
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
        {success && (
          <Alert variant="success">
            <div className="fw-bold mb-2">✅ Ödeme Başarılı</div>
            <pre
              className="bg-dark text-light p-2 rounded"
              style={{ whiteSpace: "pre-wrap" }}
            >
              {JSON.stringify(success, null, 2)}
            </pre>
            <Button variant="warning" onClick={() => router.push(basePath)}>
              Ana Sayfaya Dön
            </Button>
          </Alert>
        )}

        {!success && (
          <div className="row g-3">
            {/* Left summary */}
            <div className="col-lg-4">
              <div
                className="p-3 rounded"
                style={{ background: "#22252b", border: "1px solid #333" }}
              >
                <div className="mb-2">
                  <div className="text-muted small">Sinema</div>
                  <div className="fw-semibold">{order.cinemaName}</div>
                </div>
                <div className="mb-2">
                  <div className="text-muted small">Film</div>
                  <div className="fw-semibold">{order.movieTitle}</div>
                </div>
                <div className="mb-2">
                  <div className="text-muted small">Salon / Seans</div>
                  <div className="fw-semibold">
                    {order.hall} — {order.date} {order.time}
                  </div>
                </div>
                <div className="mb-2">
                  <div className="text-muted small">Koltuklar</div>
                  <div>{seatBadges}</div>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span>Bilet Bedeli</span>
                  <span>
                    {order.seats.length} × {formatUSD(order.pricing.unitPrice)}
                  </span>
                </div>
                <div className="d-flex justify-content-between fw-bold">
                  <span>Toplam</span>
                  <span>{formatUSD(order.pricing.total)}</span>
                </div>
              </div>
            </div>

            {/* Right form */}
            <div className="col-lg-8">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
