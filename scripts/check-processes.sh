#!/bin/bash
echo "==================================="
echo " VERIFICANDO PROCESOS EN PUERTO 4000"
echo "==================================="

echo "Procesos usando el puerto 4000:"
lsof -i :4000 2>/dev/null || echo "  Ninguno"

echo ""
echo "==================================="
echo " PROCESOS NODE.JS ACTIVOS"
echo "==================================="
ps aux | grep -E "node|nodemon" | grep -v grep || echo "  Ninguno"