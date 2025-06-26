// Script de prueba completo para eliminar perfil
const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testEliminarPerfil() {
  try {
    console.log('=== PRUEBA COMPLETA DE ELIMINACIÓN DE PERFIL ===\n');
    
    // 1. Registrar un usuario de prueba
    const testEmail = `test_${Date.now()}@example.com`;
    console.log('1. Registrando usuario de prueba...');
    
    const registerResponse = await axios.post(`${BASE_URL}/usuarios/register`, {
      nombre: 'Test',
      apellido_paterno: 'Usuario',
      apellido_materno: 'Eliminacion',
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
    console.log('✅ Token obtenido:', token ? 'Sí' : 'No');
    
    // 3. Verificar el perfil antes de eliminar
    console.log('\n3. Verificando perfil...');
    const perfilResponse = await axios.get(`${BASE_URL}/usuarios/perfil`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Perfil encontrado:', perfilResponse.data.correo_electronico);
    
    // 4. Eliminar el perfil
    console.log('\n4. Eliminando perfil...');
    const deleteResponse = await axios.delete(`${BASE_URL}/usuarios/perfil`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Respuesta de eliminación:', deleteResponse.data);
    
    // 5. Verificar que el perfil fue eliminado
    console.log('\n5. Verificando que el perfil fue eliminado...');
    try {
      await axios.get(`${BASE_URL}/usuarios/perfil`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('❌ ERROR: El perfil aún existe después de la eliminación');
    } catch (error) {
      if (error.response && (error.response.status === 401 || error.response.status === 404)) {
        console.log('✅ ÉXITO: El perfil fue eliminado correctamente');
      } else {
        console.log('❌ Error inesperado:', error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    // Mostrar detalles del error
    if (error.response?.data) {
      console.error('Detalles del error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Ejecutar la prueba
testEliminarPerfil().then(() => {
  console.log('\n=== FIN DE LA PRUEBA ===');
  process.exit(0);
}).catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
