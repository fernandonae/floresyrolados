import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true // ✅ Asegura que el email siempre se guarde en minúsculas
    },
    password: {
        type: String,
        required: true,
    },
    
    // --- DATOS PERSONALES PARA EL ADMIN ---
    nombre: { type: String, trim: true },
    apellidos: { type: String, trim: true },
    edad: { type: Number },
    curp_text: { 
        type: String, 
        trim: true,
        uppercase: true,
        unique: true, // ✅ Evita que usen el mismo CURP en varias cuentas
        sparse: true  // ✅ Permite que los admins no tengan CURP si no es necesario
    },

    // --- DATOS DE ENTREGA ---
    direccion: { type: String, trim: true },
    cp: { type: String, trim: true },
    estado: { type: String, trim: true },

    // --- ARCHIVOS DE IDENTIDAD (URLs) ---
    // Aquí guardamos la ruta completa: http://localhost:5000/uploads/nombre-archivo.jpg
    fotoUrl: { type: String, default: null },
    videoUrl: { type: String, default: null },
    curpUrl: { type: String, default: null },

    // --- MANEJO DE PERMISOS ---
    role: {
        type: String,
        required: true,
        enum: ['admin', 'delivery', 'client'],
        default: 'client' 
    },

    // --- ESTATUS DE LA CUENTA ---
    status: {
        type: String,
        required: true,
        enum: ['pending', 'active', 'rejected'],
        default: 'pending' 
    }
}, {
    timestamps: true // Crea 'createdAt' y 'updatedAt' automáticamente
})

export default mongoose.model('User', userSchema)