const pool = require('../database/pgPool');
const eventosModel = require('../models/eventosModel');

describe('Modelo de Eventos', () => {
  let eventoCreado;
  let eventoId;
  let dbUp = false;

  beforeAll(async () => {
    dbUp = await global.checkDb();
    if (!dbUp) return;
    await pool.query('BEGIN');
  });

  afterAll(async () => {
    if (!dbUp) return;
    await pool.query('ROLLBACK');
    await pool.end();
  });

  test('Debe crear un nuevo evento', async () => {
    if (!dbUp) return;
    eventoCreado = await eventosModel.crearEvento(
      'Charla de Tecnología',
      'Evento sobre nuevas tecnologías 2025',
      '2025-07-01',
      '2025-07-02',
      'Santiago, Chile',
      100
    );
    eventoId = eventoCreado.evento_id;
    expect(eventoCreado).toHaveProperty('evento_id');
    expect(eventoCreado.nombre).toBe('Charla de Tecnología');
  });

  test('Debe obtener un evento por ID', async () => {
    if (!dbUp) return;
    const evento = await eventosModel.obtenerEventoPorId(eventoId);
    expect(evento).not.toBeNull();
    expect(evento.evento_id).toBe(eventoId);
  });

  test('Debe actualizar un evento', async () => {
    if (!dbUp) return;
    const actualizado = await eventosModel.actualizarEvento(
      eventoId,
      'Evento Actualizado',
      'Evento sobre nuevas tecnologías 2025',
      '2025-07-01',
      '2025-07-02',
      'Santiago, Chile',
      200
    );
    expect(actualizado.nombre).toBe('Evento Actualizado');
    expect(actualizado.capacidad).toBe(200);
  });

  test('Debe obtener todos los eventos', async () => {
    if (!dbUp) return;
    const eventos = await eventosModel.obtenerEventos();
    expect(Array.isArray(eventos)).toBe(true);
  });

  test('Debe eliminar un evento', async () => {
    if (!dbUp) return;
    const eliminado = await eventosModel.eliminarEvento(eventoId);
    expect(eliminado.evento_id).toBe(eventoId);
  });

  test('ON CONFLICT: doble inscripción devuelve solo una fila', async () => {
    if (!dbUp) return;
    const ev = await eventosModel.crearEvento('Test ON CONFLICT', '', '2025-12-01', '2025-12-01', '', 50);
    const u = await pool.query(
      `INSERT INTO usuarios (nombre, correo_electronico, rol_id)
       VALUES ('TestUser', 'onconflict@test.com', 1) RETURNING usuario_id`
    );
    const usuarioId = u.rows[0].usuario_id;

    const r1 = await eventosModel.inscribirEvento(usuarioId, ev.evento_id);
    const r2 = await eventosModel.inscribirEvento(usuarioId, ev.evento_id);
    expect(r1).toBeDefined();
    expect(r1.inscripcion_id).toBeDefined();
    expect(r2).toBeUndefined();
  });
});
