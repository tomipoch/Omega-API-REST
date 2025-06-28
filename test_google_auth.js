const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:4000';

// Token de ejemplo de Google (este sería generado por el frontend)
// En un caso real, este token vendría del frontend después de la autenticación con Google
const EJEMPLO_GOOGLE_TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjExIn0...'; // Token de ejemplo

async function probarAutenticacionGoogle() {
  console.log('🧪 Iniciando pruebas de autenticación con Google...\n');
  
  try {
    // Prueba 1: Registro/Login con Google
    console.log('📝 Prueba 1: Autenticación con Google');
    console.log('⚠️  NOTA: Esta prueba requiere un token real de Google');
    console.log('💡 Para obtener un token real:');
    console.log('   1. Implementa el frontend con Google Sign-In');
    console.log('   2. O usa la consola de Google Cloud para generar tokens de prueba');
    console.log('');
    
    // Esta llamada fallaría con un token de ejemplo, pero muestra la estructura
    try {
      const response = await axios.post(`${API_BASE_URL}/usuarios/auth/google`, {
        googleToken: EJEMPLO_GOOGLE_TOKEN
      });
      
      console.log('✅ Autenticación exitosa:');
      console.log('📄 Respuesta:', response.data);
      
      // Guardar el token JWT para pruebas adicionales
      const jwtToken = response.data.token;
      
      // Prueba 2: Obtener perfil con token JWT
      console.log('\n📝 Prueba 2: Obtener perfil de usuario');
      const perfilResponse = await axios.get(`${API_BASE_URL}/usuarios/perfil`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      
      console.log('✅ Perfil obtenido:');
      console.log('📄 Datos del usuario:', perfilResponse.data);
      
      // Prueba 3: Desvincular Google (opcional)
      console.log('\n📝 Prueba 3: Desvincular cuenta de Google');
      const desvincularResponse = await axios.delete(`${API_BASE_URL}/usuarios/auth/google/unlink`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      
      console.log('✅ Cuenta desvinculada:');
      console.log('📄 Respuesta:', desvincularResponse.data);
      
    } catch (authError) {
      if (authError.response) {
        console.log('❌ Error esperado (token de ejemplo inválido):');
        console.log('📄 Código:', authError.response.status);
        console.log('📄 Mensaje:', authError.response.data.message);
        console.log('📄 Error:', authError.response.data.error);
      } else {
        console.error('❌ Error de conexión:', authError.message);
      }
    }
    
    console.log('\n📋 Endpoints disponibles para Google OAuth:');
    console.log('   POST /usuarios/auth/google');
    console.log('     - Body: { "googleToken": "tu_token_de_google" }');
    console.log('     - Respuesta: { "token": "jwt_token", "nombre": "...", ... }');
    console.log('');
    console.log('   DELETE /usuarios/auth/google/unlink');
    console.log('     - Headers: { "Authorization": "Bearer jwt_token" }');
    console.log('     - Respuesta: { "message": "Cuenta desvinculada..." }');
    console.log('');
    
    console.log('📚 Documentación de integración:');
    console.log('   1. Frontend debe implementar Google Sign-In');
    console.log('   2. Enviar el ID token de Google al endpoint /usuarios/auth/google');
    console.log('   3. Recibir JWT token para autenticación en la aplicación');
    console.log('   4. Usar JWT token para acceder a endpoints protegidos');
    
  } catch (error) {
    console.error('❌ Error general en las pruebas:', error.message);
  }
}

// Función para probar la conexión básica
async function probarConexionServidor() {
  try {
    console.log('🔍 Verificando conexión con el servidor...');
    const response = await axios.get(`${API_BASE_URL}/ping`);
    console.log('✅ Servidor disponible:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Servidor no disponible:', error.message);
    console.log('💡 Asegúrate de que el servidor esté ejecutándose en puerto 4000');
    return false;
  }
}

// Ejecutar pruebas
async function ejecutarPruebas() {
  console.log('🚀 Iniciando pruebas de Google OAuth\n');
  
  const servidorDisponible = await probarConexionServidor();
  
  if (servidorDisponible) {
    await probarAutenticacionGoogle();
  }
  
  console.log('\n✨ Pruebas completadas');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  ejecutarPruebas().catch(console.error);
}

module.exports = {
  probarAutenticacionGoogle,
  probarConexionServidor
};
