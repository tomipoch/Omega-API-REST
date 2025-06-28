const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function crearTablaReservas() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Creando tabla de reservas...');
    
    // Crear tabla de reservas
    await client.query(`
      CREATE TABLE IF NOT EXISTS reservas (
          reserva_id SERIAL PRIMARY KEY,
          usuario_id INTEGER NOT NULL,
          producto_id INTEGER NOT NULL,
          cantidad_reservada INTEGER NOT NULL CHECK (cantidad_reservada > 0),
          estado_reserva VARCHAR(20) NOT NULL DEFAULT 'activa' CHECK (estado_reserva IN ('activa', 'confirmada', 'cancelada', 'expirada')),
          fecha_reserva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          fecha_expiracion TIMESTAMP NOT NULL,
          notas TEXT,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          -- Claves foráneas
          CONSTRAINT fk_reserva_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
          CONSTRAINT fk_reserva_producto FOREIGN KEY (producto_id) REFERENCES productos(producto_id) ON DELETE CASCADE
      );
    `);
    
    console.log('✅ Tabla de reservas creada exitosamente');
    
    // Crear índices
    console.log('🔧 Creando índices...');
    
    await client.query('CREATE INDEX IF NOT EXISTS idx_reserva_usuario ON reservas(usuario_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_reserva_producto ON reservas(producto_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_reserva_estado ON reservas(estado_reserva);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_reserva_fecha_expiracion ON reservas(fecha_expiracion);');
    
    console.log('✅ Índices creados exitosamente');
    
    // Crear función y trigger para fecha_actualizacion
    console.log('⚙️ Creando trigger para fecha_actualizacion...');
    
    await client.query(`
      CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS tr_reservas_update_fecha ON reservas;
      CREATE TRIGGER tr_reservas_update_fecha
          BEFORE UPDATE ON reservas
          FOR EACH ROW
          EXECUTE FUNCTION update_fecha_actualizacion();
    `);
    
    console.log('✅ Trigger creado exitosamente');
    
    // Agregar comentarios
    await client.query(`
      COMMENT ON TABLE reservas IS 'Tabla para manejar reservas temporales de productos';
      COMMENT ON COLUMN reservas.estado_reserva IS 'Estados: activa (reservado), confirmada (comprado), cancelada (usuario canceló), expirada (tiempo límite alcanzado)';
      COMMENT ON COLUMN reservas.fecha_expiracion IS 'Fecha y hora en que expira la reserva automáticamente';
    `);
    
    console.log('✅ Comentarios agregados exitosamente');
    
    // Verificar que la tabla se creó
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'reservas'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Estructura de la tabla reservas:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log('\n🎉 ¡Tabla de reservas configurada completamente!');
    
  } catch (error) {
    console.error('❌ Error al crear la tabla de reservas:', error);
    
    if (error.code === '42P07') {
      console.log('ℹ️ La tabla ya existe');
    } else if (error.code === '42703') {
      console.log('⚠️ Error de columna - verificar estructura de tablas usuarios/productos');
    } else {
      console.log('Error code:', error.code);
      console.log('Error detail:', error.detail);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar si el script se llama directamente
if (require.main === module) {
  crearTablaReservas();
}

module.exports = crearTablaReservas;
