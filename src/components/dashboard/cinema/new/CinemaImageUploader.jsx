"use client";

import { uploadImage } from "@/action/cinema-image-actions";
import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Image } from "react-bootstrap";
import Swal from "sweetalert2";

export const CinemaImageUploader = ({ cinema, token, onUpdateCinema }) => {
  const [isUpdate, setIsUpdate] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 🎬 Eğer edit modundaysak mevcut resmi göster
  useEffect(() => {
    if (cinema?.imageUrl) {
      setIsUpdate(true);
    }
    setPreviewUrl(cinema?.imageUrl || null);
  }, [cinema]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);

    if (selected) {
      const localPreview = URL.createObjectURL(selected);
      setPreviewUrl(localPreview); // seçilen resmi anında önizle
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!cinema?.id) {
      Swal.fire("Error", "Cinema ID is missing", "error");
      return;
    }

    if (!file) {
      Swal.fire("Error", "Please select an image file", "error");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Upload image
      await uploadImage(cinema.id, file, token);

      // 2️⃣ Parent'tan cinema'yi yeniden fetch et
      if (onUpdateCinema) {
        const updatedCinema = await onUpdateCinema(); // async fetch yapılacak
        setPreviewUrl(updatedCinema.imageUrl); // preview da güncellendi
      }

      Swal.fire("Success", "Image uploaded successfully!", "success");
      setFile(null);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to upload image", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleUpload} className="p-3 border rounded bg-light h-100">
      <Form.Group className="mb-3">
        <Form.Label>
          {isUpdate ? "Update Cinema Image" : "Upload Cinema Image"}
        </Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </Form.Group>

      {previewUrl && (
        <div className="text-center mb-3">
          <Image
            src={previewUrl}
            alt="Cinema preview"
            style={{
              maxWidth: "100%",
              height: "250px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
          <p className="text-muted mt-2 small">
            {isUpdate
              ? "Current / New image preview"
              : "Selected image preview"}
          </p>
        </div>
      )}

      <div className="d-flex justify-content-end gap-2">
        {previewUrl && (
          <Button
            variant="danger"
            type="button"
            disabled={!file}
            onClick={() => {
              setFile(null);
              // Mevcut resmi koru (edit modundaysa), yoksa tamamen sıfırla
              if (isUpdate && cinema?.imageUrl) {
                setPreviewUrl(cinema.imageUrl);
              } else {
                setPreviewUrl(null);
              }
            }}
          >
            Cancel
          </Button>
        )}

        <Button variant="primary" type="submit" disabled={loading || !file}>
          {loading ? <Spinner size="sm" animation="border" /> : "Save Image"}
        </Button>
      </div>
    </Form>
  );
};
