"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, Button, Table, InputGroup, Form, Spinner } from "react-bootstrap";
import {
  fetchSpecialHallTypes,
  createSpecialHallType,
  updateSpecialHallType,
  deleteSpecialHallType,
} from "@/service/special-hall-service";
import { swAlert, swConfirm } from "@/helpers/sweetalert";

export default function TypeManagerModal({ show, onClose, onChanged, onPick }) {
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState([]);

  // inline edit state
  const [editRow, setEditRow] = useState(null); // {id, name, priceDiffPercent}
  const [newRow, setNewRow] = useState({ name: "", priceDiffPercent: "" });
  const dirty = useMemo(() => !!editRow, [editRow]);

  const load = async () => {
    setLoading(true);
    const data = await fetchSpecialHallTypes({ size: 500 });
    setTypes(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    if (show) load();
  }, [show]);

  const startEdit = (t) => setEditRow({ id: t.id, name: t.name, priceDiffPercent: t.priceDiffPercent ?? 0 });
  const cancelEdit = () => setEditRow(null);

  const saveEdit = async () => {
    try {
      const name = editRow.name?.trim();
      const p = Number(editRow.priceDiffPercent);
      if (!name) return swAlert("warning", "İsim zorunludur.");
      if (Number.isNaN(p) || p < 0 || p > 100) return swAlert("warning", "Yüzde 0–100 olmalı.");
      await updateSpecialHallType(editRow.id, { name, priceDiffPercent: p });
      swAlert("success", "Güncellendi.");
      setEditRow(null);
      await load();
      onChanged?.();
    } catch (e) {
      swAlert("error", e.message);
    }
  };

  const addNew = async () => {
    try {
      const name = newRow.name?.trim();
      const p = Number(newRow.priceDiffPercent);
      if (!name) return swAlert("warning", "İsim zorunludur.");
      if (Number.isNaN(p) || p < 0 || p > 100) return swAlert("warning", "Yüzde 0–100 olmalı.");
      const created = await createSpecialHallType({ name, priceDiffPercent: p });
      swAlert("success", "Oluşturuldu.");
      setNewRow({ name: "", priceDiffPercent: "" });
      await load();
      onChanged?.();
      // istersen seç
      if (created?.id) onPick?.(created);
    } catch (e) {
      swAlert("error", e.message);
    }
  };

  const removeRow = async (id) => {
    const ok = await swConfirm("Silinsin mi?", "warning", "Bu özel salon tipi silinecek.", "Sil");
    if (!ok?.isConfirmed) return;
    try {
      await deleteSpecialHallType(id);
      swAlert("success", "Silindi.");
      await load();
      onChanged?.();
    } catch (e) {
      swAlert("error", e.message);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Özel Salon Tipleri</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* yeni ekleme satırı */}
        <div className="mb-3">
          <InputGroup>
            <Form.Control
              placeholder="İsim (örn: Dolby)"
              value={newRow.name}
              onChange={(e) => setNewRow((s) => ({ ...s, name: e.target.value }))}
            />
            <Form.Control
              placeholder="Fiyat farkı % (örn: 12)"
              type="number"
              min={0}
              max={100}
              value={newRow.priceDiffPercent}
              onChange={(e) => setNewRow((s) => ({ ...s, priceDiffPercent: e.target.value }))}
              style={{ maxWidth: 160 }}
            />
            <Button onClick={addNew}>Ekle</Button>
          </InputGroup>
        </div>

        {/* liste */}
        {loading ? (
          <div className="d-flex justify-content-center py-4"><Spinner /></div>
        ) : (
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>İsim</th>
                <th>Fiyat farkı (%)</th>
                <th className="text-end">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t, i) => {
                const isEditing = editRow?.id === t.id;
                return (
                  <tr key={t.id}>
                    <td>{i + 1}</td>
                    <td>
                      {isEditing ? (
                        <Form.Control
                          value={editRow.name}
                          onChange={(e) => setEditRow((s) => ({ ...s, name: e.target.value }))}
                        />
                      ) : (
                        t.name
                      )}
                    </td>
                    <td style={{ maxWidth: 160 }}>
                      {isEditing ? (
                        <Form.Control
                          type="number"
                          min={0}
                          max={100}
                          value={editRow.priceDiffPercent}
                          onChange={(e) =>
                            setEditRow((s) => ({ ...s, priceDiffPercent: e.target.value }))
                          }
                        />
                      ) : (
                        t.priceDiffPercent ?? 0
                      )}
                    </td>
                    <td className="text-end">
                      {isEditing ? (
                        <>
                          <Button size="sm" variant="success" className="me-2" onClick={saveEdit}>
                            Kaydet
                          </Button>
                          <Button size="sm" variant="secondary" onClick={cancelEdit}>
                            Vazgeç
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" className="me-2" onClick={() => startEdit(t)}>
                            Düzenle
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => removeRow(t.id)}>
                            Sil
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {types.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    Kayıt yok.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={dirty}>
          Kapat
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
