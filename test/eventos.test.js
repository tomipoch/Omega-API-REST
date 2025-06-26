const eventosModel = require('../models/eventosModel');
const pool = require('../db');

describe('Modelo de Eventos', () => {
  let eventoCreado;
  let eventoId;
  const eventoData = {
    nombre: 'Charla de Tecnología',
    descripcion: 'Evento sobre nuevas tecnologías 2025',
    fecha_inicio: '2025-07-01',
    fecha_fin: '2025-07-02',
    ubicacion: 'Santiago, Chile',
    capacidad: 100
  };

  beforeAll(async () => {
    // Conexión a la base de datos
    await pool.query('BEGIN'); // Inicia transacción
  });

  afterAll(async () => {
    await pool.query('ROLLBACK'); // Reversión de cambios al final del test
    await pool.end(); // Cierra conexión
  });

  test('Debe crear un nuevo evento', async () => {
    eventoCreado = await eventosModel.crearEvento(
      eventoData.nombre,
      eventoData.descripcion,
      eventoData.fecha_inicio,
      eventoData.fecha_fin,
      eventoData.ubicacion,
      eventoData.capacidad
    );
    eventoId = eventoCreado.evento_id;
    expect(eventoCreado).toHaveProperty('evento_id');
    expect(eventoCreado.nombre).toBe(eventoData.nombre);
  });

  test('Debe obtener un evento por ID', async () => {
    const evento = await eventosModel.obtenerEventoPorId(eventoId);
    expect(evento).not.toBeNull();
    expect(evento.evento_id).toBe(eventoId);
  });

  test('Debe actualizar un evento', async () => {
    const actualizado = await eventosModel.actualizarEvento(
      eventoId,
      'Evento Actualizado',
      eventoData.descripcion,
      eventoData.fecha_inicio,
      eventoData.fecha_fin,
      eventoData.ubicacion,
      200
    );
    expect(actualizado.nombre).toBe('Evento Actualizado');
    expect(Number(actualizado.capacidad)).toBe(200);

  });

  test('Debe obtener todos los eventos', async () => {
    const eventos = await eventosModel.obtenerEventos();
    expect(Array.isArray(eventos)).toBe(true);
  });

  test('Debe eliminar un evento', async () => {
    const eliminado = await eventosModel.eliminarEvento(eventoId);
    expect(eliminado.evento_id).toBe(eventoId);
  });
});
