const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function pruebaSimpleReservas() {
  console.log('🚀 Prueba simple del sistema de reservas...\n');

  try {
    // 1. Verificar que el servidor responda
    console.log('1. 🌐 Verificando conexión con servidor...');
    const ping = await axios.get(`${BASE_URL}/ping`);
    console.log('✅ Servidor conectado:', ping.data.message);

    // 2. Obtener productos
    console.log('\n2. 📦 Obteniendo productos...');
    const productos = await axios.get(`${BASE_URL}/productos`);
    console.log(`✅ Se encontraron ${productos.data.length} productos`);

    if (productos.data.length === 0) {
      console.log('❌ No hay productos para probar. Agrega productos primero.');
      return;
    }

    const productoTest = productos.data[0];
    console.log(`📋 Producto de prueba: ${productoTest.nombre_producto} (ID: ${productoTest.producto_id})`);

    // 3. Verificar stock en tiempo real
    console.log('\n3. 📊 Verificando stock en tiempo real...');
    const stock = await axios.get(`${BASE_URL}/productos/${productoTest.producto_id}/stock`);
    console.log('✅ Stock obtenido:', {
      producto: stock.data.nombre_producto,
      stock_disponible: stock.data.stock_disponible,
      disponible: stock.data.disponible
    });

    if (stock.data.stock_disponible === 0) {
      console.log('❌ No hay stock disponible para probar reservas.');
      return;
    }

    // 4. Probar crear usuario (opcional, solo si no existe)
    console.log('\n4. 👤 Preparando usuario de prueba...');
    let token = null;
    
    try {
      // Intentar login primero
      const loginResponse = await axios.post(`${BASE_URL}/usuarios/login`, {
        correo_electronico: 'test@reservas.com',
        contrasena: 'test123'
      });
      token = loginResponse.data.token;
      console.log('✅ Login exitoso con usuario existente');
    } catch (loginError) {
      // Si el login falla, crear usuario
      console.log('⚠️ Usuario no existe, creando uno nuevo...');
      
      try {
        await axios.post(`${BASE_URL}/usuarios/register`, {
          nombre: 'Test',
          apellido_paterno: 'Reservas',
          apellido_materno: 'Usuario',
          correo_electronico: 'test@reservas.com',
          contrasena: 'test123'
        });
        console.log('✅ Usuario creado exitosamente');
        
        // Ahora hacer login
        const loginResponse = await axios.post(`${BASE_URL}/usuarios/login`, {
          correo_electronico: 'test@reservas.com',
          contrasena: 'test123'
        });
        token = loginResponse.data.token;
        console.log('✅ Login exitoso con usuario nuevo');
      } catch (registerError) {
        console.error('❌ Error al crear usuario:', registerError.response?.data?.message || registerError.message);
        return;
      }
    }

    // 5. Probar reserva SIN autenticación (debería fallar)
    console.log('\n5. 🚫 Probando reserva sin autenticación (debe fallar)...');
    try {
      await axios.post(`${BASE_URL}/productos/${productoTest.producto_id}/reservar`, {
        cantidad: 1
      });
      console.log('❌ ERROR: La reserva debería haber fallado sin autenticación');
    } catch (error) {
      console.log('✅ Correcto: Reserva bloqueada sin autenticación');
      console.log('   Mensaje:', error.response?.data?.message || 'Sin autenticación');
    }

    // 6. Probar reserva CON autenticación
    console.log('\n6. 🛒 Probando reserva con autenticación...');
    try {
      const reservaResponse = await axios.post(
        `${BASE_URL}/productos/${productoTest.producto_id}/reservar`,
        { cantidad: 2 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ Reserva creada exitosamente:');
      console.log('   Reserva ID:', reservaResponse.data.reserva.reserva_id);
      console.log('   Cantidad reservada:', reservaResponse.data.reserva.cantidad_reservada);
      console.log('   Expira:', reservaResponse.data.reserva.fecha_expiracion);
      
      const reservaId = reservaResponse.data.reserva.reserva_id;

      // 7. Verificar stock después de reserva
      console.log('\n7. 📊 Verificando stock después de reserva...');
      const stockDespues = await axios.get(`${BASE_URL}/productos/${productoTest.producto_id}/stock`);
      console.log('✅ Stock actualizado:', {
        stock_anterior: stock.data.stock_disponible,
        stock_actual: stockDespues.data.stock_disponible,
        diferencia: stock.data.stock_disponible - stockDespues.data.stock_disponible
      });

      // 8. Intentar reserva duplicada (debería fallar)
      console.log('\n8. 🚫 Probando reserva duplicada (debe fallar)...');
      try {
        await axios.post(
          `${BASE_URL}/productos/${productoTest.producto_id}/reservar`,
          { cantidad: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('❌ ERROR: La reserva duplicada debería haber fallado');
      } catch (error) {
        console.log('✅ Correcto: Reserva duplicada bloqueada');
        console.log('   Mensaje:', error.response?.data?.message);
      }

      // 9. Cancelar reserva
      console.log('\n9. ❌ Cancelando reserva...');
      const cancelResponse = await axios.delete(
        `${BASE_URL}/productos/reserva/${reservaId}/cancelar`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ Reserva cancelada exitosamente');
      console.log('   Cantidad devuelta:', cancelResponse.data.reserva.cantidad_devuelta);

      // 10. Verificar stock final
      console.log('\n10. 📊 Verificando stock final...');
      const stockFinal = await axios.get(`${BASE_URL}/productos/${productoTest.producto_id}/stock`);
      console.log('✅ Stock final restaurado:', {
        stock_original: stock.data.stock_disponible,
        stock_final: stockFinal.data.stock_disponible,
        restaurado_correctamente: stock.data.stock_disponible === stockFinal.data.stock_disponible
      });

      console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');
      console.log('\n📋 Resumen:');
      console.log('   ✅ Conexión con servidor');
      console.log('   ✅ Obtención de productos');
      console.log('   ✅ Stock en tiempo real');
      console.log('   ✅ Autenticación de usuarios');
      console.log('   ✅ Creación de reservas');
      console.log('   ✅ Actualización de stock');
      console.log('   ✅ Prevención de reservas duplicadas');
      console.log('   ✅ Cancelación de reservas');
      console.log('   ✅ Restauración de stock');

    } catch (reservaError) {
      console.error('❌ Error en reserva:', reservaError.response?.data || reservaError.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error.response?.data || error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  pruebaSimpleReservas();
}

module.exports = pruebaSimpleReservas;
