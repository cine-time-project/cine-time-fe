"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { createMovieAction } from "@/action/movie-actions";
import { getGenres, getActors } from "@/services/movie-service";
import { FormContainer } from "@/components/common/form-fields/FormContainer";
import { TextInput } from "@/components/common/form-fields/TextInput";
import { DateInput } from "@/components/common/form-fields/DateInput";
import { SelectInput } from "@/components/common/form-fields/SelectInput";
import { MultipleSelect } from "@/components/common/form-fields/MultipleSelect";
import { BackButton } from "@/components/common/form-fields/BackButton";
import { SubmitButton } from "@/components/common/form-fields/SubmitButton";
import { swAlert } from "@/helpers/sweetalert";
import { ALL_GENRES } from "@/helpers/data/genres";
import { getToken } from "@/lib/utils/http";

export const MovieCreateForm = ({ locale }) => {
  const [state, action, isPending] = useActionState(createMovieAction, null);
  const [genreOptions, setGenreOptions] = useState([]);
  const [actorOptions, setActorOptions] = useState([]);

  const [token, setToken] = useState("");

  useEffect(() => {
    setToken(getToken());
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [genresData, actorsData] = await Promise.allSettled([
          getGenres(),
          getActors(),
        ]);

        if (genresData.status === "fulfilled") {
          setGenreOptions(
            genresData.value.map((g) => ({ label: g, value: g }))
          );
        }

        if (actorsData.status === "fulfilled") {
          setActorOptions(
            actorsData.value.map((a) => ({ label: a, value: a }))
          );
        }
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };

    loadData();
  }, []);

  if (state?.message) swAlert(state.message, state.ok ? "success" : "error");

  return (
    <FormContainer>
      <form action={action}>
        <input type="hidden" name="id" value={""} />
        <input type="hidden" name="locale" value="tr" />
        <input type="hidden" name="token" value={token} />
        {/* Zorunlu Alanlar */}
        <TextInput
          name="title"
          label="Title *"
          className="mb-3"
          errorMessage={state?.errors?.title}
        />
        <TextInput
          name="summary"
          label="Summary *"
          className="mb-3"
          errorMessage={state?.errors?.summary}
        />

        <TextInput
          name="slug"
          label="Slug *"
          className="mb-3"
          errorMessage={state?.errors?.slug}
        />
        <DateInput
          name="releaseDate"
          label="Release Date *"
          className="mb-3"
          errorMessage={state?.errors?.releaseDate}
        />
        <TextInput
          name="duration"
          label="Duration (minutes) *"
          className="mb-3"
          errorMessage={state?.errors?.duration}
        />

        <TextInput
          name="cast"
          label="Cast members (comma separated)"
          className="mb-3"
          errorMessage={state?.errors?.cast}
        />

        <MultipleSelect
          name="formats"
          label="Formats *"
          options={[
            { label: "2D", value: "2D" },
            { label: "3D", value: "3D" },
            { label: "IMAX", value: "IMAX" },
          ]}
          className="mb-3"
          errorMessage={state?.errors?.formats}
        />

        <MultipleSelect
          name="genre"
          label="Genres *"
          options={ALL_GENRES}
          optionLabel="label"
          optionValue="value"
          className="mb-3"
          errorMessage={state?.errors?.genre}
        />

        <SelectInput
          name="status"
          label="Status *"
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

        {/* İsteğe Bağlı Alanlar */}
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

        <BackButton className="me-2" />
        <SubmitButton title="Create" pending={isPending} />
      </form>
    </FormContainer>
  );
};
