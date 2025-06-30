// Script para probar las diferentes rutas de eliminación
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testEliminacionRutas() {
  try {
    console.log('=== PRUEBA DE RUTAS DE ELIMINACIÓN ===\n');
    
    // 1. Registrar un usuario de prueba
    const testEmail = `test_rutas_${Date.now()}@example.com`;
    console.log('1. Registrando usuario de prueba...');
    
    const registerResponse = await axios.post(`${BASE_URL}/usuarios/register`, {
      nombre: 'Test',
      apellido_paterno: 'Rutas',
      apellido_materno: 'Eliminacion',
      correo_electronico: testEmail,
      contrasena: 'password123'
    });
    
    const userId = registerResponse.data.usuario_id;
    console.log('✅ Usuario registrado con ID:', userId);
    
    // 2. Iniciar sesión para obtener el token
    console.log('\n2. Iniciando sesión...');
    const loginResponse = await axios.post(`${BASE_URL}/usuarios/login`, {
      correo_electronico: testEmail,
      contrasena: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtenido');
    
    // 3. Probar eliminación de perfil (ruta correcta)
    console.log('\n3. Probando eliminación de perfil (DELETE /usuarios/perfil)...');
    try {
      const deleteResponse = await axios.delete(`${BASE_URL}/usuarios/perfil`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Perfil eliminado exitosamente:', deleteResponse.data.message);
    } catch (error) {
      console.log('❌ Error al eliminar perfil:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

// Ejecutar la prueba
testEliminacionRutas().then(() => {
  console.log('\n=== FIN DE LA PRUEBA ===');
  process.exit(0);
}).catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
