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
import { useTranslations } from "next-intl";

export default function TypeManagerModal({ show, onClose, onChanged, onPick }) {
  const tSH = useTranslations("specialHall");
  const tCommon = useTranslations("common");

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

  const startEdit = (t) =>
    setEditRow({
      id: t.id,
      name: t.name,
      priceDiffPercent: t.priceDiffPercent ?? 0,
    });
  const cancelEdit = () => setEditRow(null);

  const saveEdit = async () => {
    try {
      const name = editRow.name?.trim();
      const p = Number(editRow.priceDiffPercent);
      if (!name) return swAlert("warning", tSH("validation.required"));
      if (Number.isNaN(p) || p < 0 || p > 100)
        return swAlert("warning", tSH("validation.percentRange"));
      await updateSpecialHallType(editRow.id, { name, priceDiffPercent: p });
      swAlert("success", tSH("messages.updated"));
      setEditRow(null);
      await load();
      onChanged?.();
    } catch (e) {
      swAlert("error", e?.message || tCommon("error"));
    }
  };

  const addNew = async () => {
    try {
      const name = newRow.name?.trim();
      const p = Number(newRow.priceDiffPercent);
      if (!name) return swAlert("warning", tSH("validation.required"));
      if (Number.isNaN(p) || p < 0 || p > 100)
        return swAlert("warning", tSH("validation.percentRange"));
      const created = await createSpecialHallType({ name, priceDiffPercent: p });
      swAlert("success", tSH("messages.created"));
      setNewRow({ name: "", priceDiffPercent: "" });
      await load();
      onChanged?.();
      if (created?.id) onPick?.(created); // optional auto-pick newly created
    } catch (e) {
      swAlert("error", e?.message || tCommon("error"));
    }
  };

  const removeRow = async (id) => {
    const ok = await swConfirm(
      tSH("confirmDeleteTitle"),
      "warning",
      tSH("confirmDeleteText"),
      tCommon("delete")
    );
    if (!ok?.isConfirmed) return;
    try {
      await deleteSpecialHallType(id);
      swAlert("success", tSH("messages.deleted"));
      await load();
      onChanged?.();
    } catch (e) {
      swAlert("error", e?.message || tCommon("error"));
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>{tSH("typesTitle")}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* new row */}
        <div className="mb-3">
          <InputGroup>
            <Form.Control
              placeholder={tSH("namePlaceholder")}
              value={newRow.name}
              onChange={(e) =>
                setNewRow((s) => ({ ...s, name: e.target.value }))
              }
            />
            <Form.Control
              placeholder={tSH("percentPlaceholder")}
              type="number"
              min={0}
              max={100}
              value={newRow.priceDiffPercent}
              onChange={(e) =>
                setNewRow((s) => ({
                  ...s,
                  priceDiffPercent: e.target.value,
                }))
              }
              style={{ maxWidth: 160 }}
            />
            <Button onClick={addNew}>{tSH("add")}</Button>
          </InputGroup>
        </div>

        {/* list */}
        {loading ? (
          <div className="d-flex justify-content-center py-4">
            <Spinner />
          </div>
        ) : (
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>{tSH("name")}</th>
                <th>{tSH("percent")}</th>
                <th className="text-end">{tSH("columns.actions")}</th>
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
                          onChange={(e) =>
                            setEditRow((s) => ({ ...s, name: e.target.value }))
                          }
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
                            setEditRow((s) => ({
                              ...s,
                              priceDiffPercent: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        t.priceDiffPercent ?? 0
                      )}
                    </td>
                    <td className="text-end">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            className="me-2"
                            onClick={saveEdit}
                          >
                            {tCommon("save")}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={cancelEdit}
                          >
                            {tCommon("cancel")}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            className="me-2"
                            onClick={() => startEdit(t)}
                          >
                            {tCommon("edit")}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => removeRow(t.id)}
                          >
                            {tCommon("delete")}
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
                    {tCommon("empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={dirty}>
          {tCommon("close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
