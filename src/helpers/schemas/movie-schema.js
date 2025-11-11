import * as Yup from "yup";

/**
 * MovieSchema
 * ------------
 * Yup validation schema for Movie create & update forms.
 * Based on the Movie entity and form fields.
 */

export const MovieSchema = Yup.object().shape({
  title: Yup.string()
    .transform((val, original) => (original === "" ? undefined : val))
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be at most 100 characters"),

  slug: Yup.string()
    .transform((val, original) => (original === "" ? undefined : val))
    .required("Slug is required")
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be at most 50 characters"),

  summary: Yup.string()
    .transform((val, original) => (original === "" ? undefined : val))
    .required("Summary is required")
    .min(3, "Summary must be at least 3 characters")
    .max(300, "Summary must be at most 300 characters"),

  releaseDate: Yup.date()
    .transform((val, original) => (original === "" ? undefined : val))
    .required("Release date is required")
    .typeError("Release date is required"),

  duration: Yup.number()
    .transform((val, original) =>
      original === "" ? undefined : Number(original)
    )
    .required("Duration is required")
    .min(1, "Duration must be greater than 0")
    .integer("Duration must be a number"),

  director: Yup.string()
    .transform((val, original) => (original === "" ? undefined : val))
    .nullable()
    .max(50, "Director name too long"),

  genre: Yup.string()
    .transform((val, original) => (original === "" ? undefined : val))
    .required("Genre list is required")
    .test("is-json", "Genre must be a valid JSON array", (value) => {
      try {
        const parsed = JSON.parse(value);
        return (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every((v) => typeof v === "string")
        );
      } catch {
        return false;
      }
    }),

  cast: Yup.string()
    .transform((val, original) => (original === "" ? undefined : val))
    .nullable(),

  formats: Yup.string()
    .transform((val, original) => (original === "" ? undefined : val))
    .required("Formats list is required")
    .test("is-json", "Formats must be a valid JSON array", (value) => {
      try {
        const parsed = JSON.parse(value);
        return (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every((v) => typeof v === "string")
        );
      } catch {
        return false;
      }
    }),

  status: Yup.string()
    .transform((val, original) => (original === "" ? undefined : val))
    .required("Status is required")
    .oneOf(
      ["IN_THEATERS", "COMING_SOON", "PRESALE"],
      "Status must be IN_THEATERS, COMING_SOON or PRESALE"
    )
    .test("not-empty", "Status is required", (value) => !!value),

  posterUrl: Yup.string()
    .transform((val, original) => (original === "" ? undefined : val))
    .nullable()
    .url("Poster URL must be valid"),

  trailerUrl: Yup.string()
    .transform((val, original) => (original === "" ? undefined : val))
    .nullable()
    .url("Trailer URL must be valid"),

  locale: Yup.string()
    .transform((val, original) => (original === "" ? undefined : val))
    .required("Locale is required"),
});
