import app from "./app.js";
import { connectDB } from "./db.js";
import { Server as SocketServer } from "socket.io";
import http from "http";
import fs from "fs"; 
import path from "path";
import { fileURLToPath } from 'url';

// --- CONFIGURACIÓN DE RUTAS ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 0. SEGURIDAD DE CARPETAS ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("📁 Carpeta 'uploads' creada.");
}

// --- 1. CONEXIÓN DB ---
connectDB();

// --- 2. SERVIDOR HTTP ---
const server = http.createServer(app);

// --- 3. SOCKET.IO (GPS EN TIEMPO REAL) ---
// --- 3. SOCKET.IO (GPS EN TIEMPO REAL) ---
const io = new SocketServer(server, {
    cors: {
        // Usa la URL de producción si existe, si no, localhost
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true
    },
});

// Compartir la instancia de 'io' con las rutas si fuera necesario
app.set("socketio", io);

io.on("connection", (socket) => {
    console.log("📡 Nuevo nodo conectado al sistema GPS:", socket.id);

    // Escuchar ubicación del repartidor
    socket.on("repartidor:ubicacion", (datos) => {
        // datos debe traer: { orderId, lat, lng }
        io.emit("admin:actualizar-mapa", datos);
    });

    // Alerta cuando cliente quita el GPS
    socket.on("cliente:gps-desactivado", (datos) => {
    io.emit("admin:alerta-gps", datos); // datos = { orderId, clienteNombre }
    });

    socket.on("disconnect", () => {
        console.log("❌ Nodo desconectado del GPS");
    });
});

// --- 4. MIDDLEWARE ANTI-CACHÉ (SOLUCIÓN AL 304) ---
// Esto obliga al navegador a pedir datos frescos siempre
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// --- 5. ENCENDIDO ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`\n🚀 CENTRAL BACKEND OPERATIVA`);
    console.log(`✅ Puerto: ${PORT}`);
    console.log(`📍 GPS Stream: Activo`);
    console.log(`📁 Directorio de archivos: ${uploadsDir}`);
});