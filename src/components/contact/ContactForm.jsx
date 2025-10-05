"use client";

import { Col, Row } from "react-bootstrap";
import { TextInput } from "../common/FormControls/TextInput";
import { SubmitButton } from "../common/FormControls/SubmitButton";
import { createContactMessageAction } from "@/action/contact-actions";
import { useActionState, useRef } from "react";
import { swAlert } from "@/helpers/sweetalert";
import { useTranslations } from "next-intl";

export const ContactForm = () => {
  const t = useTranslations("contact");
  const tswal = useTranslations("swal");

  const [state, formAction, isPending] = useActionState(
    createContactMessageAction,
    null
  );

  const refForm = useRef(null);

  if (state?.message) {
    if (state.ok) {
      swAlert(state.message || t("alerts.sentText"), "success", {
        title: t("alerts.sentTitle"),
        confirmButtonText: tswal("confirm"),
        cancelButtonText: tswal("cancel"),
      });
      refForm.current?.reset();
    } else {
      swAlert(state.message || t("alerts.failGeneric"), "error", {
        title: t("alerts.failTitle"),
        confirmButtonText: tswal("confirm"),
        cancelButtonText: tswal("cancel"),
      });
    }
  }

  return (
    <form className="contact-form" action={formAction} ref={refForm} noValidate>
      <Row>
        <Col md={6}>
          <TextInput
            className="mb-3"
            name="fullName"
            label={t("form.fullName")}
            iconBefore="user"
            required
            placeholder={t("form.placeholders.fullName")}
            helperText={undefined}
            errorMessage={state?.errors?.fullName}
           
          />
        </Col>

        <Col md={6}>
          <TextInput
            className="mb-3"
            name="email"
            label={t("form.email")}
            iconBefore="envelope"
            type="email"
            inputMode="email"
            required
            placeholder={t("form.placeholders.email")}
            errorMessage={state?.errors?.email}
          
          />
        </Col>

        <Col md={6}>
          <TextInput
            className="mb-3"
            name="phoneNumber"
            label={t("form.phoneNumber")}
            iconBefore="phone"
            inputMode="tel"
            required
            placeholder={t("form.placeholders.phoneNumber")}
            helperText={t("form.helper.phoneMask")}
            errorMessage={state?.errors?.phoneNumber}
           
          />
        </Col>

        <Col xs={6}>
          <TextInput
            className="mb-3"
            name="subject"
            label={t("form.subject")}
            iconBefore="tag"
            required
            placeholder={t("form.placeholders.subject")}
            errorMessage={state?.errors?.subject}
           
          />
        </Col>

        <Col xs={12}>
          <TextInput
            className="mb-3"
            name="message"
            label={t("form.message")}
            iconBefore="comment"
            as="textarea"
            style={{ height: 110 }}
            required
            placeholder={t("form.placeholders.message")}
            errorMessage={state?.errors?.message}
           
          />
        </Col>
      </Row>

      <SubmitButton
        pending={isPending}
        label={t("form.submit")}
        pendingLabel={t("form.sending")}
      />
    </form>
  );
};
