const citasModel = require('../models/citasModel');

// Crear una nueva cita con disponibilidad
exports.crearCita = async (req, res, next) => {
  const { disponibilidad_id, servicio_id, notas } = req.body;
  
  try {
    // Validaciones
    if (!disponibilidad_id || !servicio_id) {
      return res.status(400).json({ 
        success: false,
        message: 'Disponibilidad y servicio son requeridos' 
      });
    }

    const cita = await citasModel.crearCita(req.userId, disponibilidad_id, servicio_id, notas);
    
    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente',
      data: cita
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener todas las citas del usuario
exports.obtenerCitas = async (req, res, next) => {
  try {
    const citas = await citasModel.obtenerCitas(req.userId);
    res.json({
      success: true,
      data: citas
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todas las citas (solo admin)
exports.obtenerTodasLasCitas = async (req, res, next) => {
  try {
    const citas = await citasModel.obtenerTodasLasCitas();
    res.json({
      success: true,
      data: citas
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar una cita
exports.actualizarCita = async (req, res, next) => {
  const { disponibilidad_id, servicio_id, notas } = req.body;
  const { id } = req.params;

  try {
    if (!servicio_id) {
      return res.status(400).json({ 
        success: false,
        message: 'El servicio es requerido' 
      });
    }

    const cita = await citasModel.actualizarCita(req.userId, id, disponibilidad_id, servicio_id, notas);
    
    if (!cita) {
      return res.status(404).json({ 
        success: false,
        message: 'Cita no encontrada o no tienes permiso para actualizarla.' 
      });
    }
    
    res.json({
      success: true,
      message: 'Cita actualizada exitosamente',
      data: cita
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// Eliminar una cita
exports.eliminarCita = async (req, res, next) => {
  const { id } = req.params;
  try {
    const resultado = await citasModel.eliminarCita(req.userId, id);
    if (!resultado) {
      return res.status(404).json({ 
        success: false,
        message: 'Cita no encontrada o no tienes permiso para eliminarla.' 
      });
    }
    res.json({ 
      success: true,
      message: 'Cita eliminada con éxito.',
      data: resultado
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Eliminar una cita como administrador
exports.eliminarCitaAdmin = async (req, res, next) => {
  const { id } = req.params;
  try {
    const resultado = await citasModel.eliminarCitaAdmin(id);
    if (!resultado) {
      return res.status(404).json({ 
        success: false,
        message: 'Cita no encontrada.' 
      });
    }
    res.json({ 
      success: true,
      message: 'Cita eliminada con éxito por el administrador.',
      data: resultado
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener fechas ocupadas (para el calendario)
exports.obtenerFechasOcupadas = async (req, res, next) => {
  try {
    const fechasOcupadas = await citasModel.obtenerFechasOcupadas();
    res.json(fechasOcupadas);
  } catch (error) {
    next(error);
  }
};

// Obtener TODAS las citas (para el admin)
exports.obtenerTodasLasCitas = async (req, res, next) => {
  try {
    const citas = await citasModel.obtenerTodasLasCitas();
    res.json(citas);
  } catch (error) {
    next(error);
  }
};



// ===============================
// CONTROLADORES PARA ADMINISTRADORES
// ===============================

// Crear una cita como administrador (para cualquier usuario)
exports.crearCitaAdmin = async (req, res, next) => {
  const { usuario_id, disponibilidad_id, servicio_id, notas } = req.body;

  try {
    // Validar campos requeridos
    if (!usuario_id || !disponibilidad_id || !servicio_id) {
      return res.status(400).json({ 
        success: false,
        message: 'Los campos usuario_id, disponibilidad_id y servicio_id son requeridos' 
      });
    }

    const cita = await citasModel.crearCitaAdmin(usuario_id, disponibilidad_id, servicio_id, notas);
    
    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente por el administrador',
      data: cita
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Actualizar una cita como administrador
exports.actualizarCitaAdmin = async (req, res, next) => {
  const { disponibilidad_id, servicio_id, notas, usuario_id } = req.body;
  const { id } = req.params;

  try {
    if (!servicio_id) {
      return res.status(400).json({ 
        success: false,
        message: 'El servicio es requerido' 
      });
    }

    const cita = await citasModel.actualizarCitaAdmin(id, disponibilidad_id, servicio_id, notas, usuario_id);
    
    if (!cita) {
      return res.status(404).json({ 
        success: false,
        message: 'Cita no encontrada.' 
      });
    }
    
    res.json({
      success: true,
      message: 'Cita actualizada exitosamente por el administrador',
      data: cita
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
