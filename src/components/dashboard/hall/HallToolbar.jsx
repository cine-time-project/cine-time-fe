"use client";

import { deleteHallAction } from "@/action/hall-actions";
import { swAlert, swConfirm } from "@/helpers/sweetalert";
import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";
import { getToken } from "@/lib/utils/http";
import { useTranslations } from "next-intl";

/**
 * HallToolbar
 * @param {Object} props
 * @param {Object} props.row - Hall data row
 * @param {string} props.locale - Active locale
 * @param {function} props.onDeleted - Callback after successful deletion
 */
export const HallToolbar = ({ row, locale, onDeleted }) => {
  const router = useRouter();
  const t = useTranslations("hall");
  const { id, name } = row;

  // Silme işlemi
  const handleDelete = async () => {
    const answer = await swConfirm(`${t("deleteConfirm")} "${name}"?`);
    if (!answer.isConfirmed) return;

    const token = getToken();
    const res = await deleteHallAction(id, locale, token);

    swAlert(res.message, res.ok ? "success" : "error").then(() => {
      if (res.ok && typeof onDeleted === "function") onDeleted(id);
    });
  };

  // Düzenleme sayfasına git
  const handleEdit = () => router.push(`/${locale}/admin/halls/${id}`);

  return (
    <div className="d-flex gap-2 justify-content-end">
      <Button variant="secondary" onClick={handleEdit} title={t("editButton")}>
        <i className="pi pi-file-edit"></i>
      </Button>
      <Button
        variant="secondary"
        onClick={handleDelete}
        title={t("deleteButton")}
      >
        <i className="pi pi-trash"></i>
      </Button>
    </div>
  );
};
