# Green World — backend

API Express con SQL Server para [GreenWorld-FrontEnd](https://github.com/fabianalexanderchirivi-a11y/GreenWorld-FrontEnd).

## Ejecución local

Requiere Node.js/npm y una base Green World con sus tablas y procedimientos almacenados. Este repositorio no incluye el esquema completo ni datos de usuarios.

```powershell
npm ci
Copy-Item .env.example .env
# Configura PORT, SERVER, DATABASE, USER, PASSWORD y JWT_SECRET en el archivo local.
npm run dev
```

El frontend de desarrollo usa el puerto 4000 para la API. Mantén las credenciales y JWT_SECRET únicamente en la configuración privada.

## Certificados

- `POST /api/cursos/:id/certificado`: requiere JWT, inscripción del usuario, estado completado, 100 % y fecha de finalización. Devuelve 201 al emitir y 200 si ya existe.
- `GET /api/certificados/:id/descargar`: requiere JWT del titular, cuenta activa y curso completado. Devuelve un PDF real; rechaza descargas ajenas con 404 e incompletas con 409.
- El CRUD heredado de `/api/certificado(s)` y el CRUD genérico de `/api/inscripciones` requieren rol administrador.

## Pruebas de API y SQL

Los scripts `auditFinalPpi.mjs`, `verifyCertificates.mjs`, `verifyFinalPersistence.mjs` y `verifyIncompletePersistence.mjs` necesitan la API y SQL Server reales. Para reproducir el flujo completo usa un directorio padre con los checkouts llamados `frontend/` y `backend/`, y ejecuta los scripts desde `backend/`. El frontend requiere sus dependencias para la regresión Cypress.

El script de auditoría crea una cuenta sintética y guarda sus credenciales en la carpeta privada de evidencias del frontend; también prueba y persiste una finalización directa. Los scripts de verificación crean datos controlados y desactivan las cuentas secundarias. `verifyFinalPersistence.mjs` se ejecuta al terminar Cypress y desactiva la cuenta de regresión. Las evidencias privadas no deben publicarse como parte del código.

`verifyCertificates.mjs` acepta `GW_PPI_ENV_PATH` y `GW_EVIDENCE_DIR` para seleccionar la configuración local y el destino de evidencia. Consulta [el estado de validación](docs/VALIDACION-PPI.md) antes de interpretar los resultados. El progreso por módulos no está implementado completamente y requiere definición y autorización para ampliarlo.
