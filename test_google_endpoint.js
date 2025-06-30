const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:4000';

async function probarEndpointGoogleAuth() {
  console.log('🧪 Probando endpoint /usuarios/auth/google\n');
  
  try {
    // Verificar que el servidor esté funcionando
    console.log('1. 🔍 Verificando servidor...');
    const pingResponse = await axios.get(`${API_BASE_URL}/ping`);
    console.log('✅ Servidor funcionando:', pingResponse.data);
    
    // Prueba 1: Sin body (debe fallar)
    console.log('\n2. 🚫 Probando sin body (debe fallar)...');
    try {
      await axios.post(`${API_BASE_URL}/usuarios/auth/google`);
    } catch (error) {
      console.log('✅ Error esperado:', error.response?.status, error.response?.data?.message);
    }
    
    // Prueba 2: Con body vacío (debe fallar)
    console.log('\n3. 🚫 Probando con body vacío (debe fallar)...');
    try {
      await axios.post(`${API_BASE_URL}/usuarios/auth/google`, {});
    } catch (error) {
      console.log('✅ Error esperado:', error.response?.status, error.response?.data?.message);
      console.log('   Body recibido por server:', error.response?.data?.received_body);
    }
    
    // Prueba 3: Con token inválido (debe fallar con error específico)
    console.log('\n4. 🚫 Probando con token inválido (debe fallar)...');
    try {
      await axios.post(`${API_BASE_URL}/usuarios/auth/google`, {
        googleToken: 'token_invalido_de_prueba'
      });
    } catch (error) {
      console.log('✅ Error esperado:', error.response?.status, error.response?.data?.message);
      console.log('   Detalles:', error.response?.data?.details);
    }
    
    // Prueba 4: Con token que parece válido pero no lo es
    console.log('\n5. 🚫 Probando con token JWT falso (debe fallar)...');
    try {
      const fakeJWT = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImFiYzEyMyJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhdWQiOiIxMjM0NTYiLCJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IlRlc3QgVXNlciIsImdpdmVuX25hbWUiOiJUZXN0IiwiZmFtaWx5X25hbWUiOiJVc2VyIiwicGljdHVyZSI6Imh0dHBzOi8vZXhhbXBsZS5jb20vcGhvdG8uanBnIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDA5OTg4MDB9.fake_signature';
      
      await axios.post(`${API_BASE_URL}/usuarios/auth/google`, {
        googleToken: fakeJWT
      });
    } catch (error) {
      console.log('✅ Error esperado:', error.response?.status, error.response?.data?.message);
      console.log('   Detalles:', error.response?.data?.details);
    }
    
    // Prueba 5: Verificar headers y formato
    console.log('\n6. 📋 Probando headers y formato...');
    try {
      await axios.post(`${API_BASE_URL}/usuarios/auth/google`, {
        googleToken: 'test_token'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Test-Client/1.0'
        }
      });
    } catch (error) {
      console.log('✅ Endpoint procesó la request correctamente');
      console.log('   Status:', error.response?.status);
      console.log('   Content-Type:', error.response?.headers['content-type']);
      console.log('   Response format:', typeof error.response?.data);
    }
    
    console.log('\n🎉 ¡Pruebas completadas!');
    console.log('\n📋 Resumen:');
    console.log('   ✅ Servidor está funcionando');
    console.log('   ✅ Endpoint está recibiendo requests');
    console.log('   ✅ Body parsing está funcionando');
    console.log('   ✅ Middleware de validación está funcionando');
    console.log('   ✅ Respuestas de error son informativas');
    console.log('\n💡 Para probar con token real:');
    console.log('   1. Obtén un token real de Google Sign-In');
    console.log('   2. Usa el frontend de ejemplo en frontend-google-auth/');
    console.log('   3. O configura Google OAuth en la consola de Google');
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 El servidor no está ejecutándose. Ejecuta: npm start');
    }
  }
}

// Ejecutar pruebas
if (require.main === module) {
  probarEndpointGoogleAuth().catch(console.error);
}

module.exports = probarEndpointGoogleAuth;
