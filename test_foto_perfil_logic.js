const usuariosModel = require('./models/usuariosModel');

async function testFotoPerfilLogic() {
    console.log('🧪 Test: Simulando lógica de foto de perfil de Google OAuth\n');

    // Simular datos de Google User (como los que devuelve el middleware)
    const mockGoogleUser = {
        googleId: '123456789012345678901',
        email: 'testuser@gmail.com',
        name: 'Test User',
        picture: 'https://lh3.googleusercontent.com/a/ACg8ocJH01WpRt5pwRmU-AYRvxKRvWZAG_LyBh_4j3gXOg=s96-c',
        given_name: 'Test',
        family_name: 'User',
        verified: true
    };

    console.log('📋 Datos del usuario Google simulado:');
    console.log('   📧 Email:', mockGoogleUser.email);
    console.log('   👤 Nombre:', mockGoogleUser.name);
    console.log('   📸 Foto URL:', mockGoogleUser.picture);
    console.log('   🆔 Google ID:', mockGoogleUser.googleId);

    try {
        // 1. Verificar si ya existe un usuario con este Google ID
        console.log('\n🔍 1. Buscando usuario existente...');
        let usuario = await usuariosModel.obtenerUsuarioPorGoogleId(mockGoogleUser.googleId);
        
        if (usuario) {
            console.log('✅ Usuario existente encontrado:', usuario.correo_electronico);
            console.log('   📸 Foto actual:', usuario.foto_perfil_url || 'Sin foto');
            
            // Si no tiene foto, actualizar con la de Google
            if (!usuario.foto_perfil_url && mockGoogleUser.picture) {
                console.log('🔄 Actualizando foto de perfil desde Google...');
                const usuarioActualizado = await usuariosModel.actualizarFotoPerfilGoogle(usuario.usuario_id, mockGoogleUser.picture);
                console.log('✅ Foto actualizada:', usuarioActualizado.foto_perfil_url);
            }
            
        } else {
            console.log('❌ Usuario no encontrado con Google ID');
            
            // 2. Verificar si existe usuario con el mismo email
            console.log('\n🔍 2. Buscando usuario por email...');
            const usuarioExistente = await usuariosModel.verificarCorreoExistente(mockGoogleUser.email);
            
            if (usuarioExistente && !usuarioExistente.google_id) {
                console.log('✅ Usuario existente sin Google ID:', usuarioExistente.correo_electronico);
                console.log('   📸 Foto actual:', usuarioExistente.foto_perfil_url || 'Sin foto');
                
                // Vincular Google ID
                console.log('🔗 Vinculando cuenta con Google...');
                usuario = await usuariosModel.vincularGoogleId(usuarioExistente.usuario_id, mockGoogleUser.googleId);
                
                // Si no tiene foto, actualizar con la de Google
                if (!usuarioExistente.foto_perfil_url && mockGoogleUser.picture) {
                    console.log('🔄 Actualizando foto de perfil desde Google...');
                    const usuarioActualizado = await usuariosModel.actualizarFotoPerfilGoogle(usuarioExistente.usuario_id, mockGoogleUser.picture);
                    console.log('✅ Foto actualizada:', usuarioActualizado.foto_perfil_url);
                    usuario.foto_perfil_url = usuarioActualizado.foto_perfil_url;
                }
                
            } else {
                console.log('❌ Usuario no encontrado por email, creando nuevo usuario...');
                
                // 3. Crear nuevo usuario con foto de Google
                console.log('\n🆕 3. Registrando nuevo usuario con Google...');
                const nombreCompleto = mockGoogleUser.name || '';
                const partesNombre = nombreCompleto.split(' ');
                const nombre = mockGoogleUser.given_name || partesNombre[0] || '';
                const apellido_paterno = mockGoogleUser.family_name || partesNombre[1] || '';
                const apellido_materno = partesNombre[2] || '';
                
                usuario = await usuariosModel.registrarUsuarioGoogle(
                    nombre,
                    apellido_paterno,
                    apellido_materno,
                    mockGoogleUser.email,
                    mockGoogleUser.googleId,
                    mockGoogleUser.picture // ← FOTO DE GOOGLE GUARDADA AQUÍ
                );
                
                console.log('✅ Usuario creado exitosamente:');
                console.log('   👤 Nombre:', usuario.nombre, usuario.apellido_paterno);
                console.log('   📧 Email:', mockGoogleUser.email);
                console.log('   📸 Foto URL:', usuario.foto_perfil_url);
                console.log('   🆔 User ID:', usuario.usuario_id);
            }
        }

        // 4. Simular respuesta del endpoint
        console.log('\n🎯 Respuesta final del endpoint:');
        const respuestaFinal = {
            token: 'jwt_token_aqui',
            nombre: usuario.nombre,
            apellido_paterno: usuario.apellido_paterno,
            apellido_materno: usuario.apellido_materno,
            foto_perfil_url: usuario.foto_perfil_url || mockGoogleUser.picture || null,
            email: mockGoogleUser.email,
            rol_id: usuario.rol_id,
            loginMethod: 'google'
        };

        console.log('✅ Respuesta simulada:', JSON.stringify(respuestaFinal, null, 2));
        
        if (respuestaFinal.foto_perfil_url) {
            console.log('\n🎉 ¡ÉXITO! La foto de perfil de Google se procesó correctamente');
            console.log('📸 URL de la foto:', respuestaFinal.foto_perfil_url);
        } else {
            console.log('\n⚠️ No se encontró foto de perfil');
        }

    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        console.error('🔍 Detalles del error:', error);
    }
}

// Ejecutar test
testFotoPerfilLogic();
