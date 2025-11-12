import * as Yup from "yup";

export const HallSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required("Hall name is required")
    .min(3, "Hall name must be at least 3 characters")
    .max(100, "Hall name must be at most 100 characters"),

  seatCapacity: Yup.number()
    .transform((val, original) =>
      original === "" ? undefined : Number(original)
    )
    .typeError("Capacity must be a number")
    .required("Capacity is required")
    .min(1, "Capacity must be at least 1")
    .max(500, "Capacity must be at most 500"),

  cinemaId: Yup.number()
    .transform((val, original) =>
      original === "" ? undefined : Number(original)
    )
    .typeError("Cinema is required")
    .required("Cinema is required"),

  isSpecial: Yup.boolean()
    .transform((val, original) => {
      if (original === "true") return true;
      if (original === "false") return false;
      return undefined;
    })
    .notRequired(),
});
