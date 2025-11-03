"use client";

import { deleteImageAction } from "@/action/image-actions";
import { swAlert, swConfirm } from "@/helpers/sweetalert";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button, ButtonGroup } from "react-bootstrap";
import { getToken } from "@/lib/utils/http";

export const ImageToolbar = ({ row, locale, isAdmin = false, onDeleted }) => {
  const router = useRouter();
  const t = useTranslations("images");
  const tCommon = useTranslations("common");
  const { id, name, isPoster } = row;

  const handleDelete = async () => {
    const warningText = isPoster ? t("deleteWarningPoster") : "";
    const answer = await swConfirm(
      `${t("deleteConfirm")} "${name || `ID: ${id}`}"?`,
      warningText
    );
    if (!answer.isConfirmed) return;

    const token = getToken();

    const res = await deleteImageAction(id, row.movie?.id, locale, token);
    swAlert(res.message, res.ok ? "success" : "error").then(() => {
      if (res.ok && typeof onDeleted === "function") {
        onDeleted(id);
      }
    });
  };

  const handleEdit = () => {
    // Store image data in sessionStorage to avoid URL length limits
    const imageKey = `image_edit_${id}`;
    sessionStorage.setItem(imageKey, JSON.stringify(row));

    // Navigate with minimal URL
    router.push(`/${locale}/admin/images/${id}?key=${imageKey}`);
  };

  // If user is not admin, don't show any action buttons
  if (!isAdmin) {
    return null;
  }

  return (
    <ButtonGroup size="sm">
      <Button
        variant="outline-secondary"
        onClick={handleEdit}
        title={t("editImage")}
      >
        <i className="pi pi-file-edit"></i>
      </Button>
      <Button
        variant="outline-danger"
        onClick={handleDelete}
        title={t("deleteImage")}
      >
        <i className="pi pi-trash"></i>
      </Button>
    </ButtonGroup>
  );
};
