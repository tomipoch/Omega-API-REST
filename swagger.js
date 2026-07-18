const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Omega Joyería API',
    version: '1.0.0',
    description:
      'API REST para la plataforma Omega Joyería. Autenticación JWT, gestión de usuarios, productos, reservas, citas, eventos, blog, testimonios y más.'
  },
  servers: [{ url: 'http://localhost:4000', description: 'Local' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          code: { type: 'string' },
          errors: { type: 'array', items: { type: 'object' } }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/ping': {
      get: {
        tags: ['Health'],
        summary: 'Liveness probe',
        security: [],
        responses: { 200: { description: 'pong' } }
      }
    },
    '/health/db': {
      get: {
        tags: ['Health'],
        summary: 'Database health check',
        security: [],
        responses: {
          200: { description: 'DB up' },
          503: { description: 'DB down' }
        }
      }
    },
    '/usuarios/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        security: [],
        responses: {
          201: { description: 'Created' },
          409: { description: 'Email already registered' },
          422: { description: 'Validation error' }
        }
      }
    },
    '/usuarios/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        security: [],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Invalid credentials' },
          422: { description: 'Validation error' }
        }
      }
    },
    '/usuarios/auth/google': {
      post: {
        tags: ['Auth'],
        summary: 'Login or register with Google OAuth',
        security: [],
        responses: { 200: { description: 'Existing user' }, 201: { description: 'New user' } }
      }
    },
    '/usuarios/perfil': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } }
      },
      put: {
        tags: ['Auth'],
        summary: 'Update current user profile',
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
          422: { description: 'Validation error' }
        }
      },
      delete: {
        tags: ['Auth'],
        summary: 'Delete current user account',
        responses: { 204: { description: 'Deleted' }, 401: { description: 'Unauthorized' } }
      }
    },
    '/productos': {
      get: {
        tags: ['Productos'],
        summary: 'List products (public)',
        security: [],
        responses: { 200: { description: 'OK' } }
      },
      post: {
        tags: ['Productos'],
        summary: 'Create product (admin only)',
        responses: {
          201: { description: 'Created' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          422: { description: 'Validation error' }
        }
      }
    },
    '/productos/{id}/stock': {
      get: {
        tags: ['Productos'],
        summary: 'Get product stock (public)',
        security: [],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } }
      }
    },
    '/productos/{id}/reservar': {
      post: {
        tags: ['Reservas'],
        summary: 'Reserve product (authenticated)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          201: { description: 'Reserved' },
          401: { description: 'Unauthorized' },
          409: { description: 'Already has active reservation' }
        }
      }
    },
    '/citas': {
      get: {
        tags: ['Citas'],
        summary: 'List current user appointments',
        responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } }
      },
      post: {
        tags: ['Citas'],
        summary: 'Create appointment',
        responses: { 201: { description: 'Created' }, 401: { description: 'Unauthorized' } }
      }
    },
    '/blog': {
      get: {
        tags: ['Blog'],
        summary: 'List blog publications',
        security: [],
        responses: { 200: { description: 'OK' } }
      }
    },
    '/faq': {
      get: {
        tags: ['FAQ'],
        summary: 'List FAQ entries',
        security: [],
        responses: { 200: { description: 'OK' } }
      }
    },
    '/eventos': {
      get: {
        tags: ['Eventos'],
        summary: 'List events',
        security: [],
        responses: { 200: { description: 'OK' } }
      }
    },
    '/testimonios': {
      get: {
        tags: ['Testimonios'],
        summary: 'List approved testimonials',
        security: [],
        responses: { 200: { description: 'OK' } }
      }
    },
    '/servicios': {
      get: {
        tags: ['Servicios'],
        summary: 'List services',
        responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } }
      }
    }
  }
};

module.exports = spec;