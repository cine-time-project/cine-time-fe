import * as Yup from "yup";

/**
 * MovieSchema
 * ------------
 * Yup validation schema for Movie create & update forms.
 * Based on the Movie entity and form fields.
 */

export const MovieSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),

  slug: Yup.string()
    .required("Slug is required")
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be at most 50 characters"),

  summary: Yup.string()
    .required("Summary is required")
    .min(3, "Summary must be at least 3 characters")
    .max(300, "Summary must be at most 300 characters"),

  releaseDate: Yup.date()
    .required("Release date is required")
    .typeError("Invalid date format"),

  duration: Yup.number()
    .required("Duration is required")
    .min(1, "Duration must be greater than 0")
    .integer("Duration must be a number"),

  director: Yup.string().nullable().max(50, "Director name too long"),

  genre: Yup.string()
    .required("Genre list is required")
    .test("is-json", "Genre must be a valid JSON array", (value) => {
      try {
        const parsed = JSON.parse(value);
        return (
          Array.isArray(parsed) && parsed.every((v) => typeof v === "string")
        );
      } catch {
        return false;
      }
    }),

  cast: Yup.string()
    .required("Cast list is required")
    .test("is-json", "Cast must be a valid JSON array", (value) => {
      try {
        const parsed = JSON.parse(value);
        return (
          Array.isArray(parsed) && parsed.every((v) => typeof v === "string")
        );
      } catch {
        return false;
      }
    }),

  formats: Yup.string()
    .required("Formats list is required")
    .test("is-json", "Formats must be a valid JSON array", (value) => {
      try {
        const parsed = JSON.parse(value);
        return (
          Array.isArray(parsed) && parsed.every((v) => typeof v === "string")
        );
      } catch {
        return false;
      }
    }),

  status: Yup.string()
    .required("Status is required")
    .oneOf(
      ["IN_THEATERS", "COMING_SOON", "PRESALE"],
      "Status must be IN_THEATERS, COMING_SOON or PRESALE"
    ),

  posterUrl: Yup.string().nullable().url("Poster URL must be valid"),

  trailerUrl: Yup.string().nullable().url("Trailer URL must be valid"),

  locale: Yup.string().required("Locale is required"),
});
