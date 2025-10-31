"use client";

import { deleteMovieAction } from "@/action/movie-actions";
import { swAlert, swConfirm } from "@/helpers/sweetalert";
import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";
import { getToken } from "@/lib/utils/http"; //token almak için eklendi

export const MovieToolbar = ({ row, locale }) => {
  const router = useRouter();
  const { id, title } = row;

  const handleDelete = async () => {
    const answer = await swConfirm(`Delete movie "${title}"?`);
    if (!answer.isConfirmed) return;

    const token = getToken(); //token client tarafında alınır

    const res = await deleteMovieAction(id, locale, token); //token parametre olarak gönderilir
    swAlert(res.message, res.ok ? "success" : "error");
  };

  const handleEdit = () => router.push(`/${locale}/admin/movies/${id}`);

  return (
    <div className="d-flex gap-2 justify-content-end">
      <Button variant="secondary" onClick={handleEdit}>
        <i className="pi pi-file-edit"></i>
      </Button>
      <Button variant="secondary" onClick={handleDelete}>
        <i className="pi pi-trash"></i>
      </Button>
    </div>
  );
};
