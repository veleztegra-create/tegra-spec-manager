# Estado del proyecto — Tegra Spec Manager

**Fecha del punto de control:** 25 de octubre de 2026  
**Repositorio:** [veleztegra-create/tegra-spec-manager](https://github.com/veleztegra-create/tegra-spec-manager)  
**Rama de trabajo:** `fix/ppf-final-flash-cool-stations`  
**Último commit documentado:** [`bf417c2` — Remove production alerts from exported spec HTML only](https://github.com/veleztegra-create/tegra-spec-manager/commit/bf417c27fee2cd845bc6d8a9fc762b189fb9d150)

> Este documento registra dónde quedamos y qué falta comprobar. Los cambios descritos como implementados están en la rama de trabajo; no significa que ya hayan sido probados visualmente en una Spec real ni incorporados a `main`.

## 1. Contexto: qué estamos construyendo

Tegra Spec Manager ayuda a crear hojas de especificación técnica para serigrafía a partir de datos de Excel. El flujo contempla datos del estilo y la temporada, piezas o ubicaciones (por ejemplo FRONT/BACK/SLEEVE), colores/Pantone y tipo de tinta, secuencia de producción y exportación de la Spec mediante HTML/PDF.

La intención es que el documento exportado sea claro y profesional, mientras que las herramientas internas de validación y advertencias sigan disponibles dentro de la aplicación cuando sean útiles para quien la opera.

## 2. Lo que se mejoró en este punto

### A. Production Alerts se queda en la aplicación, pero se elimina del documento exportado

**Necesidad solicitada:** quitar únicamente la sección **Production Alerts** de la Spec exportada a HTML/PDF, sin borrar ni apagar las alertas dentro del programa.

**Cambio realizado:** en `features/pdf-generator-mejorado.js`:
- Se quitó la función que construía el bloque visual de Production Alerts para el documento.
- Se quitó la evaluación de alertas invocada específicamente durante la generación del HTML de la Spec.
- Se quitó la inserción de esa sección en el HTML exportado y los estilos CSS exclusivos de ese bloque.

**Se conservó:**
- `modules/production-alerts.js`, donde permanece la lógica de las alertas.
- La interfaz `ProductionAlertsUI` y su uso en la aplicación.
- El resto del flujo de exportación; el cambio se limitó al generador de la Spec.

**Commit:** [`bf417c27`](https://github.com/veleztegra-create/tegra-spec-manager/commit/bf417c27fee2cd845bc6d8a9fc762b189fb9d150)

**Estado de verificación:** se inspeccionó el código y se confirmó que el generador ya no incluye el bloque de Production Alerts y que el módulo de alertas continúa presente. **Todavía falta generar una Spec real y revisar visualmente tanto el HTML como el PDF** para confirmar que el resto del documento conserve su diseño y contenido.

### B. Ajustes a la secuencia de producción y GEL manual

También se venía trabajando en la secuencia de estaciones, especialmente el comportamiento de FLASH/COOL y GEL.

- [`1e6e84cf`](https://github.com/veleztegra-create/tegra-spec-manager/commit/1e6e84cfeaa0cb14d266045cdf07bb9cd4b9d8f8): ajuste para que la secuencia de producción termine en la última pasada de impresión, sin añadir una estación FLASH/COOL sobrante al final.
- [`e48c4cf8`](https://github.com/veleztegra-create/tegra-spec-manager/commit/e48c4cf833b3d91efdc485193edeb60519cdc167): cambio en `app.js` para conservar entradas manuales de tipo `SPECIAL_EFFECT` (por ejemplo, GEL) cuando se regenera la secuencia y anteponer FLASH → COOL al efecto manual.

**Limitación conocida:** la implementación de GEL conserva los efectos manuales añadiéndolos al final de la secuencia generada. No está resuelto todavía el caso general en que GEL se inserta entre dos colores y debe permanecer exactamente en esa posición. Tampoco debe darse por validada la secuencia hasta probarla en la aplicación.

## 3. Qué falta hacer, en orden recomendado

### Prioridad 1 — Validar la exportación de la Spec
1. Abrir la aplicación desde la rama `fix/ppf-final-flash-cool-stations`.
2. Cargar una Spec de prueba representativa.
3. Generar el HTML/PDF.
4. Confirmar que **Production Alerts no aparece en el documento exportado**.
5. Revisar que los demás datos, piezas, colores, estaciones, imágenes, saltos de página y formato siguen presentes y correctamente distribuidos.
6. Confirmar por separado que Production Alerts continúa apareciendo y funcionando dentro de la interfaz de la aplicación.

### Prioridad 2 — Terminar y probar la secuencia FLASH/COOL/GEL
Probar como mínimo estos casos:
- Secuencia normal con varios colores: termina en la última pasada de impresión, sin FLASH/COOL sobrante al final.
- GEL manual al final: no desaparece al regenerar la secuencia y lleva FLASH → COOL antes del GEL según la regla requerida.
- GEL manual entre dos colores: se conserva en su posición prevista y no se mueve al final.
- Regenerar la secuencia más de una vez: no duplica GEL ni estaciones.
- Guardar, volver a abrir y exportar: comprobar que la secuencia mostrada en pantalla y la secuencia del documento coinciden.

Si las reglas reales de producción requieren FLASH/COOL en otros puntos, confirmar el comportamiento esperado con ejemplos concretos antes de cambiar la lógica.

### Prioridad 3 — Registrar el resultado
Después de probar, actualizar este documento con:
- casos probados y resultado de cada uno;
- errores encontrados;
- correcciones adicionales y sus commits;
- confirmación de si los cambios siguen solo en la rama de trabajo o si se abrió/mezcló un PR.

## 4. Estado de Git y precauciones

- **Rama de trabajo:** `fix/ppf-final-flash-cool-stations`.
- **Último commit al redactar este registro:** `bf417c27fee2cd845bc6d8a9fc762b189fb9d150`.
- Los cambios descritos aquí están en la rama de trabajo.
- **No se modificó `main` como parte de estos cambios.**
- No se debe afirmar que las pruebas de navegador, HTML/PDF o secuencia pasaron: aún no están confirmadas en este punto.
- Antes de continuar en otra sesión, comprobar la rama y el último commit en GitHub; la rama puede haber recibido cambios después de la fecha de este registro.

## 5. Cómo retomar en una sesión futura

Leer este documento primero y luego abrir:
1. [El commit más reciente de este punto](https://github.com/veleztegra-create/tegra-spec-manager/commit/bf417c27fee2cd845bc6d8a9fc762b189fb9d150).
2. [El cambio de conservación de GEL manual](https://github.com/veleztegra-create/tegra-spec-manager/commit/e48c4cf833b3d91efdc485193edeb60519cdc167).
3. [El ajuste de final de secuencia](https://github.com/veleztegra-create/tegra-spec-manager/commit/1e6e84cfeaa0cb14d266045cdf07bb9cd4b9d8f8).

**Instrucción para retomar:** primero validar la eliminación de Production Alerts solo en el HTML/PDF; después terminar las pruebas de FLASH/COOL/GEL, especialmente GEL colocado entre dos colores. No reorganizar ni fusionar ramas sin revisar el estado actual de Git.
