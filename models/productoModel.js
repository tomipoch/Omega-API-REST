const pool = require('../db');

const ProductoModel = {
  async obtenerTodos() {
    const result = await pool.query('SELECT * FROM productos');
    return result.rows;
  },

  async crear(producto) {
    const { nombre_producto, descripcion_producto, precio_producto, stock, imagen_producto } = producto;
    const result = await pool.query(
      `INSERT INTO productos (nombre_producto, descripcion_producto, precio_producto, stock, imagen_producto)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nombre_producto, descripcion_producto, precio_producto, stock, imagen_producto]
    );
    return result.rows[0];
  },

  async actualizar(id, producto) {
    const { nombre_producto, descripcion_producto, precio_producto, stock, imagen_producto } = producto;
    const result = await pool.query(
      `UPDATE productos SET nombre_producto=$1, descripcion_producto=$2, precio_producto=$3, stock=$4, imagen_producto=$5
       WHERE producto_id=$6 RETURNING *`,
      [nombre_producto, descripcion_producto, precio_producto, stock, imagen_producto, id]
    );
    return result.rows[0];
  },

  async obtenerPorId(id) {
    const result = await pool.query('SELECT * FROM productos WHERE producto_id = $1', [id]);
    return result.rows[0];
  }
};

module.exports = ProductoModel;
