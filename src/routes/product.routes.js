import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { validateSchema } from "../middlewares/validator.middleware.js"; // Importamos tu validador
import { createProductSchema } from "../schema/product.schema.js"; // Importamos el esquema de productos
import multer from "multer";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

const router = Router();

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // 👈 Esto agrega .jpg/.png
    }
});

const upload = multer({ storage });

// Rutas de Lectura (Requieren estar logueado)
router.get("/products", authRequired, getProducts);
router.get("/products/:id", authRequired, getProduct);

// Rutas de Escritura (Ahora pasan por la validación de Zod antes de llegar al controlador)
router.post(
  "/products", 
  authRequired, 
  upload.single("image"),
  validateSchema(createProductSchema), // <-- Aquí sucede la magia de la validación
  createProduct
);

router.put(
  "/products/:id", 
  authRequired, 
  upload.single("image"),
  validateSchema(createProductSchema), // También validamos al actualizar
  updateProduct
);

router.delete("/products/:id", authRequired, deleteProduct);

export default router;