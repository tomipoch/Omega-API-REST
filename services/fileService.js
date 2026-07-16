const fs = require('fs').promises;
const path = require('path');

exports.moverFotoTemporal = async (origenTmp, usuarioId) => {
  const dir = `uploads/usuario-${usuarioId}/perfil/`;
  await fs.mkdir(dir, { recursive: true });
  const destino = path.join(dir, 'foto_perfil.png');
  await fs.rename(origenTmp, destino);
  return `/uploads/usuario-${usuarioId}/perfil/foto_perfil.png`;
};