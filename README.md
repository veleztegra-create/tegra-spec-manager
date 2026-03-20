# Tegra Technical Spec Manager

Sistema web para gestión de especificaciones técnicas de serigrafía.

## Características

1. **Carga de Excel**: Importar datos de specs desde archivos Excel
2. **Gestión multi-ubicación**: Manejo de FRONT, BACK, SLEEVE, etc.
3. **Presets de tintas**: Configuraciones predefinidas para WATER, PLASTISOL, SILICONE
4. **Análisis de PDFs**: Conteo de píxeles negros a 300 DPI
5. **Filtro de ruido**: Resta automática de 15,870,446 píxeles de ruido
6. **Exportación ZIP**: Proyecto completo en formato ZIP
7. **Medidas en pulgadas**: Sistema imperial para dimensiones
8. **Base de datos Pantone/UNI**: Colores estándar de la industria
9. **Interfaz modular**: 4 pestañas principales

## Estructura de Carpetas
 https://veleztegra-create.github.io/tegra-spec-manager/


## Backend (MVP Node)

Se agregó un backend inicial en `backend/` para desarrollo en Render durante la fase de consolidación.

Revisa `backend/README.md` para instalación, migraciones y endpoints disponibles.


### Deploy rápido en Render

El repo incluye `render.yaml` en la raíz y un `package.json` raíz para que Render pueda construir y arrancar el backend **sin depender de `rootDir`**.

Comandos usados por Render:
- Build: `npm run render:build`
- Start: `npm run render:start`
