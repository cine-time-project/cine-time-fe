"use client";

import React, { useState } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

export const CinemaImageUploader = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      Swal.fire("Error", "Please select an image file", "error");
      return;
    }

    setLoading(true);
    try {
      await onUpload(file);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to upload image", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Upload Cinema Image</Form.Label>
        <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
      </Form.Group>

      <div className="text-end">
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : "Upload Image"}
        </Button>
      </div>
    </Form>
  );
};
