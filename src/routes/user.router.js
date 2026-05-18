import { Router } from "express";
import multer from "multer"; 
import path from "path";
import fs from "fs"; // Para verificar la carpeta automáticamente
import { fileURLToPath } from "url";
import { 
    login, register, logout, profile, 
    verifyToken, getUsers, updateUserStatus 
} from "../controllers/user.controller.js";

import { authRequired } from "../middlewares/validateToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

// ==========================================
// 1. CONFIGURACIÓN DE RUTA ABSOLUTA (Anti-OneDrive)
// ==========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Esto crea la ruta hacia la carpeta 'uploads' que está en la raíz del proyecto
const uploadDir = path.join(__dirname, "../../uploads"); 

// Si por alguna razón la carpeta no existe, el servidor la crea solo al arrancar
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 100 * 1024 * 1024 } // Subimos a 100MB por si tus videos son pesados
}).fields([
    { name: 'foto', maxCount: 1 },
    { name: 'curp_file', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]);

// Middleware para capturar errores de Multer
const uploadMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Si el video es muy pesado, aquí te avisará
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json(["El archivo es demasiado grande (Máximo 100MB)"]);
            }
            return res.status(400).json([`Error de Multer: ${err.message}`]);
        } else if (err) {
            return res.status(400).json([`Error de subida: ${err.message}`]);
        }
        next();
    });
};

// ==========================================
// 2. RUTAS
// ==========================================
router.post("/register", uploadMiddleware, register); 
router.post("/login", login);
router.post("/logout", logout);
router.get("/verify", verifyToken); 
router.get("/profile", authRequired, profile);

// RUTAS DE ADMINISTRADOR
router.get("/users", authRequired, isAdmin, getUsers); 
router.put("/users/:id", authRequired, isAdmin, updateUserStatus);

export default router;