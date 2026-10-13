# Validación técnica PPI

Última ejecución real: **9 de octubre de 2026**. Publicación del código: **13 de octubre de 2026**.

La regresión final con Cypress 16.1.1, frontend Vite, API Express y SQL Server obtuvo **8 Pasa, 0 Falla, 0 Pendiente**. Compilación y ESLint completos pasaron. Las interceptaciones de los ocho casos observan solicitudes reales sin sustituir respuestas.

| Caso | Resultado |
|---|---|
| TC-GW03-01 — login válido | Pasa: HTTP 200 y sesión visible. |
| TC-GW03-02 — credenciales incorrectas | Pasa: HTTP 401 y sin sesión. |
| TC-GW03-03 — campos obligatorios | Pasa: HTTP 400 en tres variantes. |
| TC-GW02-01 — iniciar curso | Pasa: HTTP 200 y En progreso. |
| TC-GW02-02 — finalizar curso | Pasa: HTTP 200 y 100 % persistido. |
| TC-GW09-01 — progreso | Pasa: estado y 100 % confirmados en interfaz, API y SQL. |
| TC-GW08-01 — certificado PDF | Pasa: generación, descarga auténtica y persistencia. |
| TC-GW08-02 — impedir certificado incompleto | Pasa: HTTP 409 y cero certificados en SQL. |

BUG-GW08-02 se reprodujo originalmente el 2 de octubre con dos respuestas 201 sin autenticación para una inscripción incompleta. Está corregido y verificado: JWT/titularidad, bloqueo 409, permisos administrativos, descargas ajenas 404 e idempotencia. El PDF descargado fue renderizado e inspeccionado.

El primer intento de la última verificación tuvo un timeout de captura en TC-GW03-02 tras pasar sus validaciones. Una segunda regresión completa aprobó los ocho casos; ambos logs se conservaron localmente.

## Límites y decisiones pendientes

GW-02/GW-09 permiten la finalización manual. SQL Server conserva procedimientos de cálculo por módulos, pero falta `dbo.progreso_modulos` y la API no utiliza ese flujo. Se comprobó una finalización directa sin inicio previo con HTTP 200. No existe un criterio confirmado de actividades obligatorias: el cierre funcional definitivo del PPI requiere confirmar ese criterio o implementar el seguimiento autorizado.

No hay acceso a TestRail ni resultados registrados allí. Se preparó un CSV local para futura importación. Las métricas 100 % de ejecución/aprobación y 0 % de fallos corresponden a los ocho casos, no a una auditoría integral del software.

El informe completo, capturas, videos, evidencias originales del bug y PDF permanecen en el paquete local `ENTREGA_EVIDENCIAS_PARA_CHATGPT.zip`. No se incluyen configuraciones privadas ni credenciales en estos repositorios.
