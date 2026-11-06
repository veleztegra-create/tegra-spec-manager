# Regla de secuencia: tela White / Natural

## Alcance

Esta regla aplica a la generación de secuencia **Waterbase** cuando la tela se identifica como White, Natural o Blanco. No depende de que el estilo o el SWO indique Carry Over.

Los códigos de colorway también pueden activar la regla cuando el catálogo maestro los resuelve a un nombre White/Natural.

## Secuencia

| Orden | Tipo | Letra | Tinta | Malla | Aditivos |
|---|---|---|---|---|---|
| 1 | White Base | B | Aquaflex V2 | 110/64 | 0.25% Aquarius Thickener · 10% Aquaflex V2 Neutral |
| 2 | White Base | B | Aquaflex V2 | 122/55 | — |
| 3 | White Base | B | Aquaflex V2 | 122/55 | — |
| 4+ | Colores de diseño | Según reglas existentes | Según reglas existentes | Según reglas existentes | Según reglas existentes |

**No se agrega Blocker (A)** en esta regla. Los aditivos especiales solo se asignan a la primera base.

## Reglas que permanecen sin cambios

- Telas oscuras.
- Telas claras que no sean White/Natural (por ejemplo, Cream).
- Plastisol, incluyendo Fanatics/GFS.
- Silicone.
- Configuración de mallas y aditivos de los colores de diseño.
- Reglas de Production Conditions / Direct to Blocker.

## Validación técnica realizada

Prueba aislada de `RulesEngine.generarSecuencia()`:

- White → 3 bases B; sin Blocker; aditivos solo en la primera.
- Natural → 3 bases B; sin Blocker; aditivos solo en la primera.
- Código de colorway que el catálogo resuelve a Natural → mismo resultado.
- Navy → regla de tela oscura conserva Blocker.
- Cream → secuencia clara anterior conserva Blocker.
- Plastisol sobre White → regla Plastisol conserva su configuración.

La validación fue ejecutada de forma aislada en JavaScript; todavía requiere comprobación visual en el navegador y generación de un PDF real.
