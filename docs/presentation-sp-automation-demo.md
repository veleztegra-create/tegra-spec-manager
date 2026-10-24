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

## Correcciones integradas en la demo; prueba manual pendiente

Caso de prueba: `67NM-0JFP-9HF HOU M GAME JSY RVLY-Non Recycled`.

1. **NAME / TEAM:** se agregó una excepción específica para el estilo de demostración que devuelve `HOUSTON TEXAS` antes de consultar los mapas genéricos de ligas. Falta confirmar el resultado al importar la SWO real.
2. **Catálogo de diseñadores:** se agregó captura para `OTRO`, botones para agregar y retirar nombres y persistencia local del catálogo en el navegador. Retirar un nombre no modifica las specs ya guardadas. El catálogo todavía no se comparte entre computadoras o usuarios.
3. **Tela:** se agregó una regla limitada al estilo `67NM-0JFP-9HF` para mostrar `100% Polyester`; no es un valor por defecto para otros estilos. Falta confirmar el resultado con el archivo real.
4. **Piezas y encogimientos por placement:** el selector ahora pide el placement de destino y guarda la pieza/encogimiento dentro de ese placement. La exportación HTML/PDF muestra las piezas asociadas en los detalles del placement. Falta probar la lectura de un .ai real y confirmar que las asociaciones sobrevivan al guardar y volver a abrir una spec.
5. **Condiciones de producción y secuencia:** la UI y el motor de condiciones existen, pero la secuencia actual no consume de forma general esas condiciones para insertar, eliminar o reordenar pasos. Este punto sigue pendiente y no forma parte de estas cuatro correcciones.

Las cuatro primeras correcciones ya están integradas en el código de esta rama, pero no deben considerarse funcionalmente validadas hasta completar las pruebas manuales indicadas.

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


## Resumen ejecutivo para reunión y punto de continuidad

### Mensaje de 60 segundos

Tegra Spec Manager busca convertir la información de la SWO/Excel, Tech Pack, Schematics y patrón en una hoja técnica de serigrafía consistente, visualmente profesional y exportable a HTML/PDF. La mejora arquitectónica propuesta es sacar las condiciones variables de producción del código y administrarlas en Production Conditions. El código debe seguir siendo el motor que interpreta y aplica las reglas; Production Conditions define qué regla aplica, bajo qué alcance, con qué prioridad y con qué fuente aprobada. Así se evitan valores universales incorrectos y se pueden mantener excepciones auditables.

### Qué existe y qué no se debe prometer

- Existe una base de gestión de Production Conditions y una estructura de generación de secuencia, pero todavía hay que integrar y validar el consumo de condiciones tipadas por el motor.
- La rama de demo contiene documentación de incidencias y criterios de aceptación; documentar una regla no significa que esté implementada.
- El manejo de piezas/encogimientos debe pasar de una selección general a una asociación explícita por placement.
- La detección de equipo necesita evitar coincidencias genéricas de liga cuando el estilo requiere un nombre específico.
- El recorrido Excel → placements/colores → secuencia → HTML/PDF necesita una prueba manual integral con datos reales.

### Decisiones que conviene solicitar en la reunión

1. Confirmar quién es dueño de aprobar y mantener las Production Conditions.
2. Confirmar qué fuentes tienen prioridad cuando SWO, Tech Pack, Schematics y patrón discrepan; el sistema debe mostrar la discrepancia, no resolverla en silencio.
3. Acordar qué tipos de condición pueden bloquear una Spec y quién puede aprobar/desbloquear.
4. Confirmar qué reglas deben entrar en el primer alcance y proporcionar ejemplos reales aprobados para las pruebas.
5. Acordar si el uso inicial será local/demo o si se requiere backend compartido con permisos, historial y auditoría desde la primera liberación.

### Plan de continuación técnica

1. Auditar las reglas dispersas en los archivos actuales y clasificarlas como lógica general, dato variable, validación o comportamiento de interfaz.
2. Diseñar un esquema tipado de Production Conditions: categoría, alcance/criterios, prioridad, acción estructurada, unidades, fuente, aprobación, vigencia y estado.
3. Conectar el motor de secuencia a condiciones tipadas, sin ejecutar texto libre como código.
4. Asociar piezas y encogimientos a cada placement y conservar la evidencia original.
5. Corregir la resolución de equipo para priorizar coincidencias específicas confirmadas y pedir revisión cuando no exista una coincidencia fiable.
6. Ejecutar pruebas de regresión y un recorrido manual completo de Excel a HTML/PDF antes de presentar el flujo como validado.

### Punto de reanudación para futuras sesiones

- Repositorio: https://github.com/veleztegra-create/tegra-spec-manager
- Rama de trabajo para esta demo: `presentation/sp-automation-demo`
- Documento de referencia: `docs/presentation-sp-automation-demo.md`
- PR de demo: https://github.com/veleztegra-create/tegra-spec-manager/pull/46
- No trabajar sobre `main` ni cambiar de rama sin confirmarlo explícitamente.
- Fuente de verdad: GitHub y la rama indicada, no el ZIP adjunto.
- Último estado documentado aquí: requisitos e incidencias organizados; no asumir que las cinco incidencias están corregidas. Próximo paso: auditar el código de la rama y construir el inventario de reglas antes de cambiar el motor.
