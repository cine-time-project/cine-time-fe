"use client";

import { useActionState } from "react";
import { updateMovieAction } from "@/action/movie-actions";
import { FormContainer } from "@/components/common/form-fields/FormContainer";
import { TextInput } from "@/components/common/form-fields/TextInput";
import { DateInput } from "@/components/common/form-fields/DateInput";
import { SelectInput } from "@/components/common/form-fields/SelectInput";
import { MultipleSelect } from "@/components/common/form-fields/MultipleSelect";
import { BackButton } from "@/components/common/form-fields/BackButton";
import { SubmitButton } from "@/components/common/form-fields/SubmitButton";
import { swAlert } from "@/helpers/sweetalert";

export const MovieEditForm = ({ movie, genres = [], cinemas = [] }) => {
  const [state, action, isPending] = useActionState(updateMovieAction);

  if (state?.message) swAlert(state.message, state.ok ? "success" : "error");

  return (
    <FormContainer>
      <form action={action}>
        <input type="hidden" name="id" value={movie.id} />

        <TextInput
          name="title"
          label="Title"
          className="mb-3"
          defaultValue={movie.title}
          errorMessage={state?.errors?.title}
        />

        <TextInput
          name="slug"
          label="Slug"
          className="mb-3"
          defaultValue={movie.slug}
          readOnly
        />

        <TextInput
          name="summary"
          label="Summary"
          className="mb-3"
          defaultValue={movie.summary}
        />

        <DateInput
          name="releaseDate"
          label="Release Date"
          className="mb-3"
          value={movie.releaseDate}
        />

        <TextInput
          name="duration"
          label="Duration (minutes)"
          className="mb-3"
          defaultValue={movie.duration}
        />

        <TextInput
          name="rating"
          label="Rating (0–10)"
          className="mb-3"
          defaultValue={movie.rating}
        />

        <TextInput
          name="director"
          label="Director"
          className="mb-3"
          defaultValue={movie.director}
        />

        <TextInput
          name="specialHalls"
          label="Special Halls"
          className="mb-3"
          defaultValue={movie.specialHalls}
        />

        <MultipleSelect
          name="cast"
          label="Cast"
          values={movie.cast}
          options={[]}
          className="mb-3"
        />

        <MultipleSelect
          name="formats"
          label="Formats"
          values={movie.formats}
          options={[
            { label: "2D", value: "2D" },
            { label: "3D", value: "3D" },
            { label: "IMAX", value: "IMAX" },
          ]}
          className="mb-3"
        />

        <MultipleSelect
          name="genre"
          label="Genres"
          values={movie.genre}
          options={genres}
          className="mb-3"
        />

        <SelectInput
          name="status"
          label="Status"
          defaultValue={movie.status}
          options={[
            { label: "In Theaters", value: "IN_THEATERS" },
            { label: "Coming Soon", value: "COMING_SOON" },
            { label: "Presale", value: "PRESALE" },
          ]}
          className="mb-3"
        />

        <TextInput
          name="posterUrl"
          label="Poster URL"
          defaultValue={movie.posterUrl}
          className="mb-3"
        />

        <TextInput
          name="trailerUrl"
          label="Trailer URL"
          defaultValue={movie.trailerUrl}
          className="mb-3"
        />

        <MultipleSelect
          name="cinemaIds"
          label="Cinemas"
          values={movie.cinemaIds}
          options={cinemas}
          className="mb-3"
        />

        <BackButton className="me-2" />
        <SubmitButton title="Update" pending={isPending} />
      </form>
    </FormContainer>
  );
};
