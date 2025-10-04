"use server";

import { response, transformFormDataToJSON, transformYupErrors, YupValidationError } from "@/helpers/data/form-validation";
import { ContactSchema } from "@/helpers/schemas/contact-schema";
import { createContactMessage } from "@/services/contact-service";

export const createContactMessageAction = async (prevState, formData) => {

    const fields = transformFormDataToJSON(formData);

    try {
        ContactSchema.validateSync(fields, {abortEarly: false} );

        const res = await createContactMessage(fields);
        const data = await res.json();

        if(!res.ok){
            return response(false, "", data?.validations);
        }

        return response(true, "Your message was sent successfully", null);

    } catch (error) {
        if(error instanceof YupValidationError){
            return transformYupErrors(error.inner);
        }

        throw error;
    }

}