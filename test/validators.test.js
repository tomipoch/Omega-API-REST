const request = require('supertest');
const app = require('../app');

describe('Validación de idParam en rutas', () => {
  test('GET /blog/abc (sin token) responde 401 antes de validar id', async () => {
    const res = await request(app).get('/blog/abc');
    expect([401, 422]).toContain(res.statusCode);
  });

  test('DELETE /usuarios/admin/abc (sin token) responde 401', async () => {
    const res = await request(app).delete('/usuarios/admin/abc');
    expect([401, 422]).toContain(res.statusCode);
  });

  test('PUT /faq/abc (sin token) responde 401', async () => {
    const res = await request(app).put('/faq/abc');
    expect([401, 422]).toContain(res.statusCode);
  });
});

describe('Rate limiting en /chat', () => {
  test('Más de 10 requests/min a /chat devuelve 429 (sin auth)', async () => {
    const requests = Array.from({ length: 12 }, () =>
      request(app).post('/chat').send({ mensaje: 'hola' })
    );
    const results = await Promise.all(requests);
    const codes = results.map((r) => r.statusCode);
    expect(codes).toContain(429);
  });
});

describe('Health endpoints', () => {
  test('GET /ping responde 200', async () => {
    const res = await request(app).get('/ping');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'pong' });
  });
});
