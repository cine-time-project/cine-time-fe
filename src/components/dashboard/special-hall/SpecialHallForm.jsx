"use client";

import { useEffect, useState } from "react";
import { Form, Button, Spinner, Row, Col } from "react-bootstrap";
import { fetchHalls, fetchSpecialHallTypes } from "@/service/special-hall-service";

export default function SpecialHallForm({
  initialValues = { hallId: "", typeId: "" },
  onSubmit,
  submitLabel = "Kaydet",
  busy = false,
}) {
  const [halls, setHalls] = useState([]);
  const [types, setTypes] = useState([]);
  const [values, setValues] = useState(() => ({
    hallId: initialValues?.hallId ?? "",
    typeId: initialValues?.typeId ?? "",
  }));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [hallsResp, typesResp] = await Promise.all([
          fetchHalls({ size: 500 }),
          fetchSpecialHallTypes({ size: 500 }),
        ]);
        if (!mounted) return;
        setHalls(hallsResp);
        setTypes(typesResp);
      } finally {
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // 🔧 Yalnızca alanlar değiştiğinde ve farklı ise state'i güncelle
  useEffect(() => {
    const next = {
      hallId: initialValues?.hallId ?? "",
      typeId: initialValues?.typeId ?? "",
    };
    setValues((prev) =>
      prev.hallId === next.hallId && prev.typeId === next.typeId ? prev : next
    );
    // Sadece alan bazında izle
  }, [initialValues?.hallId, initialValues?.typeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.set("hallId", values.hallId);
    fd.set("typeId", values.typeId);
    onSubmit?.(fd);
  };

  return (
    <Form onSubmit={handleSubmit} className="p-3">
      <Row className="g-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Salon (Hall)</Form.Label>
            <Form.Select
              name="hallId"
              value={values.hallId}
              onChange={handleChange}
              disabled={loading || busy}
              required
            >
              <option value="">Seçiniz…</option>
             {halls.map((h) => (
  <option key={h.id} value={h.id}>
    {(h.cinemaName ? `${h.cinemaName} – ` : "")}
    {h.name || `Hall #${h.id}`}
    {h.seatCapacity ? ` (${h.seatCapacity})` : ""}
  </option>
))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Özel Salon Tipi</Form.Label>
            <Form.Select
              name="typeId"
              value={values.typeId}
              onChange={handleChange}
              disabled={loading || busy}
              required
            >
              <option value="">Seçiniz…</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.priceDiffPercent != null ? `(+%${t.priceDiffPercent})` : ""}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <div className="mt-4 d-flex gap-2">
        <Button type="submit" disabled={busy || loading}>
          {busy ? <Spinner size="sm" /> : submitLabel}
        </Button>
      </div>
    </Form>
  );
}
