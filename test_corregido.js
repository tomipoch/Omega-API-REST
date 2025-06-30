// Script de prueba para verificar que la eliminación de perfil funciona
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testEliminarPerfilCorregido() {
  try {
    console.log('=== PRUEBA DE ELIMINACIÓN DE PERFIL (CORREGIDO) ===\n');
    
    // 1. Registrar un usuario de prueba
    const testEmail = `test_corregido_${Date.now()}@example.com`;
    console.log('1. Registrando usuario de prueba...');
    
    const registerResponse = await axios.post(`${BASE_URL}/usuarios/register`, {
      nombre: 'Test',
      apellido_paterno: 'Usuario',
      apellido_materno: 'Corregido',
      correo_electronico: testEmail,
      contrasena: 'password123'
    });
    
    console.log('✅ Usuario registrado:', registerResponse.data.correo_electronico);
    
    // 2. Iniciar sesión para obtener el token
    console.log('\n2. Iniciando sesión...');
    const loginResponse = await axios.post(`${BASE_URL}/usuarios/login`, {
      correo_electronico: testEmail,
      contrasena: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Token obtenido');
    
    // 3. Eliminar el perfil usando la ruta corregida
    console.log('\n3. Eliminando perfil con ruta /usuarios/perfil...');
    const deleteResponse = await axios.delete(`${BASE_URL}/usuarios/perfil`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Respuesta de eliminación:', deleteResponse.data);
    console.log('✅ ÉXITO: El perfil fue eliminado correctamente');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('URL solicitada:', error.config?.url);
    console.error('Método:', error.config?.method);
  }
}

// Ejecutar la prueba
testEliminarPerfilCorregido().then(() => {
  console.log('\n=== FIN DE LA PRUEBA ===');
  process.exit(0);
}).catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
