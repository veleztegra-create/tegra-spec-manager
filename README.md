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

```
.
├── index.html
├── styles.css
├── js
│   ├── config
│   ├── core
│   ├── main.js
│   ├── modules
│   │   ├── data
│   │   ├── export
│   │   ├── placements
│   │   └── ui
│   └── utils
└── legacy
    ├── diagnostic.html
    ├── fixes.js
    ├── managers
    └── templates
```

La carpeta `legacy/` conserva archivos antiguos o en transición que ya no forman parte del flujo principal de carga. Esto ayuda a mantener el código activo más claro mientras continúa la migración desde el `index.html` original.

Más información: https://veleztegra-create.github.io/tegra-spec-manager/
