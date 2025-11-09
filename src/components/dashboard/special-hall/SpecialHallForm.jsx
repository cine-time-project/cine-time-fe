"use client";

import { useEffect, useState } from "react";
import { Form, Button, Spinner, Row, Col, InputGroup } from "react-bootstrap";
import {
  fetchHalls,
  fetchSpecialHallTypes,
  createSpecialHallType,
} from "@/service/special-hall-service";
import { swAlert } from "@/helpers/sweetalert";

export default function SpecialHallForm({
  initialValues = { hallId: "", typeId: "" },
  onSubmit,
  submitLabel = "Oluştur",
  busy = false,
}) {
  const [halls, setHalls] = useState([]);
  const [types, setTypes] = useState([]);
  const [values, setValues] = useState(() => ({
    hallId: initialValues?.hallId ?? "",
    typeId: initialValues?.typeId ?? "",
  }));
  const [loading, setLoading] = useState(true);

  // Yeni tip modal state
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypePercent, setNewTypePercent] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [hallsResp, typesResp] = await Promise.all([
          fetchHalls({ size: 500 }),
          fetchSpecialHallTypes({ size: 500 }),
        ]);
        if (!alive) return;
        setHalls(hallsResp);
        setTypes(typesResp);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // initialValues değişince kontrollü güncelle
  useEffect(() => {
    const next = {
      hallId: initialValues?.hallId ?? "",
      typeId: initialValues?.typeId ?? "",
    };
    setValues((prev) =>
      prev.hallId === next.hallId && prev.typeId === next.typeId ? prev : next
    );
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

  /* ---------- Yeni Tip Oluşturma ---------- */
  const openNewType = () => {
    setNewTypeName("");
    setNewTypePercent("");
    setShowTypeModal(true);
  };

  const saveNewType = async () => {
    const name = newTypeName?.trim();
    const percent = Number(newTypePercent);

    if (!name) return swAlert("warning", "İsim zorunludur.");
    if (Number.isNaN(percent) || percent < 0 || percent > 100) {
      return swAlert("warning", "Fiyat farkı (%) 0–100 aralığında olmalıdır.");
    }

    try {
      const created = await createSpecialHallType({ name, priceDiffPercent: percent });

      // Listeyi tazele ve yeni kaydı seç
      const fresh = await fetchSpecialHallTypes({ size: 500 });
      setTypes(fresh);
      if (created?.id) setValues((s) => ({ ...s, typeId: String(created.id) }));

      setShowTypeModal(false);
      swAlert("success", "Özel salon tipi oluşturuldu.");
    } catch (err) {
      swAlert("error", err?.message || "Özel salon tipi oluşturulamadı.");
    }
  };

  return (
    <>
      {/* Ana Form */}
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
                <option value="">Seçiniz...</option>
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
              <InputGroup>
                <Form.Select
                  name="typeId"
                  value={values.typeId}
                  onChange={handleChange}
                  disabled={loading || busy}
                  required
                >
                  <option value="">Seçiniz...</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {t.priceDiffPercent != null ? ` (+%${t.priceDiffPercent})` : ""}
                    </option>
                  ))}
                </Form.Select>
                <Button
                  variant="outline-secondary"
                  type="button"        // form submit olmasın
                  onClick={openNewType}
                  disabled={busy}
                >
                  + Yeni Tip
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>

        <div className="mt-4 d-flex gap-2">
          <Button type="submit" disabled={busy || loading}>
            {busy ? <Spinner size="sm" /> : submitLabel}
          </Button>
        </div>
      </Form>

      {/* Basit modal (form içinde form yok) */}
      {showTypeModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block", zIndex: 1050 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Yeni Özel Salon Tipi</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setShowTypeModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">İsim</label>
                    <input
                      className="form-control"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      placeholder="Örn: Dolby, ScreenX..."
                    />
                  </div>
                  <div>
                    <label className="form-label">Fiyat farkı (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      className="form-control"
                      value={newTypePercent}
                      onChange={(e) => setNewTypePercent(e.target.value)}
                      placeholder="Örn: 12"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <Button variant="secondary" type="button" onClick={() => setShowTypeModal(false)}>
                    Vazgeç
                  </Button>
                  <Button type="button" onClick={saveNewType}>
                    Kaydet
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
            onClick={() => setShowTypeModal(false)}
          />
        </>
      )}
    </>
  );
}
