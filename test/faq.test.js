const pool = require('../database/pgPool');
const faqModel = require('../models/faqModel');

describe('Modelo de FAQ (faq_id)', () => {
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

  test('Crear pregunta devuelve faq_id', async () => {
    if (!dbUp) return;
    const created = await faqModel.crearPregunta('¿Pregunta?', 'Sí.');
    expect(created.faq_id).toBeDefined();
    expect(typeof created.faq_id).toBe('number');
  });

  test('Obtener todas devuelve array', async () => {
    if (!dbUp) return;
    const list = await faqModel.obtenerPreguntas();
    expect(Array.isArray(list)).toBe(true);
  });

  test('Actualizar pregunta por faq_id', async () => {
    if (!dbUp) return;
    const created = await faqModel.crearPregunta('Original', 'R1');
    const updated = await faqModel.actualizarPregunta(created.faq_id, 'Actualizada', 'R2');
    expect(updated.pregunta).toBe('Actualizada');
    expect(updated.respuesta).toBe('R2');
  });

  test('Eliminar pregunta por faq_id', async () => {
    if (!dbUp) return;
    const created = await faqModel.crearPregunta('Eliminar', 'X');
    const deleted = await faqModel.eliminarPregunta(created.faq_id);
    expect(deleted.faq_id).toBe(created.faq_id);
  });
});
