-- =====================================================
-- SCRIPT COMPLETO PARA SISTEMA DE DISPONIBILIDAD - POSTGRESQL
-- =====================================================

-- 1. Crear tipo ENUM para estados (PostgreSQL requiere crear el tipo primero)
DO $$ BEGIN
    CREATE TYPE estado_disponibilidad AS ENUM ('disponible', 'ocupada', 'cancelada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Crear tabla de disponibilidad de citas
CREATE TABLE IF NOT EXISTS disponibilidad_citas (
    disponibilidad_id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado estado_disponibilidad NOT NULL DEFAULT 'disponible',
    admin_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Claves foráneas
    CONSTRAINT fk_admin_disponibilidad FOREIGN KEY (admin_id) REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    
    -- Restricción única para evitar duplicados
    CONSTRAINT unique_disponibilidad UNIQUE (fecha, hora_inicio, hora_fin)
);

-- 3. Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_disponibilidad_fecha_estado ON disponibilidad_citas(fecha, estado);
CREATE INDEX IF NOT EXISTS idx_disponibilidad_admin_id ON disponibilidad_citas(admin_id);

-- 4. Crear función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_fecha_actualizacion_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Crear trigger para actualizar fecha_actualizacion
DROP TRIGGER IF EXISTS update_disponibilidad_fecha_actualizacion ON disponibilidad_citas;
CREATE TRIGGER update_disponibilidad_fecha_actualizacion
    BEFORE UPDATE ON disponibilidad_citas
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion_column();

-- 6. Modificar tabla citas existente para agregar referencia a disponibilidad
ALTER TABLE citas 
ADD COLUMN IF NOT EXISTS disponibilidad_id INTEGER;

-- 7. Agregar foreign key si no existe
DO $$ BEGIN
    ALTER TABLE citas ADD CONSTRAINT fk_citas_disponibilidad 
    FOREIGN KEY (disponibilidad_id) REFERENCES disponibilidad_citas(disponibilidad_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 8. Datos de ejemplo (OPCIONAL - Comentar si no quieres datos de prueba)
-- Primero obtenemos un admin_id válido
DO $$ 
DECLARE 
    admin_usuario_id INTEGER;
BEGIN
    -- Obtener el primer usuario administrador
    SELECT usuario_id INTO admin_usuario_id 
    FROM usuarios 
    WHERE rol_id = 2 
    LIMIT 1;
    
    -- Si existe un admin, insertar datos de ejemplo
    IF admin_usuario_id IS NOT NULL THEN
        INSERT INTO disponibilidad_citas (fecha, hora_inicio, hora_fin, admin_id, estado) VALUES 
        ('2025-06-25', '09:00:00', '10:00:00', admin_usuario_id, 'disponible'),
        ('2025-06-25', '10:00:00', '11:00:00', admin_usuario_id, 'disponible'),
        ('2025-06-25', '11:00:00', '12:00:00', admin_usuario_id, 'disponible'),
        ('2025-06-25', '14:00:00', '15:00:00', admin_usuario_id, 'disponible'),
        ('2025-06-25', '15:00:00', '16:00:00', admin_usuario_id, 'disponible'),
        ('2025-06-26', '09:00:00', '10:00:00', admin_usuario_id, 'disponible'),
        ('2025-06-26', '10:00:00', '11:00:00', admin_usuario_id, 'disponible'),
        ('2025-06-26', '14:00:00', '15:00:00', admin_usuario_id, 'disponible'),
        ('2025-06-27', '09:00:00', '10:00:00', admin_usuario_id, 'disponible'),
        ('2025-06-27', '15:00:00', '16:00:00', admin_usuario_id, 'disponible'),
        ('2025-06-28', '09:00:00', '10:00:00', admin_usuario_id, 'disponible'),
        ('2025-06-28', '10:00:00', '11:00:00', admin_usuario_id, 'disponible');
        
        RAISE NOTICE 'Datos de ejemplo insertados correctamente';
    ELSE
        RAISE NOTICE 'No se encontró ningún usuario administrador (rol_id = 2)';
    END IF;
END $$;

-- 9. Verificar que todo se creó correctamente
SELECT 'Tabla disponibilidad_citas creada correctamente' as mensaje;

-- 10. Mostrar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'disponibilidad_citas' 
ORDER BY ordinal_position;

-- 11. Contar disponibilidades insertadas
SELECT 
    COUNT(*) as total_disponibilidades,
    COUNT(CASE WHEN estado = 'disponible' THEN 1 END) as disponibles,
    COUNT(CASE WHEN estado = 'ocupada' THEN 1 END) as ocupadas
FROM disponibilidad_citas;
