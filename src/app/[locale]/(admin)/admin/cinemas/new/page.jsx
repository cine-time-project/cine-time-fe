"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Swal from "sweetalert2";
import axios from "axios";
import { Card } from "react-bootstrap";
import { CinemaForm } from "@/components/dashboard/cinema/new/CinemaForm";
import { CinemaImageUploader } from "@/components/dashboard/cinema/new/CinemaImageUploader";
import { useAuth } from "@/lib/auth/useAuth";

export default function CreateCinemaPage() {
  const router = useRouter();
  const { locale } = useParams();
  const { token } = useAuth();

  const [createdCinemaId, setCreatedCinemaId] = useState(null);

  // 📍 Create Cinema (JSON)
  const handleCreateCinema = async (formData) => {
    try {
      const response = await axios.post("/api/cinemas", formData); // Dummy endpoint
      const cinema = response.data;
      setCreatedCinemaId(cinema.id);

      Swal.fire({
        title: "Cinema created!",
        text: "You can now upload an image.",
        icon: "success",
        confirmButtonText: "OK",
      });

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to create cinema.", "error");
    }
  };

  // 📍 Upload image after cinema created
  const handleImageUpload = async (file) => {
    if (!createdCinemaId) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`/api/cinemas/${createdCinemaId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        title: "Image uploaded!",
        text: "Do you want to add halls now?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Yes, add halls",
        cancelButtonText: "No, go back",
      }).then((result) => {
        if (result.isConfirmed) {
          router.push(`/${locale}/admin/cinemas/${createdCinemaId}/halls/create`);
        } else {
          router.push(`/${locale}/admin/cinemas`);
        }
      });

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to upload image.", "error");
    }
  };

  return (
    <div className="container mt-4">
      <Card className="shadow-lg p-4 rounded-4">
        <h3 className="mb-4">Create New Cinema</h3>

        {/* Step 1: Form */}
        {!createdCinemaId && <CinemaForm onSubmit={handleCreateCinema} token={token} />}

        {/* Step 2: Image Upload */}
        {createdCinemaId && (
          <CinemaImageUploader onUpload={handleImageUpload} />
        )}
      </Card>
    </div>
  );
}
