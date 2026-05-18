import { z } from "zod";

export const createOrderSchema = z.object({
  // Validamos que el carrito no venga vacío
  products: z
    .array(
      z.object({
        product: z.string({
          required_error: "El ID del producto es requerido",
        }),
        quantity: z
          .number({
            required_error: "La cantidad es requerida",
          })
          .min(1, {
            message: "La cantidad mínima es 1",
          }),
      }),
      { required_error: "Los productos son obligatorios" }
    )
    .min(1, {
      message: "Debes añadir al menos un producto al pedido",
    }),

  // Aquí validamos lo que pediste: Efectivo o Transferencia
  paymentMethod: z.enum(["cash", "transfer"], {
    errorMap: () => ({
      message: "El método de pago debe ser 'cash' (efectivo) o 'transfer' (transferencia)",
    }),
  }),

  // Dirección para el repartidor en California
  deliveryAddress: z
    .string({
      required_error: "La dirección de entrega es requerida",
    })
    .min(5, {
      message: "La dirección debe ser más específica",
    }),
    
  // El comprobante es opcional al inicio (se puede subir después)
  paymentReceipt: z.string().optional(),
});