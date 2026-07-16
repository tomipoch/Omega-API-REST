const blogService = require('../services/blogService');
const { asyncHandler } = require('../utils/asyncHandler');

exports.crearPublicacion = asyncHandler(async (req, res) => {
  const publicacion = await blogService.crear(req.userId, req.body);
  res.status(201).json({ message: 'Publicación creada con éxito', publicacion });
});

exports.obtenerPublicaciones = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const page = parseInt(req.query.page, 10) || 1;
  const { articles, total, totalPages } = await blogService.listarPaginadas(limit, page);
  res.set('X-Total-Count', String(total));
  res.set('X-Total-Pages', String(totalPages));
  res.status(200).json({ articles });
});

exports.obtenerPublicacionPorId = asyncHandler(async (req, res) => {
  res.json(await blogService.obtenerPorId(req.params.id));
});

exports.actualizarPublicacion = asyncHandler(async (req, res) => {
  const actualizada = await blogService.actualizar(req.params.id, req.body);
  res.json({ message: 'Publicación actualizada con éxito', publicacion: actualizada });
});

exports.eliminarPublicacion = asyncHandler(async (req, res) => {
  await blogService.eliminar(req.params.id);
  res.status(204).end();
});