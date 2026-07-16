const request = require('supertest');
const app = require('../app');

describe('Rutas protegidas con JWT', () => {
  test('GET /productos debe ser público (no 401)', async () => {
    const res = await request(app).get('/productos');
    expect(res.statusCode).not.toBe(401);
  });

  test('GET /productos/:id/stock debe ser público', async () => {
    const res = await request(app).get('/productos/1/stock');
    expect(res.statusCode).not.toBe(401);
  });

  test('GET /faq debe ser público', async () => {
    const res = await request(app).get('/faq');
    expect(res.statusCode).not.toBe(401);
  });

  test('GET /citas sin token debe responder 401', async () => {
    const res = await request(app).get('/citas');
    expect(res.statusCode).toBe(401);
  });

  test('GET /blog sin token debe responder 401', async () => {
    const res = await request(app).get('/blog');
    expect(res.statusCode).toBe(401);
  });

  test('POST /usuarios/login con datos inválidos debe responder 422', async () => {
    const res = await request(app)
      .post('/usuarios/login')
      .send({ correo_electronico: 'no-es-email', contrasena: '' });
    expect(res.statusCode).toBe(422);
  });

  test('POST /usuarios/register con datos inválidos debe responder 422', async () => {
    const res = await request(app)
      .post('/usuarios/register')
      .send({ correo_electronico: 'no-es-email' });
    expect(res.statusCode).toBe(422);
  });

  test('GET /ping debe responder 200', async () => {
    const res = await request(app).get('/ping');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'pong' });
  });
});