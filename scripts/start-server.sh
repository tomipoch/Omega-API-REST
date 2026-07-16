#!/bin/bash
echo "==================================="
echo " LIMPIANDO PROCESOS ANTERIORES"
echo "==================================="

echo "Buscando procesos en puerto 4000..."
PIDS=$(lsof -ti:4000 2>/dev/null)
if [ -n "$PIDS" ]; then
  echo "Matando procesos: $PIDS"
  kill -9 $PIDS 2>/dev/null
fi

echo "Esperando liberación de recursos..."
sleep 2

echo "==================================="
echo " INICIANDO SERVIDOR"
echo "==================================="

npm start