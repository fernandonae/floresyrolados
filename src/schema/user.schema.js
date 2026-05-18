import { z } from "zod";

// Validación para el Registro de usuarios
export const registerSchema = z.object({
  username: z
    .string({
      required_error: "El nombre de usuario es requerido",
    })
    .min(3, {
      message: "El nombre de usuario debe tener al menos 3 caracteres",
    }),
  email: z
    .string({
      required_error: "El correo electrónico es requerido",
    })
    .email({
      message: "Correo electrónico no válido",
    }),
  password: z
    .string({
      required_error: "La contraseña es requerida",
    })
    .min(6, {
      message: "La contraseña debe tener al menos 6 caracteres",
    }),
  // Agregamos el rol para identificar si es admin, repartidor o cliente
  role: z
    .enum(["admin", "delivery", "client"], {
      errorMap: () => ({ message: "El rol debe ser admin, delivery o client" }),
    })
    .optional(), 
});

// Validación para el Inicio de Sesión (Login)
export const loginSchema = z.object({
  email: z
    .string({
      required_error: "El correo electrónico es requerido",
    })
    .email({
      message: "Correo electrónico no válido",
    }),
  password: z
    .string({
      required_error: "La contraseña es requerida",
    })
    .min(6, {
      message: "La contraseña debe ser de al menos 6 caracteres",
    }),
});