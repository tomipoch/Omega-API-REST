const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

// Configuración de prueba
const testConfig = {
  usuario: {
    correo: 'test@omega.com',
    contrasena: 'test123'
  }
};

let authToken = null;

async function ejecutarPruebas() {
  console.log('🚀 Iniciando pruebas del sistema de reservas...\n');

  try {
    // 1. Login de usuario
    console.log('1. 🔐 Probando login...');
    authToken = await login();
    console.log('✅ Login exitoso\n');

    // 2. Obtener productos
    console.log('2. 📦 Obteniendo lista de productos...');
    const productos = await obtenerProductos();
    console.log(`✅ Se obtuvieron ${productos.length} productos\n`);

    if (productos.length === 0) {
      console.log('❌ No hay productos para probar. Crear algunos productos primero.');
      return;
    }

    const productoTest = productos[0];
    console.log(`📋 Usando producto de prueba: ${productoTest.nombre_producto} (ID: ${productoTest.producto_id})\n`);

    // 3. Verificar stock inicial
    console.log('3. 📊 Verificando stock inicial...');
    const stockInicial = await obtenerStock(productoTest.producto_id);
    console.log(`✅ Stock inicial: ${stockInicial.stock_disponible} unidades\n`);

    if (stockInicial.stock_disponible === 0) {
      console.log('❌ No hay stock disponible para probar reservas.');
      return;
    }

    // 4. Reservar producto
    console.log('4. 🛒 Reservando producto...');
    const reserva = await reservarProducto(productoTest.producto_id, 2);
    console.log(`✅ Producto reservado. Reserva ID: ${reserva.reserva.reserva_id}\n`);

    // 5. Verificar stock después de reserva
    console.log('5. 📊 Verificando stock después de reserva...');
    const stockDespuesReserva = await obtenerStock(productoTest.producto_id);
    console.log(`✅ Stock después de reserva: ${stockDespuesReserva.stock_disponible} unidades\n`);

    // 6. Obtener reservas del usuario
    console.log('6. 📋 Obteniendo reservas del usuario...');
    const reservasUsuario = await obtenerReservasUsuario();
    console.log(`✅ Usuario tiene ${reservasUsuario.reservas.length} reserva(s)\n`);

    // 7. Intentar reservar el mismo producto (debería fallar)
    console.log('7. ⚠️ Intentando reservar el mismo producto nuevamente...');
    try {
      await reservarProducto(productoTest.producto_id, 1);
      console.log('❌ ERROR: Debería haber fallado al reservar el mismo producto\n');
    } catch (error) {
      console.log(`✅ Correctamente bloqueado: ${error.response?.data?.message || error.message}\n`);
    }

    // 8. Esperar 3 segundos y cancelar reserva
    console.log('8. ⏳ Esperando 3 segundos antes de cancelar...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('9. ❌ Cancelando reserva...');
    await cancelarReserva(reserva.reserva.reserva_id);
    console.log('✅ Reserva cancelada exitosamente\n');

    // 10. Verificar stock después de cancelación
    console.log('10. 📊 Verificando stock después de cancelación...');
    const stockFinal = await obtenerStock(productoTest.producto_id);
    console.log(`✅ Stock final: ${stockFinal.stock_disponible} unidades\n`);

    // 11. Probar reserva con confirmación
    console.log('11. 🛒 Reservando producto para confirmar...');
    const segundaReserva = await reservarProducto(productoTest.producto_id, 1);
    console.log(`✅ Segunda reserva creada. ID: ${segundaReserva.reserva.reserva_id}\n`);

    console.log('12. ✅ Confirmando reserva...');
    await confirmarReserva(segundaReserva.reserva.reserva_id);
    console.log('✅ Reserva confirmada exitosamente\n');

    console.log('🎉 ¡Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.response?.data || error.message);
  }
}

// Funciones auxiliares para las pruebas
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/usuarios/login`, testConfig.usuario);
    return response.data.token;
  } catch (error) {
    console.log('⚠️ Error en login (usuario de prueba puede no existir)');
    console.log('Creando usuario de prueba...');
    
    // Intentar crear usuario de prueba
    await axios.post(`${BASE_URL}/usuarios/register`, {
      nombre: 'Usuario',
      apellido_paterno: 'Prueba',
      apellido_materno: 'Test',
      correo_electronico: testConfig.usuario.correo,
      contrasena: testConfig.usuario.contrasena
    });
    
    console.log('✅ Usuario de prueba creado');
    
    // Intentar login nuevamente
    const response = await axios.post(`${BASE_URL}/usuarios/login`, testConfig.usuario);
    return response.data.token;
  }
}

async function obtenerProductos() {
  const response = await axios.get(`${BASE_URL}/productos`);
  return response.data;
}

async function obtenerStock(productoId) {
  const response = await axios.get(`${BASE_URL}/productos/${productoId}/stock`);
  return response.data;
}

async function reservarProducto(productoId, cantidad) {
  const response = await axios.post(
    `${BASE_URL}/productos/${productoId}/reservar`,
    { cantidad },
    {
      headers: { Authorization: `Bearer ${authToken}` }
    }
  );
  return response.data;
}

async function cancelarReserva(reservaId) {
  const response = await axios.delete(
    `${BASE_URL}/productos/reserva/${reservaId}/cancelar`,
    {
      headers: { Authorization: `Bearer ${authToken}` }
    }
  );
  return response.data;
}

async function confirmarReserva(reservaId) {
  const response = await axios.put(
    `${BASE_URL}/productos/reserva/${reservaId}/confirmar`,
    {},
    {
      headers: { Authorization: `Bearer ${authToken}` }
    }
  );
  return response.data;
}

async function obtenerReservasUsuario() {
  const response = await axios.get(
    `${BASE_URL}/productos/mis-reservas`,
    {
      headers: { Authorization: `Bearer ${authToken}` }
    }
  );
  return response.data;
}

// Ejecutar pruebas si el archivo se ejecuta directamente
if (require.main === module) {
  ejecutarPruebas();
}

module.exports = {
  ejecutarPruebas,
  login,
  obtenerProductos,
  obtenerStock,
  reservarProducto,
  cancelarReserva,
  confirmarReserva
};
