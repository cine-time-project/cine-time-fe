"use client";

import { useEffect, useState } from "react";
import { Modal, Button, Table, Form, Spinner } from "react-bootstrap";
import {
  fetchSpecialHallTypes,
  updateSpecialHallType,
  deleteSpecialHallType,
} from "@/service/special-hall-service";
import { swAlert } from "@/helpers/sweetalert";

export default function SpecialHallTypeManager({ show, onClose }) {
  const [rows, setRows] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const list = await fetchSpecialHallTypes({ size: 500 });
      // edit edilebilir kopya
      setRows(list.map(t => ({ ...t })));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (show) load(); }, [show]);

  const handleChange = (idx, field, value) => {
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const handleSave = async (row) => {
    setBusyId(row.id);
    try {
      const percent = Number(row.priceDiffPercent);
      if (!row.name?.trim()) return swAlert("warning", "İsim zorunludur.");
      if (Number.isNaN(percent) || percent < 0 || percent > 100) {
        return swAlert("warning", "Fiyat farkı (%) 0–100 olmalı.");
      }
      await updateSpecialHallType(row.id, { name: row.name.trim(), priceDiffPercent: percent });
      swAlert("success", "Kayıt güncellendi.");
    } catch (e) {
      swAlert("error", e?.message || "Güncelleme başarısız.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (row) => {
    if (!(await swAlert("question", "Silinsin mi?", "Bu işlem geri alınamaz."))) return;
    setBusyId(row.id);
    try {
      await deleteSpecialHallType(row.id);
      swAlert("success", "Kayıt silindi.");
      await load();
    } catch (e) {
      swAlert("error", e?.message || "Silme başarısız.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Özel Salon Tipleri — Yönet</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="d-flex justify-content-center py-4"><Spinner /></div>
        ) : (
          <Table hover responsive className="align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>İsim</th>
                <th>Fiyat farkı (%)</th>
                <th style={{width: 160}}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={4} className="text-center text-muted">Kayıt yok.</td></tr>
              )}
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td style={{minWidth: 220}}>
                    <Form.Control
                      value={r.name ?? ""}
                      onChange={(e) => handleChange(i, "name", e.target.value)}
                    />
                  </td>
                  <td style={{maxWidth: 140}}>
                    <Form.Control
                      type="number"
                      min={0} max={100} step={1}
                      value={r.priceDiffPercent ?? 0}
                      onChange={(e) => handleChange(i, "priceDiffPercent", e.target.value)}
                    />
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        size="sm"
                        disabled={busyId === r.id}
                        onClick={() => handleSave(r)}
                      >
                        {busyId === r.id ? <Spinner size="sm" /> : "Kaydet"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        disabled={busyId === r.id}
                        onClick={() => handleDelete(r)}
                      >
                        Sil
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
        <Button variant="secondary" onClick={onClose}>Kapat</Button>
      </Modal.Footer>
    </Modal>
  );
}
