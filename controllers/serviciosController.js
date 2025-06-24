const serviciosModel = require('../models/serviciosModel');

// Obtener todos los servicios
exports.obtenerServicios = async (req, res, next) => {
  try {
    const servicios = await serviciosModel.obtenerServicios();
    res.status(200).json(servicios);
  } catch (error) {
    console.error('Error al obtener los servicios:', error);
    next(error);
  }
};

// Crear un nuevo servicio (solo admin)
exports.crearServicio = async (req, res, next) => {
  try {
    console.log('Datos recibidos para crear servicio:', req.body);
    
    const { nombre_servicio, descripcion, precio, duracion_estimada } = req.body;

    // Validaciones básicas
    if (!nombre_servicio || typeof nombre_servicio !== 'string' || !nombre_servicio.trim()) {
      return res.status(400).json({ message: 'El nombre del servicio es obligatorio' });
    }

    if (!descripcion || typeof descripcion !== 'string' || !descripcion.trim()) {
      return res.status(400).json({ message: 'La descripción es obligatoria' });
    }

    if (precio === undefined || precio === null || precio === '') {
      return res.status(400).json({ message: 'El precio es obligatorio' });
    }

    const precioNum = Number(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      return res.status(400).json({ message: 'El precio debe ser un número mayor a 0' });
    }

    let duracionNum = null;
    if (duracion_estimada !== null && duracion_estimada !== undefined && duracion_estimada !== '') {
      duracionNum = Number(duracion_estimada);
      if (isNaN(duracionNum) || duracionNum <= 0) {
        return res.status(400).json({ message: 'La duración debe ser un número mayor a 0' });
      }
    }

    const servicioData = {
      nombre_servicio: nombre_servicio.trim(),
      descripcion: descripcion.trim(),
      precio: precioNum,
      duracion_estimada: duracionNum
    };

    console.log('Datos procesados para guardar:', servicioData);

    const nuevoServicio = await serviciosModel.crearServicio(servicioData);
    res.status(201).json({
      message: 'Servicio creado exitosamente',
      servicio: nuevoServicio
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ message: 'Error interno del servidor: ' + error.message });
  }
};

// Actualizar un servicio (solo admin)
exports.actualizarServicio = async (req, res, next) => {
  try {
    console.log('Datos recibidos para actualizar servicio:', req.body);
    console.log('ID del servicio:', req.params.id);
    
    const { id } = req.params;
    const { nombre_servicio, descripcion, precio, duracion_estimada } = req.body;

    // Validaciones básicas
    if (!nombre_servicio || typeof nombre_servicio !== 'string' || !nombre_servicio.trim()) {
      return res.status(400).json({ message: 'El nombre del servicio es obligatorio' });
    }

    if (!descripcion || typeof descripcion !== 'string' || !descripcion.trim()) {
      return res.status(400).json({ message: 'La descripción es obligatoria' });
    }

    if (precio === undefined || precio === null || precio === '') {
      return res.status(400).json({ message: 'El precio es obligatorio' });
    }

    const precioNum = Number(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
      return res.status(400).json({ message: 'El precio debe ser un número mayor a 0' });
    }

    let duracionNum = null;
    if (duracion_estimada !== null && duracion_estimada !== undefined && duracion_estimada !== '') {
      duracionNum = Number(duracion_estimada);
      if (isNaN(duracionNum) || duracionNum <= 0) {
        return res.status(400).json({ message: 'La duración debe ser un número mayor a 0' });
      }
    }

    const servicioData = {
      nombre_servicio: nombre_servicio.trim(),
      descripcion: descripcion.trim(),
      precio: precioNum,
      duracion_estimada: duracionNum
    };

    console.log('Datos procesados para actualizar:', servicioData);

    const servicioActualizado = await serviciosModel.actualizarServicio(id, servicioData);
    
    if (!servicioActualizado) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    res.status(200).json({
      message: 'Servicio actualizado exitosamente',
      servicio: servicioActualizado
    });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({ message: 'Error interno del servidor: ' + error.message });
  }
};

// Eliminar un servicio (solo admin)
exports.eliminarServicio = async (req, res, next) => {
  try {
    const { id } = req.params;

    const servicioEliminado = await serviciosModel.eliminarServicio(id);
    
    if (!servicioEliminado) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    res.status(200).json({
      message: 'Servicio eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    next(error);
  }
};
