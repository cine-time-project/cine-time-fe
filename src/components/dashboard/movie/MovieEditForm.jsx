"use client";

import { useActionState, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { updateMovieAction } from "@/action/movie-actions";
import { FormContainer } from "@/components/common/form-fields/FormContainer";
import { TextInput } from "@/components/common/form-fields/TextInput";
import { DateInput } from "@/components/common/form-fields/DateInput";
import { SelectInput } from "@/components/common/form-fields/SelectInput";
import { MultipleSelect } from "@/components/common/form-fields/MultipleSelect";
import { BackButton } from "@/components/common/form-fields/BackButton";
import { SubmitButton } from "@/components/common/form-fields/SubmitButton";
import { swAlert } from "@/helpers/sweetalert";
import { getToken } from "@/lib/utils/http";
import { ALL_GENRES } from "@/helpers/data/genres";
import { useRouter } from "next/navigation";

export const MovieEditForm = ({ movie, genres = [] }) => {
  const t = useTranslations("movie");
  const [state, formAction, isPending] = useActionState(
    updateMovieAction,
    null
  );

  const [token, setToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    setToken(getToken());
  }, []);

  const selectedGenres = (movie.genre || []).filter((g) =>
    ALL_GENRES.some((opt) => opt.value === g)
  );

  useEffect(() => {
    if (state?.message) {
      let translatedMessage = state.message;

      if (state.message === "Movie updated successfully") {
        translatedMessage = t("successUpdate");
      } else if (state.message === "Movie created successfully") {
        translatedMessage = t("successCreateMovie");
      } else if (state.message === "Movie deleted successfully") {
        translatedMessage = t("successDelete");
      }

      swAlert(translatedMessage, state.ok ? "success" : "error");
      if (state.ok) {
        setTimeout(() => {
          router.push("/tr/admin/movies");
          router.refresh();
        }, 1000);
      }
    }
  }, [state, router, t]);

  return (
    <FormContainer>
      <form action={formAction}>
        <input type="hidden" name="id" value={movie.id} />
        <input type="hidden" name="locale" value="tr" />
        <input type="hidden" name="token" value={token} />

        {/* Required fields */}
        <TextInput
          name="title"
          label={`${t("title")} *`}
          className="mb-3"
          defaultValue={movie.title}
          errorMessage={state?.errors?.title}
        />
        <TextInput
          name="summary"
          label={`${t("summary")} *`}
          className="mb-3"
          defaultValue={movie.summary}
          errorMessage={state?.errors?.summary}
        />

        <TextInput
          name="slug"
          label={`${t("slug")} *`}
          className="mb-3"
          defaultValue={movie.slug}
          errorMessage={state?.errors?.slug}
        />
        <DateInput
          name="releaseDate"
          label={`${t("releaseDate")} *`}
          className="mb-3"
          value={movie.releaseDate}
          errorMessage={state?.errors?.releaseDate}
        />
        <TextInput
          name="duration"
          label={`${t("duration")} *`}
          className="mb-3"
          defaultValue={movie.duration}
          errorMessage={state?.errors?.duration}
        />

        <TextInput
          name="cast"
          label={t("cast")}
          className="mb-3"
          defaultValue={movie.cast?.join(", ") || ""}
          errorMessage={state?.errors?.cast}
        />

        <MultipleSelect
          name="formats"
          label="Formats *"
          values={movie.formats}
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
          values={selectedGenres}
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
          defaultValue={movie.status}
          errorMessage={state?.errors?.status}
          options={[
            { label: "In Theaters", value: "IN_THEATERS" },
            { label: "Coming Soon", value: "COMING_SOON" },
            { label: "Presale", value: "PRESALE" },
          ]}
          optionLabel="label"
          optionValue="value"
        />

        {/* Optional fields */}
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
          name="posterUrl"
          label="Poster URL"
          className="mb-3"
          defaultValue={movie.posterUrl}
        />
        <TextInput
          name="trailerUrl"
          label="Trailer URL"
          className="mb-3"
          defaultValue={movie.trailerUrl}
        />
        <BackButton className="me-2" title={t("backButton")} />
        <SubmitButton title={t("updateButton")} pending={isPending} />
      </form>
    </FormContainer>
  );
};
