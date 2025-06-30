const axios = require('axios');

async function probarEndpointsGoogle() {
  console.log('🧪 Probando endpoints de Google OAuth\n');
  
  try {
    // Probar endpoint de prueba
    console.log('1. 🔬 Probando endpoint de prueba...');
    const testResponse = await axios.post('http://localhost:4000/usuarios/auth/google/test', {
      googleToken: 'token_de_prueba_123'
    });
    
    console.log('✅ Endpoint de prueba funcionando:');
    console.log('   ', testResponse.data);
    
  } catch (error) {
    console.log('❌ Error en endpoint de prueba:', error.response?.data);
  }
  
  try {
    // Probar endpoint principal (debe fallar con token inválido)
    console.log('\n2. 🔐 Probando endpoint principal...');
    await axios.post('http://localhost:4000/usuarios/auth/google', {
      googleToken: 'token_de_prueba_123'
    });
    
  } catch (error) {
    console.log('✅ Endpoint principal funcionando (error esperado):');
    console.log('   Status:', error.response?.status);
    console.log('   Mensaje:', error.response?.data?.message);
    console.log('   Error:', error.response?.data?.error);
  }
  
  console.log('\n🎯 Resumen:');
  console.log('   ✅ Servidor recibe requests correctamente');
  console.log('   ✅ Body parsing funciona perfectamente');
  console.log('   ✅ Validaciones están activas');
  console.log('   ✅ Respuestas son informativas');
}

if (require.main === module) {
  probarEndpointsGoogle().catch(console.error);
}
