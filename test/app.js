const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app'); // ya no es necesario server.js

// Genera un token válido
const token = jwt.sign(
  { userId: 1, rol: 'admin' },
  process.env.JWT_SECRET || 'clave123',
  { expiresIn: '1h' }
);

describe('Rutas protegidas con JWT', () => {
  test('GET /productos debe responder con 200 y lista de productos', async () => {
    const res = await request(app)
      .get('/productos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  test('GET /productos sin token debe responder 401', async () => {
    const res = await request(app).get('/productos');
    expect(res.statusCode).toBe(401);
  });
});
