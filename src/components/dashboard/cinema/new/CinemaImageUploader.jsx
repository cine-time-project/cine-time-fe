"use client";

import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Image } from "react-bootstrap";
import Swal from "sweetalert2";

export const CinemaImageUploader = ({
  cinema,
  onUpload,
  isEditMode = false,
}) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 🎬 Eğer edit modundaysak mevcut resmi göster
  useEffect(() => {
    if (isEditMode && cinema?.imageUrl) {
      setPreviewUrl(cinema.imageUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [cinema, isEditMode]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);

    if (selected) {
      const localPreview = URL.createObjectURL(selected);
      setPreviewUrl(localPreview); // seçilen resmi anında önizle
    }
  };

  const handleSubmit = async (e) => {
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
      // cinema.id ve file parametreleriyle upload işlemini tetikle
      await onUpload(cinema.id, file);

      Swal.fire(
        "Success",
        isEditMode
          ? "Image updated successfully!"
          : "Image uploaded successfully!",
        "success"
      );
      setFile(null);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to upload image", "error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Form onSubmit={handleSubmit} className="p-3 border rounded bg-light">
      <Form.Group className="mb-3">
        <Form.Label>
          {isEditMode ? "Update Cinema Image" : "Upload Cinema Image"}
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
            {isEditMode
              ? "Current / New image preview"
              : "Selected image preview"}
          </p>
        </div>
      )}

      <div className="d-flex justify-content-end gap-2">
        {previewUrl && (
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              setFile(null);
              // Mevcut resmi koru (edit modundaysa), yoksa tamamen sıfırla
              if (isEditMode && cinema?.imageUrl) {
                setPreviewUrl(cinema.imageUrl);
              } else {
                setPreviewUrl(null);
              }
            }}
          >
            Cancel
          </Button>
        )}

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <Spinner size="sm" animation="border" />
          ) : isEditMode ? (
            "Update Image"
          ) : (
            "Upload Image"
          )}
        </Button>
      </div>
    </Form>
  );
};
