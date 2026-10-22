# Demo de Tegra Spec Manager — Automatización de Screen Printing

## Propósito de esta rama

`presentation/sp-automation-demo` reúne en una sola versión de demostración la base candidata del Spec Manager y los cambios recientes de lectura de patrón e integración de piezas seleccionadas en la Spec. Es una rama de demostración; no modifica `main` ni representa todavía una liberación aprobada para producción.

## Qué puede demostrarse en la aplicación

- Importación de información de la orden desde Excel/SWO y lectura de datos generales del estilo.
- Creación y edición de placements en la Spec.
- Reglas existentes para tipo de tinta y generación de secuencia de impresión.
- Gestión de colores, parámetros de impresión y exportación de la Spec a HTML/PDF.
- Lectura local de etiquetas de piezas y encogimientos declarados en archivos Illustrator compatibles.
- Búsqueda de piezas por nombre o abreviatura, selección de piezas relevantes y visualización de las piezas seleccionadas en los metadatos de la Spec.
- Conservación de referencias del patrón y de la información de encogimiento declarada, con advertencia de que extraer el dato no prueba que el encogimiento se haya aplicado geométricamente.

## Incidencias reportadas durante la prueba con SWO

Caso de prueba: `67NM-0JFP-9HF HOU M GAME JSY RVLY-Non Recycled`.

1. **NAME / TEAM incorrecto:** el campo devuelve `Houston Rockets`, pero para este estilo el valor requerido es `HOUSTON TEXAS`. No se debe resolver una abreviatura de ciudad buscando primero en una liga genérica; la identificación debe priorizar una regla de estilo/equipo confirmada o dejar el valor pendiente de confirmación.
2. **Catálogo de diseñadores incompleto:** existe la opción `OTRO`, pero no un campo visible para capturar el nombre. Se necesita administrar el catálogo para agregar nuevos nombres y retirar diseñadores de las opciones sin alterar documentos históricos ya guardados.
3. **Tela no completada:** en este caso el valor esperado es `100% Polyester`. Debe extraerse de una fuente de estilo documentada o de una regla específica confirmada, no asignarse como valor universal.
4. **Piezas y encogimientos separados de los placements:** la selección global de piezas no permite elegir la pieza de patrón relevante dentro del placement que se está preparando. La asociación debe hacerse por placement, conservar la referencia de pieza y mostrar el encogimiento de esa pieza cuando exista.
5. **Condiciones de producción y secuencia:** la UI y el motor de condiciones existen, pero la secuencia actual no consume de forma general esas condiciones para insertar, eliminar o reordenar pasos. Se debe distinguir explícitamente entre recordatorios, parámetros técnicos, reglas que alteran la secuencia y validaciones bloqueantes.

Estas incidencias son criterios de aceptación pendientes; no se deben presentar como corregidas hasta que se implementen y se prueben.

## Flujo de demostración recomendado

1. Abrir la aplicación desde esta rama.
2. Cargar una SWO/Excel de prueba con datos completos.
3. Revisar los datos generales que se importaron y corregir los que sea necesario.
4. Crear o revisar los placements y los colores de un caso de prueba.
5. Cargar un patrón Illustrator compatible, buscar por abreviatura (por ejemplo, `FT`, `BK` o `SLV`) y agregar solo las piezas necesarias a la Spec.
6. Revisar la secuencia que genera el motor de reglas; contrastarla con la secuencia aprobada por producción.
7. Exportar HTML/PDF y comprobar que los datos, las imágenes y las referencias de piezas sean legibles.

## Diseño propuesto para Production Conditions

Cada condición debe tener una categoría explícita de efecto:

- **REMINDER:** muestra un mensaje; no modifica la secuencia.
- **PROCESS_PARAMETER:** aporta valores técnicos aprobados (por ejemplo, temperatura/tiempo) para una tinta, tejido, técnica o equipo dentro de su alcance.
- **SEQUENCE_RULE:** indica una acción estructurada y validada que el motor de secuencia debe ejecutar, como requerir una base o añadir un paso intermedio.
- **VALIDATION:** verifica requisitos y puede marcar la Spec como incompleta o bloquear la aprobación si falta un dato crítico o hay una contradicción.

Cada regla debería registrar sus criterios de aplicación, prioridad, acción, unidades, fuente/aprobación y vigencia. No convertir mensajes de texto libre en lógica ejecutable ni inferir parámetros de curado sin una fuente aprobada. El motor general debe leer estos datos desde Production Conditions; no se deben duplicar excepciones dentro de varios archivos JavaScript.

## Reglas de producción que deben confirmarse con el piso

Estas reglas se han definido como requisitos del proceso, pero **no deben presentarse como implementadas hasta que se comprueben en el código y con casos reales**:

- La SWO identifica el trabajo solicitado; no determina por sí sola todos los placements.
- Los números Front, Back y TV/Shoulder son tres placements independientes.
- Swoosh-Sleeve y Sleeve Stripes son, cada uno, un solo placement/página que representa ambas mangas.
- Player Name debe relacionarse con la zona de espalda; `NAMEPLATE` es una referencia del patrón y no debe convertirse automáticamente en un placement independiente.
- Tech Pack y Schematics deben contrastarse por pieza. Las discrepancias se deben señalar sin sobrescribir silenciosamente la evidencia original.
- Las técnicas fuera del alcance de Screen Printing (por ejemplo, Silicone Heat Transfer) pueden conservarse para trazabilidad, pero no deben producir instrucciones de serigrafía.
- Para serigrafía sobre Twill, la regla acordada requiere tres referencias de arte: tamaño real, escala al 101 % y expansión geométrica del contorno 4 mm hacia afuera por cada lado para el rebase del corte láser.

## Validación pendiente antes de usarla como demostración formal

- Repetir la importación del estilo de prueba y comprobar los valores exactos de NAME / TEAM y tela.
- Probar la gestión de diseñadores: agregar, seleccionar y retirar un nombre del catálogo sin cambiar specs guardadas.
- Probar un patrón real del piso y asociar cada pieza/encogimiento desde el placement correcto.
- Comparar la secuencia generada con una secuencia aprobada por producción.
- Probar un caso con impresión sobre Twill y confirmar las tres referencias de tamaño; si la función no está implementada, mostrarlo como requisito pendiente, no como capacidad.
- Revisar un caso con técnicas contradictorias entre Tech Pack y Schematics.
- Revisar visualmente la exportación HTML/PDF y confirmar que no se pierdan datos.
- Anotar qué validaciones son automáticas, cuáles son manuales y quién aprueba las reglas.

## Criterio de presentación

La demo debe distinguir claramente entre:
- **Disponible en el código de esta rama**.
- **Pendiente de validar con archivos reales**.
- **Regla de producción acordada, todavía pendiente de implementar o verificar**.

No se debe afirmar que la rama está lista para producción solo porque pasen las pruebas automatizadas.
