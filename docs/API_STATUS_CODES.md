# Códigos de estado HTTP - Omega API

## Códigos exitosos (2xx)

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | GET, PUT, acciones con respuesta |
| 201 | Created | POST que crea un nuevo recurso |
| 204 | No Content | DELETE sin body de respuesta |

## Códigos de error del cliente (4xx)

| Código | Significado | Cuándo |
|--------|-------------|--------|
| 400 | Bad Request | JSON malformado, query params inválidos |
| 401 | Unauthorized | Token ausente, expirado, malformado o inválido |
| 403 | Forbidden | Sin permisos (rol admin), CORS denegado |
| 404 | Not Found | Recurso o ruta inexistente |
| 409 | Conflict | Duplicado, violación de integridad, stock insuficiente |
| 413 | Payload Too Large | Archivo >5MB, cuerpo de request demasiado grande |
| 422 | Unprocessable Entity | Validación semántica fallida (express-validator) |
| 429 | Too Many Requests | Rate limit excedido (express-rate-limit) |

## Códigos de error del servidor (5xx)

| Código | Significado | Cuándo |
|--------|-------------|--------|
| 500 | Internal Server Error | Error inesperado no controlado |

---

## Tabla por endpoint

| Método | Endpoint | Éxito | Errores |
|--------|----------|-------|---------|
| POST | /usuarios/register | 201 | 400, 409, 413, 422 |
| POST | /usuarios/login | 200 | 401, 422 |
| POST | /usuarios/auth/google | 200/201 | 400, 401, 422 |
| POST | /usuarios/auth/google/test | 200 | 400 (solo dev) |
| DELETE | /usuarios/auth/google/unlink | 200 | 400, 401, 404 |
| GET | /usuarios/perfil | 200 | 401 |
| PUT | /usuarios/perfil | 200 | 400, 401, 404, 413, 422 |
| DELETE | /usuarios/perfil | 204 | 401, 404 |
| POST | /usuarios/restablecer-solicitud | 200 | 404, 422 |
| POST | /usuarios/restablecer | 200 | 400, 404, 409, 422 |
| GET | /usuarios/all | 200 | 401, 403 |
| DELETE | /usuarios/admin/:id | 204 | 400, 401, 403, 404 |
| GET | /productos | 200 | - |
| GET | /productos/:id/stock | 200 | 404 |
| POST | /productos | 201 | 400, 401, 403, 413, 422 |
| PUT | /productos/:id | 200 | 401, 403, 404, 413, 422 |
| POST | /productos/:id/reservar | 201 | 401, 404, 409, 422 |
| PUT | /productos/reserva/:id/confirmar | 200 | 401, 404 |
| DELETE | /productos/reserva/:id/cancelar | 200 | 401, 404 |
| GET | /productos/mis-reservas | 200 | 401 |
| GET | /faq | 200 | - |
| POST | /faq | 201 | 401, 403, 422 |
| PUT | /faq/:id | 200 | 401, 403, 404, 422 |
| DELETE | /faq/:id | 204 | 401, 403, 404 |
| GET | /citas | 200 | 401 |
| POST | /citas | 201 | 401, 422 |
| PUT | /citas/:id | 200 | 401, 404, 422 |
| DELETE | /citas/:id | 204 | 401, 404 |
| GET | /citas/admin | 200 | 401, 403 |
| GET | /eventos | 200 | - |
| POST | /eventos | 201 | 401, 403, 422 |
| PUT | /eventos/:id | 200 | 401, 403, 404, 422 |
| DELETE | /eventos/:id | 204 | 401, 403, 404 |
| POST | /eventos/inscripcion | 201 | 401, 404, 409 |
| DELETE | /eventos/inscripcion/:evento_id | 204 | 401, 404 |
| GET | /blog | 200 | - |
| POST | /blog | 201 | 401, 403, 422 |
| GET | /blog/:id | 200 | 404 |
| PUT | /blog/:id | 200 | 401, 403, 404, 422 |
| DELETE | /blog/:id | 204 | 401, 403, 404 |
| GET | /testimonios | 200 | - |
| POST | /testimonios | 201 | 401, 422 |
| PUT | /testimonios/:id | 200 | 401, 404, 422 |
| DELETE | /testimonios/:id | 204 | 401, 404 |
| PUT | /testimonios/:id/aceptar | 200 | 401, 403, 404 |
| PUT | /testimonios/:id/rechazar | 200 | 401, 403, 404 |
| GET | /testimonios/pendientes | 200 | 401, 403 |
| POST | /personalizacion | 201 | 401, 413, 422 |
| GET | /personalizacion | 200 | 401, 403 |
| PUT | /personalizacion/:id/aceptar | 200 | 401, 403, 404 |
| PUT | /personalizacion/:id/rechazar | 200 | 401, 403, 404 |
| GET | /reporte/auditoria | 200 | 401, 403 |
| GET | /reporte/usuarios/activos | 200 | 401, 403 |
| GET | /reporte/usuarios/inactivos | 200 | 401, 403 |
| GET | /reporte/auditoria/exportar/csv | 200 | 401, 403 |
| GET | /reporte/auditoria/exportar/pdf | 200 | 401, 403 |
| GET | /servicios | 200 | 401 |
| GET | /ping | 200 | - |

## Headers especiales

| Header | Cuándo |
|--------|--------|
| X-Total-Count | Total de registros en listado paginado |
| X-Total-Pages | Total de páginas disponibles |
| Content-Disposition: attachment | Descarga de CSV/PDF |
| Content-Type: application/pdf | Respuesta PDF |

## Formato de errores

Todos los errores (4xx, 5xx) devuelven:
```json
{
  "message": "Descripción legible del error",
  "code": "CODIGO_MAQUINA_LEGIBLE"
}
```

Adicionalmente, para errores de validación (422):
```json
{
  "message": "Datos inválidos",
  "code": "VALIDATION_FAILED",
  "errors": [
    { "field": "correo_electronico", "message": "Correo inválido" }
  ]
}
```

Para errores 409 con datos extra:
```json
{
  "message": "Ya tienes una reserva activa para este producto",
  "code": "CONFLICT",
  "data": {
    "reserva_existente": { "reserva_id": 123, ... }
  }
}
```