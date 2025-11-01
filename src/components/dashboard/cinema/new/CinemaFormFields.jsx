"use client";

import React from "react";
import { Form } from "react-bootstrap";

// -------------------- Cinema name & slug --------------------
export const CinemaFormFields = ({ register, errors }) => (
  <>
    <Form.Group className="mb-3">
      <Form.Label>Name</Form.Label>
      <Form.Control type="text" {...register("name")} isInvalid={!!errors.name} />
      <Form.Control.Feedback type="invalid">{errors.name?.message}</Form.Control.Feedback>
    </Form.Group>

    <Form.Group className="mb-3">
      <Form.Label>Slug (optional)</Form.Label>
      <Form.Control type="text" {...register("slug")} isInvalid={!!errors.slug} />
    </Form.Group>
  </>
);
