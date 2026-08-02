# Plan de port · El Poemario → El Fabulario

**Objetivo:** traer a El Fabulario el rediseño *inmersivo/editorial* que hizo grande a El Poemario, **conservando la identidad Art-Déco marfil de Fabulario como tema único y permanente**.

## Decisiones firmes (base de todo el plan)
- **El Fabulario siempre será día.** No se porta la maquinaria día/noche (era la pieza estrella de Poemario, pero aquí queda descartada). Fabulario mantiene su paleta Art-Déco (oro / esmeralda / coral / zafiro sobre marfil) como tema único.
- **El Taller métrico NO se porta.** El escáner de sílabas/sinalefa/rima es intrínsecamente poético; una fábula no se escanea. (Opción futura distinta: un "taller de la moraleja", fuera de este plan.)

## Punto de partida (foto de `main`, tarball fresco)
Fabulario está congelado en su **Fase 2 · Art-Déco marfil**: tema único claro, sin día/noche. Arquitectónicamente es *el Poemario de antes del rediseño inmersivo*. Comparten esqueleto (Header, Footer, Buscador, EntradasTabs, CartaHeader, SpotifyEmbed, CMS Decap con `oauth-proxy`, colección `destacado` polimórfica idéntica).

**Gap habilitador:** Poemario introdujo el campo **`foco`** (punto focal vertical %, 0–100) en `poemas`/`autores`/`entradas`, que alimenta el recorte 8:3 de `HeroInmersivo`. Fabulario **no lo tiene**. La imaginería sí existe (`ilustracion` en fábulas, `imagen` en autores), pero sin control de encuadre. Sin `foco`, ningún hero inmersivo queda bien.

---

## Fases

### Fase 0 · Cimientos (sin cambio visible)
Habilita todo lo demás; no altera el sitio a ojos del lector.
1. Añadir helper `optionalFoco()` y el campo `foco` a los esquemas `fabulas`, `autores` y `entradas` en `content.config.ts`.
2. Exponer `foco` en `public/admin/config.yml` (Decap) para cada colección con imagen.
3. Añadir constante `FOCO_RETRATO` a `consts.ts` (default de encuadre para retratos de autor).
4. (Opcional, consistencia) Introducir un layout `Base.astro` — hoy la home de Fabulario compone `Header`/`BaseHead`/`Footer` sueltos; Poemario los centraliza en `Base.astro`. Reduce duplicación antes de tocar más páginas.

*Riesgo:* nulo. Campos opcionales con default; el build no cambia salida.

### Fase 1 · Portada inmersiva
5. Portar `HeroInmersivo.astro` (147 líneas) **adaptado a la paleta Art-Déco día** → reemplaza el bloque `Destacado` de la home. Usa el `foco` del elemento destacado.
6. Portar `FilaPoema.astro` → nuevo `FilaFabula.astro` (filas ilustradas) para las "últimas fábulas", en lugar de la rejilla `FabulaCard` actual.

*Riesgo:* bajo. La colección `destacado` ya es idéntica; solo cambia el render.

### Fase 2 · Índice ilustrado de fábulas
7. Dar a `FabulaCard.astro` el tratamiento inmersivo de `PoemaCard` (ilustración + encuadre).
8. Aplicar el nuevo tratamiento a `/fabulas/index.astro` y a `ListadoFabulasTaxonomia.astro`.

### Fase 3 · Inmersión de autores
> **Contexto (usuario, 2026-08-01):** Fabulario tendrá **muy pocos autores** — un puñado de fabulistas canónicos (Esopo, La Fontaine, Samaniego, Iriarte, Fedro…), no los miles de poetas de Poemario. Esto **no** rebaja la ficha inmersiva de autor (al contrario: siendo pocos y canónicos, cada uno merece una página rica), pero **sí vuelve innecesaria la navegación facetada de autores**.
9. Portar el layout `Autor.astro` (423 líneas: ficha hero con retrato + bio + obras del autor) → `/autores/[slug].astro`. **Núcleo de la fase.**
10. Portar `AutorCard.astro` (tiles) para `/autores/index.astro` como **rejilla plana** — con tan pocos autores, una cuadrícula simple basta.
11. ~~`ExplorarAutoresPor.astro` (facetas nacionalidad/siglo/tradición)~~ · **Descartado**: sin volumen de autores no aporta. Si algún día crecen, se reconsidera.

### Fase 4 · Navegación por facetas
12. Portar `ChipsFacetas.astro` y `GrillaTerminos.astro` sobre los ejes **con volumen real** de Fabulario: **personajes, temas, formas (verso/prosa), tradiciones** (en Poemario eran tipos/movimientos/temas/motivos/nacionalidades). El eje *autor* se excluye a propósito (ver Fase 3): son pocos y se navegan mejor desde la rejilla plana de `/autores`.

### Fase 5 · Pulido
13. Fundido de ilustraciones al fondo real (adaptación de #558/#559) — **más simple aquí**: un solo fondo marfil, sin "línea de noche" que resolver.
14. Auditoría de contraste WCAG del resultado con la paleta Art-Déco (reutilizar el método de Poemario).

---

## Fuera de alcance (explícito)
- Tema día/noche · **descartado por decisión de producto** (Fabulario siempre día).
- El Taller métrico · no aplica al dominio de la fábula.

## Notas de dominio (poema → fábula)
- Taxonomías distintas: Fabulario usa `personajes`, `temas`, `forma` (verso/prosa), `tradicion`. Poemario usaba `tipo`, `movimiento`, `temas`, `motivos`, `nacionalidad`, `lengua`.
- `autores.tipo`: Fabulario `clasico | colaborador`; Poemario añadió `director`. Menor; sin impacto en el port.
- Fabulario tiene `fabula.forma` y `fabula.tradicion` que Poemario no; son ejes de faceta extra en Fase 4.

## Orden recomendado de ejecución
Fase 0 primero (imprescindible y sin riesgo) → luego Fase 1 (máximo impacto visible) → 2 → 3 → 4 → 5. Cada fase es un PR independiente y desplegable.
