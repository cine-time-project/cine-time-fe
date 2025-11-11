"use client";

import { useEffect, useState } from "react";
import { Modal, Button, Table, Form, Spinner } from "react-bootstrap";
import {
  fetchSpecialHallTypes,
  updateSpecialHallType,
  deleteSpecialHallType,
} from "@/service/special-hall-service";
import { swAlert } from "@/helpers/sweetalert";
import { useTranslations } from "next-intl";

export default function SpecialHallTypeManager({ show, onClose }) {
  const tSH = useTranslations("specialHall");
  const tCommon = useTranslations("common");
  const tSwal = useTranslations("swal");

  const [rows, setRows] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const list = await fetchSpecialHallTypes({ size: 500 });
      // edit edilebilir kopya
      setRows(list.map((t) => ({ ...t })));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (show) load();
  }, [show]);

  const handleChange = (idx, field, value) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  const handleSave = async (row) => {
    setBusyId(row.id);
    try {
      const percent = Number(row.priceDiffPercent);
      if (!row.name?.trim()) return swAlert("warning", tSH("validation.required"));
      if (Number.isNaN(percent) || percent < 0 || percent > 100) {
        return swAlert("warning", tSH("validation.percentRange"));
      }
      await updateSpecialHallType(row.id, {
        name: row.name.trim(),
        priceDiffPercent: percent,
      });
      swAlert("success", tSH("messages.updated"));
    } catch (e) {
      swAlert("error", e?.message || tCommon("error"));
    } finally {
      setBusyId(null);
    }
  };

const handleDelete = async (row) => {
  const name = row?.name || "—";

  // {name} parametresini gönder!
  const ok = await swAlert(
    "question",
    tSwal("areYouSure"),
    tSwal("willBeDeleted", { name })
  );
  if (!ok) return;

  setBusyId(row.id);
  try {
    await deleteSpecialHallType(row.id);
    swAlert("success", tSH("alerts.typeDeleted"));
    await load();
  } catch (e) {
    const msg = String(e?.message || "");
    if (/fk_special_hall_type|foreign key/i.test(msg)) {
      swAlert("warning", tSH("alerts.typeInUse", { name }));
    } else {
      swAlert("error", tSH("alerts.typeDeleteFailed"));
    }
  } finally {
    setBusyId(null);
  }
};



  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{tSH("typesTitle")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="d-flex justify-content-center py-4">
            <Spinner />
          </div>
        ) : (
          <Table hover responsive className="align-middle">
            <thead>
              <tr>
                <th>{tSH("columns.id")}</th>
                <th>{tSH("name")}</th>
                <th>{tSH("percent")}</th>
                <th style={{ width: 160 }}>{tSH("columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted">
                    {tCommon("empty")}
                  </td>
                </tr>
              )}
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td style={{ minWidth: 220 }}>
                    <Form.Control
                      value={r.name ?? ""}
                      onChange={(e) => handleChange(i, "name", e.target.value)}
                      placeholder={tSH("namePlaceholder")}
                    />
                  </td>
                  <td style={{ maxWidth: 140 }}>
                    <Form.Control
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={r.priceDiffPercent ?? 0}
                      onChange={(e) =>
                        handleChange(i, "priceDiffPercent", e.target.value)
                      }
                      placeholder={tSH("percentPlaceholder")}
                    />
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        disabled={busyId === r.id}
                        onClick={() => handleSave(r)}
                      >
                        {busyId === r.id ? (
                          <Spinner size="sm" />
                        ) : (
                          tCommon("save")
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        disabled={busyId === r.id}
                        onClick={() => handleDelete(r)}
                      >
                        {tCommon("delete")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          {tCommon("close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
