export const validateSchema = (schema) => (req, res, next) => {
  try {
    // 1. Intentamos validar los datos del cuerpo de la petición
    schema.parse(req.body);
    
    // 2. Si la validación es exitosa, continuamos al siguiente controlador
    next();
  } catch (error) {
    // 3. Verificamos si el error proviene de Zod (tiene la propiedad .errors)
    if (error.errors && Array.isArray(error.errors)) {
      // Mapeamos los errores para enviar solo los mensajes legibles al frontend
      return res.status(400).json(
        error.errors.map((err) => err.message)
      );
    }

    // 4. Si es un error de otro tipo, enviamos el mensaje general en un arreglo
    // Esto evita que el servidor se caiga con el error "Cannot read properties of undefined (reading 'map')"
    return res.status(400).json([error.message || "Error de validación desconocido"]);
  }
};