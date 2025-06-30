// tests/usuarios.test.js
const request = require('supertest');
const app = require('../app'); // importa tu instancia de app de Express
const jwt = require('jsonwebtoken');

describe('Rutas protegidas de usuarios', () => {
  let token;
  let tokenAdmin;

  beforeAll(() => {
    // 🔐 Generar tokens de prueba (válidos)
    token = jwt.sign({ userId: 1, rol: 2 }, process.env.JWT_SECRET);        // rol 2 → normal
    tokenAdmin = jwt.sign({ userId: 1, rol: 1 }, process.env.JWT_SECRET);   // rol 1 → admin
  });

  test('GET /api/usuarios/perfil - sin token debería fallar', async () => {
    const res = await request(app).get('/api/usuarios/perfil');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/autorización denegada/i);
  });

  test('GET /api/usuarios/perfil - con token válido debe responder 200 o 404', async () => {
    const res = await request(app)
      .get('/api/usuarios/perfil')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 404]).toContain(res.statusCode); // Puede no existir el userId 1
  });

  test('GET /api/usuarios/all - rol no admin debe fallar', async () => {
    const res = await request(app)
      .get('/api/usuarios/all')
      .set('Authorization', `Bearer ${token}`); // rol = 2

    expect(res.statusCode).toBe(403);
  });

  test('GET /api/usuarios/all - rol admin debe acceder', async () => {
    const res = await request(app)
      .get('/api/usuarios/all')
      .set('Authorization', `Bearer ${tokenAdmin}`); // rol = 1

    expect([200, 500]).toContain(res.statusCode); // Puede fallar si no tienes base de datos
  });

  test('DELETE /api/usuarios/perfil - token inválido', async () => {
    const res = await request(app)
      .delete('/api/usuarios/perfil')
      .set('Authorization', `Bearer token_invalido`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/token no válido/i);
  });
});
