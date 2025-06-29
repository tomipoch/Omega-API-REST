const request = require('supertest');
const app = require('../app');

describe('Pruebas completas de usuarios protegidos', () => {
  let tokenAdmin;

  beforeAll(async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        correo: 'juanmaestro@example.com', // Asegúrate de tener este usuario
        contrasena: '12345678'
      });
      console.log('LOGIN RESPONSE:', res.body);
    tokenAdmin = res.body.token;
  });

  test('GET /usuarios/all debe funcionar con token válido', async () => {
    const res = await request(app)
      .get('/usuarios/all')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('PUT /usuarios/:id/role actualiza el rol del usuario', async () => {
    const res = await request(app)
      .put('/usuarios/4/role')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nuevoRol: 'cliente' });

    expect(res.statusCode).toBe(200);
    expect(res.body.mensaje).toMatch(/rol/i); // depende de tu respuesta
  });
});
