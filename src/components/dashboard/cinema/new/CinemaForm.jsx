"use client";

import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { AddCityModal } from "./AddCityModal";
import { getAllCities } from "@/service/cinema-service";

// ✅ Validation schema
const schema = yup.object({
  name: yup.string().required("Cinema name is required"),
  slug: yup.string().nullable(),
  cityId: yup.number().required("City selection is required"),
});

export const CinemaForm = ({ onSubmit }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCityModal, setShowCityModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // 📍 Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const cityArray = await getAllCities(); // dummy endpoint
        setCities(cityArray);
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "Failed to load cities", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  // 📍 Handle new city creation
  const handleCityAdded = (newCity) => {
    setCities((prev) => [...prev, newCity]);
    setShowCityModal(false);
  };

  // 📍 Submit handler
  const onFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        {/* Name */}
        <Form.Group as={Row} className="mb-3" controlId="name">
          <Form.Label column sm={2}>
            Name
          </Form.Label>
          <Col sm={10}>
            <Form.Control
              type="text"
              placeholder="Enter cinema name"
              {...register("name")}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* Slug */}
        <Form.Group as={Row} className="mb-3" controlId="slug">
          <Form.Label column sm={2}>
            Slug
          </Form.Label>
          <Col sm={10}>
            <Form.Control
              type="text"
              placeholder="Enter slug (optional)"
              {...register("slug")}
              isInvalid={!!errors.slug}
            />
            <Form.Control.Feedback type="invalid">
              {errors.slug?.message}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* City */}
        <Form.Group as={Row} className="mb-3" controlId="city">
          <Form.Label column sm={2}>
            City
          </Form.Label>
          <Col sm={10}>
            <Form.Select {...register("cityId")} isInvalid={!!errors.cityId}>
              <option value="">Select a city</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
              <option value="add-new">➕ Add new city</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.cityId?.message}
            </Form.Control.Feedback>
          </Col>
        </Form.Group>

        {/* Handle Add New City */}
        {/* Eğer kullanıcı "add-new" seçerse modal aç */}
        <Button
          variant="link"
          onClick={() => setShowCityModal(true)}
          className="px-0 text-decoration-none"
        >
          + Add new city
        </Button>

        {/* Submit */}
        <div className="text-end">
          <Button variant="primary" type="submit">
            Create Cinema
          </Button>
        </div>
      </Form>

      {/* Modal for new city creation */}
      <AddCityModal
        show={showCityModal}
        onHide={() => setShowCityModal(false)}
        onCityAdded={handleCityAdded}
      />
    </>
  );
};
