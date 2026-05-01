# Migración de la taxonomía (mayo 2026)

Archivos de un solo uso, conservados para auditoría.

## Contexto

El blog usaba un único campo `etiquetas: string[]` por fábula con
vocabulario libre. El resultado: 569 ocurrencias repartidas en 426
etiquetas únicas, el 92 % con una sola aparición. Cero capacidad real
de agrupar contenido.

Se reemplazó por cuatro campos con vocabulario controlado:

- `personajes` (lista cerrada, opcional, humano genérico implícito)
- `temas` (lista cerrada, al menos uno obligatorio)
- `forma` (`prosa` | `verso`, obligatorio)
- `tradicion` (lista cerrada, opcional)

La fuente de verdad de los slugs y displays vive en
`src/utils/taxonomia.ts`.

## Archivos

- **`etiquetas-actuales.csv`** — inventario inicial: las 426 etiquetas
  viejas con su frecuencia.
- **`mapeo-etiquetas.csv`** — decisión por etiqueta vieja:
  `map | discard` y, si `map`, los `campo:slug` de destino. 207 mapeadas,
  219 descartadas.
- **`migrar-etiquetas.ps1`** — script idempotente que aplicó el mapeo
  al frontmatter de los 76 archivos en `src/content/fabulas/`. Incluye
  overrides embebidos para los archivos cuyas etiquetas viejas eran
  insuficientes y heurística de detección de forma (verso/prosa) por
  longitud de líneas del cuerpo.

## Reusabilidad

El script no está diseñado para ejecutarse de nuevo: las fábulas ya
no tienen el campo `etiquetas`. Si en el futuro hay que rehacer una
migración similar (por ejemplo, al traer contenido nuevo desde otra
fuente con etiquetas planas), sirve como referencia del patrón:

1. Inventario de etiquetas viejas → CSV de frecuencias.
2. Decisión manual de mapeo en CSV editable.
3. Script idempotente con dry-run, overrides por archivo y reporte
   de tags no cubiertas / archivos sin clasificar.
