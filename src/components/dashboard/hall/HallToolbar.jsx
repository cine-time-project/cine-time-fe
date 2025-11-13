"use client";

import { swAlert, swConfirm } from "@/helpers/sweetalert";
import { useRouter } from "next/navigation";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { getToken } from "@/lib/utils/http";
import { useTranslations } from "next-intl";
import { config } from "@/helpers/config";

/**
 * HallToolbar
 * @param {Object} props
 * @param {Object} props.row - Hall data row
 * @param {string} props.locale - Active locale
 * @param {function} props.onDeleted - Callback after successful deletion
 */
export const HallToolbar = ({ row, locale, onDeleted, isAdmin }) => {
  const router = useRouter();
  const t = useTranslations("hall");
  const { id, name } = row;

  const handleDelete = async () => {
    const answer = await swConfirm(`${t("deleteConfirm")} "${name}"?`);
    if (!answer.isConfirmed) return;

    const token = getToken();

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || config.apiURL}/hall/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      let messageKey = "";
      if (data.message === "Hall is deleted successfully")
        messageKey = "successDelete";
      else if (data.message === "Failed to delete hall")
        messageKey = "errorDelete";
      else messageKey = "errorDelete";

      swAlert(t(messageKey), res.ok ? "success" : "error").then(() => {
        if (res.ok && typeof onDeleted === "function") onDeleted(id);
      });
    } catch (err) {
      console.error("Delete failed:", err);
      swAlert("Failed to delete hall", "error");
    }
  };

  const handleEdit = () => {
    router.push(`/${locale}/admin/halls/${id}`);
  };

  return (
    <div className="d-flex gap-2 justify-content-end">
      {/* Edit Button */}
      {!isAdmin ? (
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="tooltip-edit">{t("needAdminToEdit")}</Tooltip>}
        >
          <span className="d-inline-block">
            <Button
              disabled={true}
              variant="secondary"
              onClick={handleEdit}
              style={{ pointerEvents: "none" }}
            >
              <i className="pi pi-file-edit"></i>
            </Button>
          </span>
        </OverlayTrigger>
      ) : (
        <Button variant="secondary" onClick={handleEdit}>
          <i className="pi pi-file-edit"></i>
        </Button>
      )}

      {/* Delete Button */}
      {!isAdmin ? (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="tooltip-delete">{t("needAdminToDelete")}</Tooltip>
          }
        >
          <span className="d-inline-block">
            <Button
              disabled={true}
              variant="secondary"
              onClick={handleDelete}
              style={{ pointerEvents: "none" }}
            >
              <i className="pi pi-trash"></i>
            </Button>
          </span>
        </OverlayTrigger>
      ) : (
        <Button variant="secondary" onClick={handleDelete}>
          <i className="pi pi-trash"></i>
        </Button>
      )}
    </div>
  );
};
