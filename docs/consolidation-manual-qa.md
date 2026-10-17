# Validación manual antes de integrar Spec Manager

Esta lista complementa las pruebas automatizadas. No marcar una prueba como aprobada sin ejecutarla en el navegador con datos de prueba representativos.

## Importación y datos base
- [ ] Abrir la aplicación y confirmar que no aparecen errores de JavaScript al cargar.
- [ ] Importar un Excel válido y confirmar estilo, temporada, PO, cliente y colorway.
- [ ] Probar nombres de estilo representativos y revisar la detección de equipo y género.
- [ ] Importar un SWO/Tech Pack y confirmar la prioridad de los datos fuente esperada.

## Placements, tintas y colores
- [ ] Crear, editar y eliminar un placement; confirmar que la cantidad y el orden son correctos.
- [ ] Editar un nombre de tinta y un Pantone, incluido escribir `485 C` y presionar Enter: no debe aparecer ningún placement nuevo.
- [ ] Confirmar que el valor del Pantone permanece después de quitar el foco y volver al campo.
- [ ] Verificar las reglas de tinta aplicables (WATERBASE, PLASTISOL y SILICONE) con casos representativos.
- [ ] Confirmar que los colores y sus nombres se resuelven correctamente desde las bibliotecas disponibles.
- [ ] Guardar, recargar la aplicación y comprobar qué datos persisten y cuáles no, sin asumir persistencia si no está configurada.

## Salida
- [ ] Generar la hoja/PDF con una especificación representativa.
- [ ] Revisar visualmente cortes de página, alineación, legibilidad, placements, Pantones y tipo de tinta.
- [ ] Comparar el PDF contra los datos fuente para verificar que no falte ni se duplique información.

## Resultado
Registrar navegador, archivo de prueba, fecha, incidencias y resultado. Mantener el PR en borrador hasta completar los puntos aplicables. No fusionar ni reemplazar `main` como parte de esta validación.
