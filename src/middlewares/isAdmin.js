export const isAdmin = (req, res, next) => {
    // Si no hay usuario en la petición (porque el guardia anterior falló) 
    // o si el rol no es admin, lo sacamos.
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
            message: "Acceso denegado: Se requieren permisos de administrador" 
        });
    }
    next(); // Si todo está bien, lo dejamos pasar a la base de datos
};