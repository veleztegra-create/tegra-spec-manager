# Buscador de piezas y encogimientos desde Illustrator

La pestaña **Piezas y encogimientos** analiza archivos .ai localmente en el navegador. Primero extrae las cadenas de texto nativas de Illustrator/PostScript y usa PDF.js como alternativa para documentos con compatibilidad PDF. No requiere llamadas al backend ni guarda el archivo.

## Flujo
1. Seleccionar el archivo .ai.
2. Extraer texto nativo de Illustrator; si no hay etiquetas legibles, intentar extraer texto mediante PDF.js.
3. Buscar etiquetas Piece Name, deduplicar por nombre y encogimiento y mostrar la lista.
4. Seleccionar una pieza para ver/copiar el texto detectado.

## Limitaciones conocidas
- Las etiquetas deben conservar texto seleccionable; texto convertido a contornos no se puede extraer como texto.
- El extractor reporta el encogimiento declarado en la etiqueta; no comprueba transformaciones geométricas ni confirma que el encogimiento se aplicó físicamente al patrón.
- Los resultados dependen de cómo el archivo almacene las cadenas y, para PDF.js, de cómo se reconstruya el orden de los textos. Validar con distintos archivos reales antes de usar como control de producción.
