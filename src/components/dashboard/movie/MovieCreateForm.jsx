"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { createMovieAction } from "@/action/movie-actions";
import { getGenres } from "@/services/movie-service";
import { FormContainer } from "@/components/common/form-fields/FormContainer";
import { TextInput } from "@/components/common/form-fields/TextInput";
import { DateInput } from "@/components/common/form-fields/DateInput";
import { SelectInput } from "@/components/common/form-fields/SelectInput";
import { MultipleSelect } from "@/components/common/form-fields/MultipleSelect";
import { BackButton } from "@/components/common/form-fields/BackButton";
import { SubmitButton } from "@/components/common/form-fields/SubmitButton";
import { swAlert } from "@/helpers/sweetalert";

export const MovieCreateForm = ({ locale, cinemas = [] }) => {
  const [state, action, isPending] = useActionState(createMovieAction);
  const [genreOptions, setGenreOptions] = useState([]);

  // 🟢 Genres'ı backend'den çek
  useEffect(() => {
    getGenres()
      .then((data) => {
        // Eğer backend string array dönerse, label/value formatına çevir
        const formatted = data.map((g) => ({ label: g, value: g }));
        setGenreOptions(formatted);
      })
      .catch((err) => {
        console.error("Failed to load genres:", err);
        setGenreOptions([]); // fallback boş bırak
      });
  }, []);

  if (state?.message) swAlert(state.message, state.ok ? "success" : "error");

  return (
    <FormContainer>
      <form action={action}>
        {/* Basic Info */}
        <TextInput
          name="title"
          label="Title"
          className="mb-3"
          errorMessage={state?.errors?.title}
        />
        <TextInput
          name="slug"
          label="Slug"
          className="mb-3"
          errorMessage={state?.errors?.slug}
        />
        <TextInput
          name="summary"
          label="Summary"
          className="mb-3"
          errorMessage={state?.errors?.summary}
        />
        <DateInput
          name="releaseDate"
          label="Release Date"
          className="mb-3"
          errorMessage={state?.errors?.releaseDate}
        />
        <TextInput
          name="duration"
          label="Duration (minutes)"
          className="mb-3"
          errorMessage={state?.errors?.duration}
        />
        <TextInput
          name="rating"
          label="Rating (0–10)"
          className="mb-3"
          errorMessage={state?.errors?.rating}
        />
        <TextInput
          name="director"
          label="Director"
          className="mb-3"
          errorMessage={state?.errors?.director}
        />
        <TextInput
          name="specialHalls"
          label="Special Halls"
          className="mb-3"
          errorMessage={state?.errors?.specialHalls}
        />

        {/* Cast */}
        <MultipleSelect
          name="cast"
          label="Cast"
          options={[]}
          optionLabel="label"
          optionValue="value"
          placeholder="Add cast members"
          className="mb-3"
          errorMessage={state?.errors?.cast}
        />

        {/* Formats */}
        <MultipleSelect
          name="formats"
          label="Formats"
          options={[
            { label: "2D", value: "2D" },
            { label: "3D", value: "3D" },
            { label: "IMAX", value: "IMAX" },
          ]}
          optionLabel="label"
          optionValue="value"
          className="mb-3"
          errorMessage={state?.errors?.formats}
        />

        {/* Genres */}
        <MultipleSelect
          name="genre"
          label="Genres"
          options={genreOptions}
          optionLabel="label"
          optionValue="value"
          placeholder="Select genres"
          className="mb-3"
          errorMessage={state?.errors?.genre}
        />

        {/* Status */}
        <SelectInput
          name="status"
          label="Status"
          className="mb-3"
          errorMessage={state?.errors?.status}
          options={[
            { label: "In Theaters", value: "IN_THEATERS" },
            { label: "Coming Soon", value: "COMING_SOON" },
            { label: "Presale", value: "PRESALE" },
          ]}
          optionLabel="label"
          optionValue="value"
        />

        {/* Poster & Trailer */}
        <TextInput
          name="posterUrl"
          label="Poster URL"
          className="mb-3"
          errorMessage={state?.errors?.posterUrl}
        />
        <TextInput
          name="trailerUrl"
          label="Trailer URL"
          className="mb-3"
          errorMessage={state?.errors?.trailerUrl}
        />

        {/* Cinemas */}
        <MultipleSelect
          name="cinemaIds"
          label="Cinemas"
          options={cinemas}
          optionLabel="label"
          optionValue="value"
          className="mb-3"
        />

        {/* Buttons */}
        <BackButton className="me-2" />
        <SubmitButton title="Create" pending={isPending} />
      </form>
    </FormContainer>
  );
};
