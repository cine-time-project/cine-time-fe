"use client";

import { useRef, useState, useEffect, useMemo, startTransition } from "react";
import { Col, Row, Button } from "react-bootstrap";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import Swal from "sweetalert2";

import { TextInput } from "../common/FormControls/TextInput";
import { SubmitButton } from "../common/FormControls/SubmitButton";
import { createContactMessageAction } from "@/action/contact-actions";
import { makeContactSchema } from "@/helpers/schemas/contact-schema";

/* ---------- Yardımcılar ---------- */

const fieldLabels = (t) => ({
  fullName:    t("form.fullName"),
  email:       t("form.email"),
  phoneNumber: t("form.phoneNumber"),
  subject:     t("form.subject"),
  message:     t("form.message"),
});

function normalizeMsgs(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === "object") return Object.values(val).flat().map(String);
  return [String(val)];
}

function buildErrorsHtml(errors, t) {
  if (!errors || typeof errors !== "object") return "";
  const labels = fieldLabels(t);
  const items = Object.entries(errors).map(([key, val]) => {
    const label = labels[key] ?? key;
    const msgs  = normalizeMsgs(val);
    const joined = msgs.filter(Boolean).join("<br/>");
    return `<li><strong>${label}:</strong> ${joined}</li>`;
  }).join("");
  return items ? `<ul style="text-align:left;margin:0 0 0 1rem;">${items}</ul>` : "";
}

function focusFirstInvalid(form, errors) {
  if (!form || !errors) return;
  for (const name of Object.keys(errors)) {
    const el = form.querySelector(`[name="${name}"]`);
    if (el && typeof el.focus === "function") { el.focus(); break; }
  }
}

/* ---------- Bileşen ---------- */

export const ContactForm = () => {
  const t = useTranslations("contact");
  const tswal = useTranslations("swal");

  // ✅ Şema: t hazırken, bileşenin İÇİNDE üret
  const schema = useMemo(() => makeContactSchema(t), [t]);

  const [state, formAction, isPending] = useActionState(createContactMessageAction, null);

  const refForm = useRef(null);
  const [localErrors, setLocalErrors] = useState({});
  const [activeReason, setActiveReason] = useState(null);
  const handledRef = useRef(null);

  // Submit: önce Yup, geçerse server action
  const onSubmit = async (e) => {
    e.preventDefault();
    const form = refForm.current;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    try {
      await schema.validate(data, { abortEarly: false });
      setLocalErrors({});
      startTransition(() => {
   formAction(fd);
 });
    } catch (err) {
      if (err?.name === "ValidationError") {
        const map = {};
        err.inner.forEach((e) => { if (e.path && !map[e.path]) map[e.path] = e.message; });
        setLocalErrors(map);

        focusFirstInvalid(form, map);
        const html = buildErrorsHtml(map, t);
        await Swal.fire({
          icon: "error",
          title: t("alerts.failTitle"),
          html,
          confirmButtonText: tswal("confirm"),
        });
      } else {
        await Swal.fire({
          icon: "error",
          title: t("alerts.failTitle"),
          text: "Unexpected validation error",
          confirmButtonText: tswal("confirm"),
        });
      }
    }
  };

  // Server action sonucunu işle (tek sefer)
  useEffect(() => {
    if (isPending) { handledRef.current = null; return; }
    if (!state) return;

    const key = state?.id ?? `${state.ok}-${state.message}-${Object.keys(state.errors || {}).join(",")}`;
    if (handledRef.current === key) return;
    handledRef.current = key;

    if (state.ok) {
      Swal.fire({
        icon: "success",
        title: t("alerts.sentTitle"),
        text: state.message || t("alerts.sentText"),
        confirmButtonText: tswal("confirm"),
      });
      refForm.current?.reset();
      setActiveReason(null);
      setLocalErrors({});
    } else {
      const errors = state.errors || {};
      focusFirstInvalid(refForm.current, errors);
      const html = buildErrorsHtml(errors, t);
      const count = Object.keys(errors).length;

      Swal.fire({
        icon: "error",
        title: count ? `${count} ${t("alerts.errorCountSuffix") || "errors occurred"}` : t("alerts.failTitle"),
        html: html || (state.message || t("alerts.failGeneric")),
        confirmButtonText: tswal("confirm"),
      });
    }
  }, [state, isPending, t, tswal]);

  const reasons = [
    { key: "refund",  label: t("reasons.refund") },
    { key: "payment", label: t("reasons.payment") },
    { key: "general", label: t("reasons.general") },
  ];

  const pickReason = (key, label) => {
    const form = refForm.current;
    if (!form) return;

    const subj = form.querySelector('input[name="subject"], textarea[name="subject"]');
    const msg  = form.querySelector('textarea[name="message"]');

    if (subj) {
      subj.value = label;
      subj.dispatchEvent(new Event("input", { bubbles: true }));
      subj.dispatchEvent(new Event("change", { bubbles: true }));
    }
    msg?.focus();
    setActiveReason(key);
  };

  return (
    <form className="contact-form" ref={refForm} noValidate onSubmit={onSubmit}>
      <Row className="align-items-center g-3 mb-2">
        <Col xs={12} md="auto">
          <small className="text-muted">{t("reasons.title")}</small>
        </Col>
        <Col xs={12} md>
          <div className="quick-reasons d-flex flex-wrap justify-content-md-start">
            {reasons.map((r) => (
              <Button
                key={r.key}
                className="reason-btn"
                type="button"
                variant={activeReason === r.key ? "warning" : "outline-secondary"}
                onClick={() => pickReason(r.key, r.label)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <TextInput
            className="mb-3"
            name="fullName"
            label={t("form.fullName")}
            iconBefore="user"
            required
            placeholder={t("form.placeholders.fullName")}
            errorMessage={localErrors.fullName || state?.errors?.fullName}
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
            errorMessage={localErrors.email || state?.errors?.email}
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
            errorMessage={localErrors.phoneNumber || state?.errors?.phoneNumber}
          />
        </Col>

        <Col md={6}>
          <TextInput
            className="mb-3"
            name="subject"
            label={t("form.subject")}
            iconBefore="tag"
            required
            placeholder={t("form.placeholders.subject")}
            errorMessage={localErrors.subject || state?.errors?.subject}
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
            errorMessage={localErrors.message || state?.errors?.message}
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
