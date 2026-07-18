const Disponibilidad = require('../models/disponibilidadModel');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');

const validarFechaFutura = (fecha) => {
  const fechaSeleccionada = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fechaSeleccionada < hoy) {
    throw new ValidationError('No se puede crear disponibilidad para fechas pasadas');
  }
};

exports.crear = async ({ fecha, hora_inicio, hora_fin, admin_id, notas }) => {
  if (!fecha || !hora_inicio || !hora_fin || !admin_id) {
    throw new ValidationError('Fecha, hora de inicio, hora de fin y admin son requeridos');
  }
  validarFechaFutura(fecha);
  if (hora_inicio >= hora_fin) {
    throw new ValidationError('La hora de inicio debe ser menor que la hora de fin');
  }

  try {
    return await Disponibilidad.crear({ fecha, hora_inicio, hora_fin, admin_id, notas });
  } catch (error) {
    if (error.code === '23505') {
      throw new ConflictError('Ya existe una disponibilidad para esa fecha y hora');
    }
    throw error;
  }
};

exports.obtenerTodas = async (filtros) => Disponibilidad.obtenerTodas(filtros);

exports.obtenerPorId = async (id) => {
  const disponibilidad = await Disponibilidad.obtenerPorId(id);
  if (!disponibilidad) throw new NotFoundError('Disponibilidad no encontrada');
  return disponibilidad;
};

exports.obtenerPorRango = async (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) {
    throw new ValidationError('fechaInicio y fechaFin son requeridos');
  }
  return Disponibilidad.obtenerPorRango(fechaInicio, fechaFin);
};

exports.obtenerPublicas = () => Disponibilidad.obtenerPublicas();

exports.obtenerPublicasConCita = () => Disponibilidad.obtenerPublicasConCita();

exports.actualizar = async (id, datos) => {
  await exports.obtenerPorId(id);
  const actualizada = await Disponibilidad.actualizar(id, datos);
  if (!actualizada) throw new NotFoundError('Disponibilidad no encontrada');
  return actualizada;
};

exports.eliminar = async (id) => {
  const eliminada = await Disponibilidad.eliminar(id);
  if (!eliminada) throw new NotFoundError('Disponibilidad no encontrada');
};
