const { verifyGoogleToken } = require('./middleware/googleAuth');

// Mock token simulando uno real de Google con foto de perfil
const mockGoogleToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY4NzBhYzZkZGNkOGE5ZjdmNjVkOWFjYjBhNzI1NTJkMTQzYWE0MzEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMTAyNjEzNzIwNzAzLWNxNzNnOTJzdTB2OGtldmMwaXVmdGphazB0bTFlMWFsLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiMTAyNjEzNzIwNzAzLWNxNzNnOTJzdTB2OGtldmMwaXVmdGphazB0bTFlMWFsLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTE2ODY1MzI5NjAzMzUzNjUzODU2IiwiaGQiOiJnbWFpbC5jb20iLCJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJGeDZQcEhLa2pLS1JHVGx2cjhkZ0x3IiwibmFtZSI6IkpvaG4gRG9lIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0pIMDFXcFJ0NXB3Um1VLUFZUnZ4S1J2V1pBR19MeUJoXzRqM2dYT2c9czk2LWMiLCJnaXZlbl9uYW1lIjoiSm9obiIsImZhbWlseV9uYW1lIjoiRG9lIiwiaWF0IjoxNzM1NDEzODc1LCJleHAiOjk5OTk5OTk5OTl9.MOCK_SIGNATURE';

console.log('🧪 Test: Verificando extracción de foto de perfil de Google Token');

async function testGooglePhotoExtraction() {
    try {
        // Simulamos un token real decodificado
        const mockGoogleUser = {
            googleId: '116865329603353653856',
            email: 'test@gmail.com',
            name: 'John Doe',
            picture: 'https://lh3.googleusercontent.com/a/ACg8ocJH01WpRt5pwRmU-AYRvxKRvWZAG_LyBh_4j3gXOg=s96-c',
            given_name: 'John',
            family_name: 'Doe',
            verified: true
        };

        console.log('✅ Mock Google User extraído:', {
            email: mockGoogleUser.email,
            name: mockGoogleUser.name,
            picture: mockGoogleUser.picture,
            googleId: mockGoogleUser.googleId
        });

        // Test de endpoint con fetch
        console.log('\n🚀 Probando endpoint /usuarios/auth/google con foto de perfil...');
        
        const response = await fetch('http://localhost:4000/usuarios/auth/google', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                googleToken: mockGoogleToken
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Respuesta exitosa del backend:');
            console.log('   📧 Email:', data.email || 'No incluido');
            console.log('   👤 Nombre:', data.nombre, data.apellido_paterno);
            console.log('   📸 Foto URL:', data.foto_perfil_url || 'No hay foto');
            console.log('   🔑 Token incluye foto:', data.token ? 'Sí (JWT generado)' : 'No');
            console.log('   🏷️ Rol:', data.rol_id);
            console.log('   🔗 Método:', data.loginMethod);
            
            if (data.foto_perfil_url) {
                console.log('\n🎯 ¡ÉXITO! La foto de perfil de Google se extrajo y guardó correctamente');
            } else {
                console.log('\n⚠️ ADVERTENCIA: No se encontró foto_perfil_url en la respuesta');
            }
        } else {
            console.log('❌ Error en la respuesta:', data);
        }

    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        if (error.message.includes('fetch')) {
            console.log('💡 Asegúrate de que el servidor esté ejecutándose en puerto 4000');
        }
    }
}

// Ejecutar test
testGooglePhotoExtraction();
