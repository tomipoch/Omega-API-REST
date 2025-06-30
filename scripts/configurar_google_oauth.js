const pool = require('../db');

async function agregarSoporteGoogleOAuth() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando configuración de Google OAuth...');
    
    // 1. Agregar columna google_id
    console.log('📝 1. Agregando columna google_id...');
    try {
      await client.query(`
        ALTER TABLE usuarios 
        ADD COLUMN google_id VARCHAR(255)
      `);
      console.log('✅ Columna google_id agregada');
    } catch (error) {
      if (error.code === '42701') { // Columna ya existe
        console.log('ℹ️  Columna google_id ya existe');
      } else {
        throw error;
      }
    }
    
    // 2. Agregar restricción UNIQUE
    console.log('📝 2. Agregando restricción UNIQUE...');
    try {
      await client.query(`
        ALTER TABLE usuarios 
        ADD CONSTRAINT usuarios_google_id_key UNIQUE (google_id)
      `);
      console.log('✅ Restricción UNIQUE agregada');
    } catch (error) {
      if (error.code === '42P07') { // Restricción ya existe
        console.log('ℹ️  Restricción UNIQUE ya existe');
      } else {
        throw error;
      }
    }
    
    // 3. Crear índice
    console.log('📝 3. Creando índice para google_id...');
    try {
      await client.query(`
        CREATE INDEX idx_usuarios_google_id ON usuarios(google_id)
      `);
      console.log('✅ Índice creado');
    } catch (error) {
      if (error.code === '42P07') { // Índice ya existe
        console.log('ℹ️  Índice ya existe');
      } else {
        throw error;
      }
    }
    
    // 4. Hacer la contraseña opcional
    console.log('📝 4. Haciendo la contraseña opcional...');
    try {
      await client.query(`
        ALTER TABLE usuarios 
        ALTER COLUMN contrasena DROP NOT NULL
      `);
      console.log('✅ Contraseña ahora es opcional');
    } catch (error) {
      if (error.code === '42804') { // Columna ya es nullable
        console.log('ℹ️  Contraseña ya es opcional');
      } else {
        throw error;
      }
    }
    
    // 5. Agregar comentario
    console.log('📝 5. Agregando comentario de documentación...');
    await client.query(`
      COMMENT ON COLUMN usuarios.google_id IS 'ID único de Google OAuth para autenticación'
    `);
    console.log('✅ Comentario agregado');
    
    // 6. Verificar la estructura
    console.log('📝 6. Verificando estructura de la tabla...');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Estructura de la tabla usuarios:');
    console.table(result.rows);
    
    console.log('🎉 Configuración de Google OAuth completada exitosamente');
    console.log('📋 Cambios realizados:');
    console.log('   - Agregada columna google_id a la tabla usuarios');
    console.log('   - Creada restricción UNIQUE para google_id');
    console.log('   - Creado índice para google_id');
    console.log('   - Contraseña ahora es opcional');
    console.log('');
    console.log('⚠️  Recordatorio: No olvides configurar las variables de entorno:');
    console.log('   - GOOGLE_CLIENT_ID');
    console.log('   - GOOGLE_CLIENT_SECRET (si usas flujo completo OAuth)');
    
  } catch (error) {
    console.error('❌ Error al configurar Google OAuth:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Ejecutar si este archivo se llama directamente
if (require.main === module) {
  agregarSoporteGoogleOAuth()
    .then(() => {
      console.log('✨ Proceso completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = agregarSoporteGoogleOAuth;
