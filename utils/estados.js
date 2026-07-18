const RESERVA = Object.freeze({
  ACTIVA: 'activa',
  CONFIRMADA: 'confirmada',
  CANCELADA: 'cancelada',
  EXPIRADA: 'expirada'
});

const TESTIMONIO = Object.freeze({
  PENDIENTE: 'Pendiente',
  APROBADO: 'Aprobado',
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Cancelado'
});

const DISPONIBILIDAD = Object.freeze({
  DISPONIBLE: 'disponible',
  OCUPADA: 'ocupada',
  CANCELADA: 'cancelada'
});

const PERSONALIZACION = Object.freeze({
  PENDIENTE: 'pendiente',
  ACEPTAR: 'aceptar',
  RECHAZAR: 'rechazar'
});

const CITAS_ESTADOS_NOMBRE = Object.freeze({
  PENDIENTE: 'pendiente',
  CONFIRMADA: 'confirmada',
  CANCELADA: 'cancelada',
  RECHAZADA: 'rechazada'
});

module.exports = {
  RESERVA,
  TESTIMONIO,
  DISPONIBILIDAD,
  PERSONALIZACION,
  CITAS_ESTADOS_NOMBRE
};
