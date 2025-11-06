"use client";

import { useActionState, useEffect, useState } from "react";
import { createHallAction } from "@/action/hall-actions";
import { FormContainer } from "@/components/common/form-fields/FormContainer";
import { TextInput } from "@/components/common/form-fields/TextInput";
import { SelectInput } from "@/components/common/form-fields/SelectInput";
import { BackButton } from "@/components/common/form-fields/BackButton";
import { SubmitButton } from "@/components/common/form-fields/SubmitButton";
import { swAlert } from "@/helpers/sweetalert";
import { getToken } from "@/lib/utils/http";
import { getAllCinemas } from "@/service/cinema-service";
import { useTranslations } from "next-intl";

export const HallCreateForm = ({ locale }) => {
  const t = useTranslations("hall");
  const [state, action, isPending] = useActionState(createHallAction, null);

  const [cinemaOptions, setCinemaOptions] = useState([]);
  const [token, setToken] = useState(getToken());

  useEffect(() => {
    console.log(token);
    if (!token) return;
    const load = async () => {
      try {
        const res = await getAllCinemas(0, 100, token);
        const page = res?.returnBody ?? res ?? {};
        const items = page?.content ?? page ?? [];
        setCinemaOptions(items.map((c) => ({ label: c.name, value: c.id })));
      } catch (e) {
        console.error("cinemas load error", e);
      }
    };
    load();
  }, [token]);

  useEffect(() => {
    if (state?.message) {
      if (state.ok) {
        state.message = t("successCreate");
      } else {
        state.message = t("duplicateName");
      }
      swAlert(state.message, state.ok ? "success" : "error").then(() => {
        if (state.ok) window.location.href = `/${locale}/admin/halls`;
      });
    }
  }, [state, locale]);

  return (
    <div>
      <h4 className="fw-semibold mb-4">{t("createTitle")}</h4>

      <FormContainer>
        <form action={action}>
          <input type="hidden" name="id" value="" />
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="token" value={token} />

          <TextInput
            name="name"
            label={t("nameRequired")}
            className="mb-3"
            errorMessage={state?.errors?.name}
          />

          <TextInput
            name="seatCapacity"
            label={t("seatCapacityRequired")}
            className="mb-3"
            errorMessage={state?.errors?.seatCapacity}
          />

          <SelectInput
            name="isSpecial"
            label={t("isSpecial")}
            className="mb-3"
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
            options={cinemaOptions}
            optionLabel="label"
            optionValue="value"
            errorMessage={state?.errors?.cinemaId}
          />

          <div className="d-flex justify-content-start mt-3">
            <BackButton className="me-2" />
            <SubmitButton title={t("createButton")} pending={isPending} />
          </div>
        </form>
      </FormContainer>
    </div>
  );
};
