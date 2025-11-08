"use client";

import { useActionState, useEffect, useState } from "react";
import { updateHallAction } from "@/action/hall-actions";
import { FormContainer } from "@/components/common/form-fields/FormContainer";
import { TextInput } from "@/components/common/form-fields/TextInput";
import { SelectInput } from "@/components/common/form-fields/SelectInput";
import { BackButton } from "@/components/common/form-fields/BackButton";
import { SubmitButton } from "@/components/common/form-fields/SubmitButton";
import { swAlert } from "@/helpers/sweetalert";
import { getToken } from "@/lib/utils/http";
import { useTranslations } from "next-intl";
import { getAllCinemas } from "@/service/cinema-service";

export const HallEditForm = ({ hall, locale }) => {
  const t = useTranslations("hall");
  const [state, formAction, isPending] = useActionState(updateHallAction, null);

  const [cinemaOptions, setCinemaOptions] = useState([]);
  const [token, setToken] = useState("");

  useEffect(() => setToken(getToken()), []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllCinemas(0, 100);
        const page = res?.returnBody ?? res ?? {};
        const items = page?.content ?? page ?? [];
        setCinemaOptions(items.map((c) => ({ label: c.name, value: c.id })));
      } catch (e) {
        console.error("cinemas load error", e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!state) return;
    const message = state.ok ? t("successUpdate") : t("errorOperation");
    swAlert(message, state.ok ? "success" : "error");
  }, [state, t]);

  return (
    <div>
      {/* 🔹 Başlık artık FormContainer kutusunun dışında */}
      <h4 className="fw-semibold mb-4">{t("updateTitle")}</h4>

      <FormContainer>
        <form action={formAction}>
          <input type="hidden" name="id" value={hall.id} />
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="token" value={token} />

          <TextInput
            name="name"
            label={t("nameRequired")}
            className="mb-3"
            defaultValue={hall.name}
            errorMessage={state?.errors?.name}
          />

          <TextInput
            name="seatCapacity"
            label={t("seatCapacityRequired")}
            className="mb-3"
            defaultValue={hall.seatCapacity}
            errorMessage={state?.errors?.seatCapacity}
          />

          <SelectInput
            name="isSpecial"
            label={t("isSpecial")}
            className="mb-3"
            defaultValue={String(hall.isSpecial)}
            options={[
              { label: t("no"), value: "false" },
              { label: t("yes"), value: "true" },
            ]}
            optionLabel="label"
            optionValue="value"
            errorMessage={state?.errors?.isSpecial}
          />

          <SelectInput
            name="cinemaId"
            label={t("cinemaRequired")}
            className="mb-3"
            defaultValue={hall.cinemaId}
            options={cinemaOptions}
            optionLabel="label"
            optionValue="value"
            errorMessage={state?.errors?.cinemaId}
          />

          <div className="d-flex justify-content-start mt-3">
            <BackButton className="me-2" />
            <SubmitButton title={t("updateButton")} pending={isPending} />
          </div>
        </form>
      </FormContainer>
    </div>
  );
};
