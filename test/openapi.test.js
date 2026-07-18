const swaggerSpec = require('../swagger');

describe('OpenAPI spec', () => {
  test('should be parseable and contain basic metadata', () => {
    expect(swaggerSpec.openapi).toBe('3.0.3');
    expect(swaggerSpec.info.title).toBe('Omega Joyería API');
    expect(swaggerSpec.info.version).toBeDefined();
  });

  test('should expose security schemes', () => {
    expect(swaggerSpec.components.securitySchemes.bearerAuth).toBeDefined();
    expect(swaggerSpec.components.securitySchemes.bearerAuth.scheme).toBe('bearer');
  });

  test('should contain core paths', () => {
    const paths = Object.keys(swaggerSpec.paths || {});
    expect(paths).toContain('/usuarios/login');
    expect(paths).toContain('/usuarios/register');
    expect(paths).toContain('/productos');
    expect(paths).toContain('/citas');
    expect(paths).toContain('/blog');
    expect(paths).toContain('/faq');
    expect(paths).toContain('/eventos');
    expect(paths).toContain('/testimonios');
    expect(paths).toContain('/servicios');
  });
});
