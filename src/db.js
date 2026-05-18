import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        // Usamos una variable de entorno llamada MONGODB_URI
        // Si no existe, intenta conectarse al localhost (opcional)
        const url = process.env.MONGODB_URI || 'mongodb://localhost/gestion';
        
        await mongoose.connect(url);
        console.log("✅ DB CONECTADA EN LA NUBE");
    } catch (error) {
        console.log("❌ ERROR AL CONECTAR LA DB:");
        console.log(error);
    }
}