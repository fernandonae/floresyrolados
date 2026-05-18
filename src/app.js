import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config'; // <--- AGREGA ESTO para leer el .env

// --- IMPORTACIÓN DE RUTAS ---
import userRoutes from "./routes/user.router.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import couponRoutes from "./routes/coupon.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 1. CONFIGURACIÓN DE CORS (Adaptable a producción)
app.use(cors({
    // Si existe FRONTEND_URL en el .env la usa, si no, usa localhost
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true 
}));

// 2. MIDDLEWARES
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// 3. MIDDLEWARE ANTI-304
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// 4. CONFIGURACIÓN DE CARPETA UPLOADS
const uploadsPath = path.join(__dirname, '..', 'uploads'); 

if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// 5. RUTAS DE LA API
app.use("/api", userRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", couponRoutes);

// 6. MANEJO DE RUTAS NO ENCONTRADAS
app.use((req, res) => {
    res.status(404).json({ message: "La ruta solicitada no existe" });
});

export default app;