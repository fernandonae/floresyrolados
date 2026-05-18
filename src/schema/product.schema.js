import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string({
      required_error: "El nombre del producto es requerido",
    })
    .min(3, {
      message: "El nombre debe tener al menos 3 caracteres",
    }),
  description: z
    .string({
      required_error: "La descripción es requerida",
    }),
  price: z.preprocess((val) => Number(val), 
    z.number({
      required_error: "El precio es requerido",
    })
    .nonnegative({
      message: "El precio no puede ser negativo",
    })
  ),
  category: z.enum(["Flores", "Extractos", "Comestibles THC", "Pods", "Other"], {
    errorMap: () => ({ message: "Categoría no válida" }),
  }),
  stock: z.preprocess((val) => Number(val),
    z.number({
      required_error: "El stock es requerido",
    })
    .int()
    .nonnegative()
  ),
});