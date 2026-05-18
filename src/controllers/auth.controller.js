import User from "../models/user.model.js"; // Asegúrate que la ruta a tu modelo sea correcta
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js"; // Donde tengas tu clave secreta

export const verifyToken = async (req, res) => {
  const { token } = req.cookies;
  
  // Si no hay token en las cookies, rechazamos de inmediato
  if (!token) return res.status(401).json({ message: "No autorizado" });

  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: "Token inválido" });

    const userFound = await User.findById(user.id);
    if (!userFound) return res.status(401).json({ message: "Usuario no encontrado" });

    // Si todo está bien, mandamos los datos del usuario al frontend
    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      role: userFound.role // Importante para la protección de Admin después
    });
  });
};