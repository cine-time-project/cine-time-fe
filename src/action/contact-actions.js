"use server";
import { response, transformFormDataToJSON, transformYupErrors } from "@/helpers/data/form-validation";
import { makeContactSchema } from "@/helpers/schemas/contact-schema";   
import { createContactMessage } from "@/services/contact-service";
import { getTranslations } from "next-intl/server";                     

export async function createContactMessageAction(prev, formData) {
  try {
    const t = await getTranslations("contact");         // server-side t
    const schema = makeContactSchema(t);                // şemayı üret

    const data = transformFormDataToJSON(formData);
    await schema.validate(data, { abortEarly: false }); // server doğrulaması

    await createContactMessage(data);
    return response(true, "OK");
  } catch (err) {
    if (err?.name === "ValidationError") {
      return response(false, "Validation failed", transformYupErrors(err));
    }
    return response(false, "Unexpected error");
  }
}
