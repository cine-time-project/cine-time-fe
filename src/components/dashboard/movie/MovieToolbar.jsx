"use client";

import { deleteMovieAction } from "@/action/movie-actions";
import { swAlert, swConfirm } from "@/helpers/sweetalert";
import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { getToken } from "@/lib/utils/http";
import { useTranslations } from "next-intl";

export const MovieToolbar = ({ row, locale, onDeleted, isAdmin }) => {
  const router = useRouter();
  const t = useTranslations("movie");
  const { id, title } = row;

  const handleDelete = async () => {
    const answer = await swConfirm(`Delete movie "${title}"?`);
    if (!answer.isConfirmed) return;

    const token = getToken();

    const res = await deleteMovieAction(id, locale, token);
    swAlert(res.message, res.ok ? "success" : "error").then(() => {
      if (res.ok && typeof onDeleted === "function") {
        onDeleted(id);
      }
    });
  };

  const handleEdit = () => router.push(`/${locale}/admin/movies/${id}`);

  return (
    <div className="d-flex gap-2 justify-content-end">
      {/* Edit Button with Tooltip */}
      <OverlayTrigger
        placement="top"
        overlay={
          !isAdmin ? (
            <Tooltip id="tooltip-edit">
              {isAdmin ? t("editButton") : t("needAdminToEdit")}
            </Tooltip>
          ) : (
            <></>
          )
        }
      >
        <span className="d-inline-block">
          <Button
            variant="secondary"
            onClick={handleEdit}
            disabled={!isAdmin}
            style={!isAdmin ? { pointerEvents: "none" } : {}}
          >
            <i className="pi pi-file-edit"></i>
          </Button>
        </span>
      </OverlayTrigger>

      {/* Delete Button with Tooltip */}
      <OverlayTrigger
        placement="top"
        overlay={
          !isAdmin ? (
            <Tooltip id="tooltip-delete">
              {isAdmin ? t("deleteButton") : t("needAdminToDelete")}
            </Tooltip>
          ) : (
            <></>
          )
        }
      >
        <span className="d-inline-block">
          <Button
            variant="secondary"
            onClick={handleDelete}
            disabled={!isAdmin}
            style={!isAdmin ? { pointerEvents: "none" } : {}}
          >
            <i className="pi pi-trash"></i>
          </Button>
        </span>
      </OverlayTrigger>
    </div>
  );
};
