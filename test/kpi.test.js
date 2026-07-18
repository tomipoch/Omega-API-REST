const pool = require('../database/pgPool');
const kpiModel = require('../models/kpiModel');

describe('Modelo de KPIs', () => {
  let dbUp = false;

  beforeAll(async () => {
    dbUp = await global.checkDb();
    if (!dbUp) return;
    await pool.query('BEGIN');
    await pool.query(
      `INSERT INTO servicios (nombre_servicio, descripcion, precio) VALUES ('S', 'D', 100)`
    );
  });

  afterAll(async () => {
    if (!dbUp) return;
    await pool.query('ROLLBACK');
    await pool.end();
  });

  test('Conteo total de servicios >= 1', async () => {
    if (!dbUp) return;
    const total = await kpiModel.totalServicios();
    expect(total).toBeGreaterThanOrEqual(1);
  });

  test('Resumen devuelve forma esperada', async () => {
    if (!dbUp) return;
    const resumen = await kpiModel.getResumen();
    expect(resumen).toHaveProperty('total_usuarios');
    expect(resumen).toHaveProperty('total_servicios');
    expect(resumen).toHaveProperty('citas_agendadas');
    expect(resumen).toHaveProperty('fecha');
  });
});
