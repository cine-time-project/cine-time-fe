import * as Yup from "yup";

const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;

export const ContactSchema = Yup.object({
  fullName: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phoneNumber: Yup.string()
    .matches(phoneRegex, "Phone format '(XXX) XXX-XXXX'")
    .required("Phone number is required"),
  subject: Yup.string().required("Subject is required."),
  message: Yup.string().required("Message is required."),
});
