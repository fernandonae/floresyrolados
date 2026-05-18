import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder // <--- Asegúrate de importar esto
} from "../controllers/order.controller.js";

const router = Router();

// Todas las rutas de órdenes requieren que el usuario esté logueado

// Obtener órdenes (Filtra automáticamente por rol en el controlador)
router.get("/orders", authRequired, getOrders);

// Crear una nueva orden (El cliente compra)
router.post("/orders", authRequired, createOrder);

// Actualizar estado o asignar repartidor (Solo Admin o Delivery)
router.put("/orders/:id", authRequired, updateOrderStatus);

// --- ESTA ES LA RUTA QUE FALTABA PARA ELIMINAR ---
// Borrar orden (Solo Admin debería poder hacerlo)
router.delete("/orders/:id", authRequired, deleteOrder);

export default router;