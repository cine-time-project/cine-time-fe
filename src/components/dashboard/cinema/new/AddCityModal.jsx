"use client";

import React from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import Swal from "sweetalert2";

// ✅ Validation schema
const schema = yup.object({
  name: yup.string().required("City name is required"),
  countryId: yup.number().required("Country is required"),
});

export const AddCityModal = ({ show, onHide, onCityAdded }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [countries, setCountries] = React.useState([]);

  // 📍 Fetch countries (dummy endpoint)
  React.useEffect(() => {
    if (show) {
      axios
        .get("/api/countries")
        .then((res) => setCountries(res.data))
        .catch(() =>
          Swal.fire("Error", "Failed to load countries", "error")
        );
    }
  }, [show]);

  // 📍 Handle city creation
  const onSubmit = async (data) => {
    try {
      const response = await axios.post("/api/cities", data); // dummy endpoint
      Swal.fire("Success", "City created successfully", "success");
      onCityAdded(response.data); // parent form'a yeni city gönder
      reset();
      onHide();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to create city", "error");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New City</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          {/* City Name */}
          <Form.Group className="mb-3" controlId="cityName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter city name"
              {...register("name")}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Country */}
          <Form.Group className="mb-3" controlId="country">
            <Form.Label>Country</Form.Label>
            <Form.Select {...register("countryId")} isInvalid={!!errors.countryId}>
              <option value="">Select a country</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.countryId?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <div className="text-end">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" animation="border" /> : "Add City"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
