"use client";

import { useEffect, useState } from "react";
import { Form, Button, Spinner, Row, Col, InputGroup } from "react-bootstrap";
import {
  fetchHalls,
  fetchSpecialHallTypes,
  createSpecialHallType,
} from "@/service/special-hall-service";
import { swAlert } from "@/helpers/sweetalert";
import SpecialHallTypeManager from "./SpecialHallTypeManager";
import { useTranslations } from "next-intl";
import { BackButton } from "@/components/common/form-fields/BackButton";
import Spacer from "@/components/common/Spacer";

export default function SpecialHallForm({
  initialValues = { hallId: "", typeId: "" },
  onSubmit,
  submitLabel, 
  busy = false,
}) {
  
  const t = useTranslations();
  const tSH = useTranslations("specialHall");

  const [showManage, setShowManage] = useState(false);

  const [halls, setHalls] = useState([]);
  const [types, setTypes] = useState([]);
  const [values, setValues] = useState(() => ({
    hallId: String(initialValues?.hallId ?? ""),
    typeId: String(initialValues?.typeId ?? ""),
  }));
  const [loading, setLoading] = useState(true);

  // Yeni tip modal state
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypePercent, setNewTypePercent] = useState("");

  // --- Tip listesini tek yerden tazele ---
  const refreshTypes = async (keepSelected = true) => {
    const list = await fetchSpecialHallTypes({ size: 500 });
    setTypes(list);
    if (keepSelected) setValues((v) => ({ ...v })); // seçimi koru, re-render et
  };

  /* ----------------------------- listeleri yükle ----------------------------- */
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

  /* -------- initialValues değişince (ve listeler geldikten sonra) set et ------- */
  useEffect(() => {
    if (loading) return; // listeler hazır değilken set etme
    const next = {
      hallId: String(initialValues?.hallId ?? ""),
      typeId: String(initialValues?.typeId ?? ""),
    };
    setValues((prev) =>
      prev.hallId === next.hallId && prev.typeId === next.typeId ? prev : next
    );
  }, [loading, initialValues?.hallId, initialValues?.typeId]);

  /* --------------------------------- handlers -------------------------------- */
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

  /* -------------------------- Yeni Tip Oluşturma UI/FX ------------------------ */
  const openNewType = () => {
    setNewTypeName("");
    setNewTypePercent("");
    setShowTypeModal(true);
  };

  const saveNewType = async () => {
    const name = newTypeName?.trim();
    const percent = Number(newTypePercent);

    if (!name) return swAlert("warning", tSH("validation.required"));
    if (Number.isNaN(percent) || percent < 0 || percent > 100) {
      return swAlert("warning", tSH("validation.percentRange"));
    }

    try {
      const created = await createSpecialHallType({
        name,
        priceDiffPercent: percent,
      });

      await refreshTypes(); // listeyi tazele
      if (created?.id) {
        setValues((s) => ({ ...s, typeId: String(created.id) })); // yeni kaydı seç
      }

      setShowTypeModal(false);
      swAlert("success", tSH("alerts.typeCreated"));
    } catch (err) {
      swAlert("error", err?.message || tSH("alerts.typeCreateFailed"));
    }
  };

  /* ----------------------------------- UI ----------------------------------- */
  return (
    <>
      {/* Ana Form */}
      <Form onSubmit={handleSubmit} className="p-3">
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>{tSH("form.hallLabel")}</Form.Label>
              <Form.Select
                name="hallId"
                value={values.hallId}
                onChange={handleChange}
                disabled={loading || busy}
                required
              >
                <option value="">{tSH("form.selectPlaceholder")}</option>
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
              <Form.Label>{tSH("form.typeLabel")}</Form.Label>
              <InputGroup>
                <Form.Select
                  name="typeId"
                  value={values.typeId}
                  onChange={handleChange}
                  disabled={loading || busy}
                  required
                >
                  <option value="">{tSH("form.selectPlaceholder")}</option>
                  {types.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                      {opt.priceDiffPercent != null
                        ? ` ${tSH("form.optionPercentSuffix", {
                            percent: opt.priceDiffPercent,
                          })}`
                        : ""}
                    </option>
                  ))}
                </Form.Select>

                <Button
                  className="ms-2"
                  variant="outline-secondary"
                  type="button"
                  onClick={openNewType}
                  disabled={busy}
                >
                  {tSH("form.newType")}
                </Button>

                <Button
                  className="ms-2"
                  variant="outline-primary"
                  type="button"
                  onClick={() => setShowManage(true)}
                  disabled={busy}
                >
                  {tSH("form.manage")}
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>

        <Spacer></Spacer>
       <div className="d-flex gap-2 justify-content-end pt-2">
        
          <BackButton></BackButton>
          <Button type="submit" disabled={busy || loading}>
            {busy ? (
              <Spinner size="sm" />
            ) : (
              submitLabel || tSH("form.submitCreate")
            )}
          </Button>
        </div>
      </Form>

      {/* “Yeni Tip” modalı (form içinde form yok) */}
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
                  <h5 className="modal-title">{tSH("typeModal.title")}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label={t("common.close")}
                    onClick={() => setShowTypeModal(false)}
                  />
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">{tSH("typeModal.nameLabel")}</label>
                    <input
                      className="form-control"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      placeholder={tSH("typeModal.namePlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="form-label">
                      {tSH("typeModal.percentLabel")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      className="form-control"
                      value={newTypePercent}
                      onChange={(e) => setNewTypePercent(e.target.value)}
                      placeholder={tSH("typeModal.percentPlaceholder")}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setShowTypeModal(false)}
                  >
                    {tSH("typeModal.cancel")}
                  </Button>
                  <Button type="button" onClick={saveNewType}>
                    {tSH("typeModal.save")}
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

      {/* Yönet (listele / düzenle / sil) */}
      <SpecialHallTypeManager
        show={showManage}
        onClose={async () => {
          setShowManage(false);
          await refreshTypes(); // modal kapanınca listeyi tazele
        }}
        onChanged={(op, payload) => {
          //  anında güncelle
          if (op === "update" && payload?.id) {
            setTypes((prev) =>
              prev.map((t) => (t.id === payload.id ? { ...t, ...payload } : t))
            );
          } else if (op === "delete" && payload?.id) {
            setTypes((prev) => prev.filter((t) => t.id !== payload.id));
            setValues((v) =>
              v.typeId === String(payload.id) ? { ...v, typeId: "" } : v
            );
          } else if (op === "create" && payload) {
            setTypes((prev) => [...prev, payload]);
          }
        }}
      />
    </>
  );
}
