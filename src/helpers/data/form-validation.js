export { ValidationError as YupValidationError } from "yup";

export const transformFormDataToJSON = (formData) => {
  const obj = {};
  for (const [key, value] of formData.entries()) {
    if (obj[key]) {
      // already has a value: convert to array
      obj[key] = Array.isArray(obj[key])
        ? [...obj[key], value]
        : [obj[key], value];
    } else {
      obj[key] = value;
    }
  }
  return obj;
};

export const response = (ok, message, errors) => {
  return {
    ok,
    message,
    errors,
    responseId: Math.random(),
  };
};

export const transformYupErrors = (errors) => {
  const errObject = {};
  errors.forEach((error) => (errObject[error.path] = error.message));

  return response(false, "", errObject);
};
