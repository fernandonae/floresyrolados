import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import { createAccessToken } from '../libs/jwt.js'
import jwt from 'jsonwebtoken'
import { TOKEN_SECRET } from '../config.js'
import nodemailer from 'nodemailer'

// CONFIGURACIÓN DE CORREO
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: 'fernandolalala9@gmail.com', 
        pass: 'tprfujkmhpqqquhw' 
    }
});

// FUNCIÓN DE REGISTRO COMPLETA Y ARREGLADA
export const register = async (req, res) => {
    // 1. Extraemos TODOS los datos que vienen del formulario de React
    const { 
        email, 
        password, 
        username, 
        nombre, 
        apellidos, 
        curp_text, 
        direccion, 
        colonia, // <-- Agregado
        edad, 
        cp, 
        estado 
    } = req.body
    
    try {
        // Verificar si el usuario ya existe
        const userFound = await User.findOne({ email });
        if (userFound) return res.status(400).json(["El email ya está en uso"]);

        // Encriptar contraseña
        const passwordHash = await bcrypt.hash(password, 10);

       // CONFIGURACIÓN DE RUTAS DE ARCHIVOS
// Cambiamos localhost por la URL real de Render
const baseUrl = "https://floresyrolados.onrender.com/uploads/";
        
        // Atrapamos los archivos que vienen de Multer
        const foto = req.files?.['foto']?.[0] ? `${baseUrl}${req.files['foto'][0].filename}` : null;
        const video = req.files?.['video']?.[0] ? `${baseUrl}${req.files['video'][0].filename}` : null;
        const curp_file = req.files?.['curp_file']?.[0] ? `${baseUrl}${req.files['curp_file'][0].filename}` : null;

        // 2. CREAMOS EL NUEVO USUARIO (Asegúrate que estos nombres existan en tu User.model.js)
        const newUser = new User({
            username: username || `${nombre} ${apellidos}`,
            email,
            password: passwordHash,
            nombre,
            apellidos,
            curp_text,
            direccion,
            colonia, // <-- Ahora sí se guarda
            edad,
            cp,
            estado,
            fotoUrl: foto,
            videoUrl: video,
            curpUrl: curp_file,
            role: 'client', 
            status: 'pending', 
        });

        // 3. GUARDAR EN MONGODB
        const userSaved = await newUser.save();
        
        // Crear token de sesión
        const token = await createAccessToken({ id: userSaved._id, role: userSaved.role });

        // Enviar cookie al navegador
        res.cookie("token", token, {
            sameSite: 'none',
            secure: true,
            httpOnly: false
        });

        // Responder al Frontend con éxito
        res.json({
            id: userSaved._id,
            username: userSaved.username,
            email: userSaved.email,
            role: userSaved.role,
        });

    } catch (error) {
        console.error("❌ ERROR CRÍTICO EN MONGODB:", error);
        res.status(500).json([`Error al guardar: ${error.message}`]);
    }
}

// --- EL RESTO DE TUS FUNCIONES (LOGIN, LOGOUT, ETC) ---

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userFound = await User.findOne({ email });
        if (!userFound) return res.status(400).json(["Email no encontrado"]);

        const isMatch = await bcrypt.compare(password, userFound.password);
        if (!isMatch) return res.status(400).json(["Contraseña Incorrecta"]);

        const token = await createAccessToken({ id: userFound._id, role: userFound.role });

        res.cookie("token", token, {
            sameSite: 'none',
            secure: true,
            httpOnly: false
        });

        res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            role: userFound.role,
            status: userFound.status 
        });
    } catch (error) {
        res.status(500).json([error.message]);
    }
}

export const logout = (req, res) => {
    res.cookie('token', "", { expires: new Date(0) });
    return res.sendStatus(200);
}

export const verifyToken = async (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: "No autorizado" });
    jwt.verify(token, TOKEN_SECRET, async (err, user) => {
        if (err) return res.status(401).json({ message: "Token inválido" });
        const userFound = await User.findById(user.id);
        if (!userFound) return res.status(401).json({ message: "Usuario no encontrado" });
        return res.json({ id: userFound._id, username: userFound.username, email: userFound.email, role: userFound.role, status: userFound.status });
    });
};

export const profile = async (req, res) => {
    try {
        const userFound = await User.findById(req.user.id).select('-password');
        return res.json(userFound);
    } catch (error) { return res.status(500).json({ message: error.message }); }
}

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) { res.status(500).json(["Error al obtener socios"]); }
}

export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        const userUpdated = await User.findByIdAndUpdate(id, { status }, { new: true });
        if (!userUpdated) return res.status(404).json(["Socio no encontrado"]);

        if (status === 'active') {
            const mailOptions = {
                from: '"CANNALAND CENTRAL" <fernandolalala9@gmail.com>',
                to: userUpdated.email,
                subject: '🚀 ¡CUENTA APROBADA! - Bienvenido a Cannaland',
                html: `
                    <div style="background-color: #000; color: #fff; padding: 30px; border-radius: 20px; font-family: sans-serif; border: 2px solid #16a34a; max-width: 500px; margin: auto;">
                        <h1 style="color: #16a34a; font-style: italic; text-align: center;">CANNALAND CENTRAL</h1>
                        <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;">
                        <p>¡Hola, <b>${userUpdated.username}</b>!</p>
                        <p>Tu identidad ha sido verificada con éxito.</p>
                        <p>Ya puedes acceder al catálogo y realizar pedidos.</p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:5173/login" style="background-color: #16a34a; color: #000; padding: 15px 30px; border-radius: 10px; font-weight: bold; text-decoration: none; display: inline-block;">INGRESAR AHORA</a>
                        </div>
                    </div>
                `
            };

            transporter.sendMail(mailOptions, (err) => {
                if (err) console.error("❌ Error enviando mail:", err.message);
            });
        }

        res.json(userUpdated);
    } catch (error) {
        res.status(500).json([error.message]);
    }
}