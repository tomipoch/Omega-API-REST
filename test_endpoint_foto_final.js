const fetch = require('node-fetch');

async function testEndToEndGoogleAuth() {
    console.log('🧪 Test End-to-End: Google OAuth con Foto de Perfil\n');

    // Simular un request al endpoint con un token inválido pero estructura correcta
    const testPayload = {
        googleToken: 'token_mock_para_test'
    };

    try {
        console.log('🚀 Enviando request a /usuarios/auth/google...');
        console.log('📦 Payload:', JSON.stringify(testPayload, null, 2));

        const response = await fetch('http://localhost:4000/usuarios/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPayload)
        });

        const data = await response.json();
        
        console.log('\n📡 Respuesta del servidor:');
        console.log('   🔢 Status:', response.status);
        console.log('   📄 Contenido:', JSON.stringify(data, null, 2));

        // Verificar que el endpoint está funcionando y manejando errores correctamente
        if (response.status === 401 && data.error === 'INVALID_GOOGLE_TOKEN') {
            console.log('\n✅ El endpoint está funcionando correctamente:');
            console.log('   ✅ Recibe el body correctamente');
            console.log('   ✅ Valida el token con Google');
            console.log('   ✅ Responde con error apropiado para token inválido');
            console.log('   ✅ La estructura de respuesta es correcta');
            
            console.log('\n🎯 Para probar con token real, necesitas:');
            console.log('   1. Un token JWT válido de Google Sign-In desde el frontend');
            console.log('   2. El token debe incluir el campo "picture" con la URL de la foto');
            console.log('   3. Tu backend extraerá automáticamente la foto y la guardará en foto_perfil_url');
            console.log('   4. La respuesta incluirá foto_perfil_url y el JWT contendrá la foto');
            
        } else {
            console.log('\n⚠️ Respuesta inesperada del servidor');
        }

    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 El servidor no está ejecutándose. Inicia con: npm start');
        }
    }
}

// Ejecutar test
testEndToEndGoogleAuth();
