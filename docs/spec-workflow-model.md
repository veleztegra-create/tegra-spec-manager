# Modelo de workflow para Specs compartidas

## Regla de producción

Una Spec puede estar vinculada a varias PO y stages cuando corresponden al mismo arte y se ha confirmado que deben compartir una única secuencia de serigrafía. No se duplica la secuencia por cada PO.

La relación es:

```text
Style / Artwork
      |
      +-- Spec compartida (una secuencia)
              |
              +-- PO A / DEV 1st Proto
              +-- PO B / Size Set
              +-- PO C / otro stage solicitado
              |
              +-- Ronda 1: enviada -> devuelta
              +-- Ronda 2: enviada -> devuelta
              +-- ...
```

## Entidades y responsabilidades

- **Style / Artwork:** identifica el arte. El estilo por sí solo no basta para fusionar órdenes.
- **PO / Order:** conserva su PO y stage propios, aunque comparta la Spec.
- **Spec:** contiene una sola secuencia para el arte compartido.
- **Review round:** registra cada envío y devolución del archivo. No es lo mismo que un stage.
- **Supervisor validation:** registra lo que declara el archivo devuelto. Sin autenticación externa, se etiqueta como `FILE_DECLARATION`, no como identidad verificada.

## Contrato de datos inicial

El campo `specWorkflow` acompaña a la Spec y contiene:

- `id`: identificador estable de la Spec/workflow.
- `status`: estado general del intercambio.
- `sequenceScope`: `SHARED_ARTWORK`.
- `artwork`: clave/revisión de arte y confirmación explícita de que las órdenes comparten arte.
- `orders[]`: PO, stage, SWO y estado de vinculación.
- `currentRound`: última ronda de revisión.
- `targetRounds`: objetivo operativo inicial de 8 rondas; no limita el historial.
- `reviewHistory[]`: archivo enviado, archivo devuelto, fechas, responsable y declaración de validación.

Las órdenes retiradas se conservan con estado `REMOVED`; no se borran del historial.

## Reglas de seguridad e integridad

1. No fusionar órdenes automáticamente solo porque coincidan en estilo, cliente o temporada.
2. Compartir una secuencia requiere confirmar que es el mismo arte.
3. Una PO/stage adicional se vincula a la Spec existente; no crea una segunda secuencia si comparte el arte confirmado.
4. Si el arte cambia y requiere una secuencia distinta, debe originarse otra Spec/workflow.
5. Cada envío y devolución genera una ronda nueva; nunca se sobrescribe la ronda anterior.
6. Un nombre escrito en el HTML no autentica a Aníbal. El sello se conserva como declaración del archivo hasta que exista una plataforma con identidad verificada.
7. La cantidad 8 es un objetivo operativo, no un límite de base de datos.

## Límite conocido del extractor SWO actual

`features/excel-automation.js` actualmente extrae un único `po` y un único `sample` en `generalData`. El nuevo contrato de workflow permite conservar múltiples órdenes, pero **no activa todavía la extracción automática de múltiples PO/stages**. Esa extracción requiere un archivo SWO real representativo para mapear con precisión las filas/campos y evitar asociar una PO al stage incorrecto.

## Próximas fases

1. Probar la lectura con SWO reales que contengan una PO y varias PO/stages.
2. Mostrar las órdenes detectadas y permitir confirmar qué órdenes comparten el arte.
3. Exportar el manifiesto `specWorkflow` dentro del HTML de la Spec.
4. Actualizar el editor de tablet para conservar metadatos, registrar la declaración de validación y devolver el archivo.
5. Importar en Tegra Spec Manager, comparar antes/después y aceptar cambios sin sobrescribir el historial.
