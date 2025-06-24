-- Limpiar servicios existentes y agregar servicios apropiados para joyería
DELETE FROM servicios;

-- Servicios de Joyería y Relojería
INSERT INTO servicios (nombre_servicio, descripcion, precio) VALUES 
('Reparación de Relojes', 'Reparación completa de relojes mecánicos y automáticos', '45.00'),
('Cambio de Batería de Reloj', 'Cambio de batería para relojes de cuarzo', '15.00'),
('Limpieza de Joyas', 'Limpieza profesional y pulido de joyas de oro, plata y platino', '25.00'),
('Redimensionado de Anillos', 'Ajuste del tamaño de anillos (agrandar o achicar)', '35.00'),
('Soldadura de Cadenas', 'Reparación de cadenas rotas de oro y plata', '30.00'),
('Engaste de Piedras', 'Engaste profesional de piedras preciosas y semipreciosas', '80.00'),
('Pulido de Joyas', 'Pulido y restauración del brillo original de las joyas', '20.00'),
('Reparación de Aretes', 'Reparación de aretes rotos o dañados', '25.00'),
('Grabado Personalizado', 'Grabado de nombres, fechas o mensajes en joyas', '15.00'),
('Mantenimiento de Reloj', 'Servicio completo de mantenimiento preventivo', '60.00'),
('Reparación de Pulseras', 'Reparación de pulseras rotas o ajuste de eslabones', '40.00'),
('Cambio de Cristal de Reloj', 'Reemplazo de cristal dañado en relojes', '25.00');

-- Verificar servicios insertados
SELECT servicio_id, nombre_servicio, descripcion, precio FROM servicios ORDER BY servicio_id;
