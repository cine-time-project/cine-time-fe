import * as Yup from "yup";

export const PHONE_MASK = "(XXX) XXX-XXXX";
const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;

/** t: useTranslations("contact") */
export function makeContactSchema(t) {
  return Yup.object({
    fullName: Yup.string().required(t("errors.fullNameRequired")),
    email: Yup.string()
      .email(t("errors.emailInvalid"))
      .required(t("errors.emailRequired")),
    phoneNumber: Yup.string()
      .matches(phoneRegex, t("errors.phoneMask")) // "(XXX) XXX-XXXX"
      .required(t("errors.phoneRequired")),
    subject: Yup.string().required(t("errors.subjectRequired")),
    message: Yup.string().required(t("errors.messageRequired")),
  });
}
