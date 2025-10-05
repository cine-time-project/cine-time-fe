"use server";

import { response, transformFormDataToJSON, transformYupErrors, YupValidationError } from "@/helpers/data/form-validation";
import { ContactSchema } from "@/helpers/schemas/contact-schema";
import { createContactMessage } from "@/services/contact-service";

export async function createContactMessageAction(prev, formData) {
  try {
    const fields = Object.fromEntries(formData);
    ContactSchema.validateSync(fields, { abortEarly: false });

    const res  = await createContactMessage(fields);   // <— burası patlıyor
    // fetch döndüyse res.ok/parse et
    const data = await res.json();

    if (!res.ok) {
      return { ok: false, message: data?.message || "Request failed", errors: data?.validations };
    }
    return { ok: true, message: "Mesajınız alındı.", errors: null };
  } catch (err) {
    // URL ya da ağ problemi olursa buraya düşer
    console.error("contact action error:", err);
    return { ok: false, message: err?.message || "Network error", errors: null };
  }
}
