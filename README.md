# Tegra Spec Manager

Aplicación web para preparar y generar hojas de especificación técnica de serigrafía (screen printing). El proyecto busca organizar la información del estilo, las piezas de la prenda, los colores y la secuencia de producción, y presentar esos datos en una Spec clara y consistente.

> **Estado del proyecto:** en desarrollo y validación. Las funciones deben comprobarse con casos reales antes de considerarlas listas para uso productivo. Este README describe la implementación del repositorio; no implica que todas las funciones estén integradas o desplegadas en todos los entornos.

## ¿Qué permite hacer el frontend?

La aplicación está construida principalmente con HTML, CSS y JavaScript y se ejecuta en el navegador.

- **Ingreso de información del estilo:** datos generales como estilo, equipo, temporada, PO, cliente, género y otros campos de la Spec.
- **Carga y lectura de Excel:** automatizaciones para ayudar a incorporar información de archivos Excel.
- **Organización por placements/piezas:** Front, Back, Sleeve y placements personalizados.
- **Colores de impresión:** selección y manejo de colores, referencias Pantone y datos de color disponibles en la configuración del proyecto.
- **Secuencia de producción:** organización de estaciones y procesos de impresión.
- **Reglas y presets de producción:** lógica para ayudar a configurar condiciones, aditivos y efectos especiales según las reglas disponibles en el proyecto.
- **Información de patrones:** metadatos de piezas y encogimientos asociados a placements.
- **Lectura de Tech Packs:** herramientas de extracción/lectura de PDF y un extractor específico para Tech Packs Nike. La extracción puede requerir revisión manual.
- **Generación de la Spec:** el renderizador aprobado genera HTML preparado para impresión desde el navegador y posterior guardado como PDF mediante la función de impresión.
- **Logos y recursos:** configuración de logos y recursos utilizados en la hoja.

La aplicación puede depender de servicios externos/CDN para algunas librerías, fuentes o iconos; por ello, ciertas funciones pueden requerir conexión a internet.

## Flujo general

1. Cargar o ingresar los datos generales del estilo.
2. Revisar la información detectada y corregirla si es necesario.
3. Agregar los placements/piezas correspondientes.
4. Registrar colores y configurar la secuencia de producción.
5. Completar información de patrones, encogimientos, artwork y recursos aplicables.
6. Revisar la Spec generada.
7. Imprimir o guardar como PDF desde el navegador.
8. Validar el resultado final antes de compartirlo o utilizarlo en producción.

## Renderizado de la Spec

El renderizador principal de la Spec aprobada está en:

- `features/approved-spec-renderer.js`

El modelo de datos que prepara la información para la Spec está en:

- `modules/spec-data-model.js`

El flujo de generación/exportación se coordina desde la aplicación y otros módulos. Para ajustes **visuales** de la hoja —tipografía, espacios, tablas, bordes y paginación—, revisar primero el renderizador aprobado. No modificar el modelo de datos si el cambio solicitado es únicamente visual.

## Configuración y lógica

La configuración del proyecto se distribuye entre archivos en `config/`, `core/`, `modules/` y `features/`.

Algunos archivos relevantes:

- `config/config-teams.js`: datos/configuración de equipos.
- `config/color-database.js` y `config/config-color.js`: datos y configuración de colores.
- `config/config-logos.js`: mapeo de logos.
- `config/additives-rules.js`: reglas relacionadas con aditivos.
- `config/production-conditions.js`: condiciones de producción configurables.
- `core/sequence-builder.js`: lógica de construcción de secuencia.
- `core/production-condition-engine.js`: lógica de condiciones de producción.
- `core/rules-engine.js`: motor de reglas.

Antes de modificar estos archivos, revisar las dependencias y validar que el cambio no afecte otros clientes, tintas, placements o procesos.

## Documentación relacionada

- [Integridad de patrones, piezas, encogimientos y recuperación de Specs](docs/integridad-datos-patrones-encogimientos.md)
- [README del backend](backend/README.md)

## Backend (MVP)

El repositorio contiene un backend inicial en `backend/` basado en Node.js, Fastify, Prisma y PostgreSQL. Está documentado como **MVP de desarrollo/consolidación**; no debe asumirse que el frontend actual depende de él para todas sus operaciones ni que constituye un sistema de producción completo.

Consulta [backend/README.md](backend/README.md) para requisitos, variables de entorno, migraciones y endpoints.

### Scripts disponibles en la raíz

Requieren Node.js 20.x:

- `npm run render:build`: prepara el backend para el despliegue en Render.
- `npm run render:start`: inicia el backend.
- `npm run backend:check`: ejecuta la verificación del backend.
- `npm run backend:test`: ejecuta las pruebas del backend.
- `npm run test:production`: ejecuta un grupo de pruebas del motor de secuencia, efectos especiales, alertas de producción y reglas de artwork sizing.
- `npm run test:sequence`: pruebas del constructor de secuencias.
- `npm run test:special-effects`: pruebas del catálogo de efectos especiales.
- `npm run test:production-alerts`: pruebas de alertas de producción.
- `npm run test:artwork-sizing`: pruebas de reglas de tamaño de artwork.
- `npm run test:approved-spec`: pruebas del renderizador de Spec.
- `npm run test:acb`: pruebas relacionadas con archivos/paletas ACB.

Estos scripts indican qué pruebas están disponibles; su presencia no significa que hayan sido ejecutadas o que todas pasen en cada commit.

## Despliegue del backend en Render

La configuración del repositorio incluye `render.yaml` y scripts en el `package.json` raíz.

- Build: `npm run render:build`
- Start: `npm run render:start`
- Variables de entorno principales: `DATABASE_URL` y `CORS_ORIGINS`

Consulta el README del backend antes de desplegar. El frontend estático y el backend son componentes distintos y pueden requerir configuración separada.

## Principios de mantenimiento

- Trabajar primero en ramas de desarrollo; no modificar `main` sin autorización.
- Mantener respaldos de los estados aprobados.
- Hacer cambios pequeños y enfocados.
- Evitar alterar reglas de producción al realizar ajustes visuales.
- Validar los cambios con casos reales y revisar el HTML/PDF generado.
- No considerar una función verificada solo porque el código compila o una prueba automatizada pasa.
