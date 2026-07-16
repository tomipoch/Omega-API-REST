const pool = require('../database/pgPool');

exports.obtenerProductos = async () => {
  const { rows } = await pool.query(
    'SELECT * FROM productos ORDER BY producto_id'
  );
  return rows;
};

exports.obtenerProductoPorId = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM productos WHERE producto_id = $1',
    [id]
  );
  return rows[0];
};

exports.crearProducto = async ({
  nombre_producto,
  descripcion_producto,
  precio_producto,
  stock,
  imagen_producto
}) => {
  const { rows } = await pool.query(
    `INSERT INTO productos (nombre_producto, descripcion_producto, precio_producto, stock, imagen_producto)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [nombre_producto, descripcion_producto, precio_producto, stock, imagen_producto]
  );
  return rows[0];
};

exports.actualizarProducto = async (id, {
  nombre_producto,
  descripcion_producto,
  precio_producto,
  stock,
  imagen_producto
}) => {
  const { rows } = await pool.query(
    `UPDATE productos
     SET nombre_producto = $1,
         descripcion_producto = $2,
         precio_producto = $3,
         stock = $4,
         imagen_producto = COALESCE($5, imagen_producto)
     WHERE producto_id = $6 RETURNING *`,
    [nombre_producto, descripcion_producto, precio_producto, stock, imagen_producto, id]
  );
  return rows[0];
};