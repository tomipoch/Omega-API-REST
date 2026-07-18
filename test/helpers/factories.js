let counter = 0;
const unique = (prefix = 'test') => `${prefix}_${Date.now()}_${counter++}`;

exports.factories = {
  usuario: (overrides = {}) => ({
    nombre: 'Test',
    apellido_paterno: 'User',
    apellido_materno: 'Tester',
    correo_electronico: `${unique('user')}@test.com`,
    contrasena: 'hashedpassword',
    rol_id: 1,
    foto_perfil_url: null,
    ...overrides
  }),

  evento: (overrides = {}) => ({
    nombre: `Evento ${unique('ev')}`,
    descripcion: 'Descripción',
    fecha_inicio: '2025-12-01',
    fecha_fin: '2025-12-02',
    ubicacion: 'Santiago',
    capacidad: 100,
    ...overrides
  }),

  servicio: (overrides = {}) => ({
    nombre_servicio: `Servicio ${unique('svc')}`,
    descripcion: 'Descripción',
    precio: 99.99,
    ...overrides
  }),

  producto: (overrides = {}) => ({
    nombre_producto: `Producto ${unique('p')}`,
    descripcion_producto: 'Descripción',
    precio_producto: 199.99,
    stock: 10,
    imagen_producto: null,
    ...overrides
  }),

  faq: (overrides = {}) => ({
    pregunta: `Pregunta ${unique('q')}`,
    respuesta: 'Respuesta',
    ...overrides
  }),

  testimonio: (overrides = {}) => ({
    contenido: 'Excelente servicio',
    estrellas: 5,
    ...overrides
  })
};
