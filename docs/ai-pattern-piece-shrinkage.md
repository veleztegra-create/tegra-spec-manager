# Buscador de piezas y encogimientos desde Illustrator

La pestaña **Piezas y encogimientos** analiza un archivo .ai compatible con PDF en el navegador usando PDF.js. No requiere llamadas al backend ni guarda el archivo.

## Flujo
1. Seleccionar el archivo .ai.
2. Extraer el texto de las páginas.
3. Buscar etiquetas Piece Name, deduplicar por nombre y encogimiento y mostrar la lista.
4. Seleccionar una pieza para ver/copiar el texto detectado.

## Limitaciones conocidas
- El archivo debe guardarse desde Illustrator con **Crear archivo compatible con PDF** activado.
- Las etiquetas deben conservar texto seleccionable; texto convertido a contornos no se puede extraer como texto.
- El extractor reporta el encogimiento declarado en la etiqueta; no comprueba transformaciones geométricas ni confirma que el encogimiento se aplicó físicamente al patrón.
- Los resultados dependen de cómo PDF.js reconstruya el orden de los textos. Validar con distintos archivos reales antes de usar como control de producción.
