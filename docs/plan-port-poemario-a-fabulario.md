# Plan de rediseño · El Fabulario

**Objetivo:** llevar a El Fabulario el rediseño *inmersivo/editorial*, **conservando la identidad Art-Déco marfil como tema único y permanente**.

> **Actualización (2026-08-02):** ya existe un **handoff de diseño de alta fidelidad, nativo de Fabulario** — no una adaptación de Poemario. Cubre las cinco vistas públicas con tokens, tipografía y layout **definitivos**. Ese handoff es ahora la **fuente de verdad visual** de este plan.
> - Spec (verbatim): [`docs/rediseno/spec-handoff.md`](rediseno/spec-handoff.md)
> - Maqueta navegable de las 5 vistas: [`docs/rediseno/maqueta-cinco-vistas.html`](rediseno/maqueta-cinco-vistas.html) (ábrela en el navegador; la barra negra superior es andamiaje de la maqueta, no va a producción)
>
> El plan de fases sigue siendo válido como **secuencia de trabajo**; lo que cambia es que cada fase deja de apuntar a "componente de Poemario adaptado" y pasa a apuntar a **una vista concreta del handoff**. Poemario sigue siendo referencia de *implementación* (cómo resolvió el recorte con `foco`, el fundido de ilustraciones, etc.), no de *aspecto*.

## Decisiones firmes (base de todo el plan)
- **El Fabulario siempre será día.** No hay maquinaria día/noche. Paleta Art-Déco (oro / esmeralda / coral / zafiro sobre marfil) como tema único. *(El handoff lo confirma: "No hay modo noche".)*
- **La acción principal es LEER.** Escuchar es complementario y siempre ocurre dentro del embed de Spotify. Los metadatos dicen **"Lectura · N min"**, nunca "Audio".
- **El Taller métrico NO se porta.** El escáner de sílabas/sinalefa/rima es intrínsecamente poético. (Opción futura distinta: un "taller de la moraleja", fuera de este plan.)
- **Geometría radio-0.** Esquinas rectas en todo el sitio; única excepción, el embed de Spotify (12px, chrome de terceros). Sin sombras difusas: la jerarquía se construye con **filetes dorados** de 0.5–1.5px.

## Estado actual (contra `origin/main`, 2026-08-02)
- **Fase 0 · Cimientos — HECHA** (PR #347). `foco` (`optionalFoco`) está en los esquemas `fabulas`/`autores`/`entradas` de `content.config.ts`, expuesto en Decap (`public/admin/config.yml`) y con `FOCO_RETRATO = 15` en `consts.ts`.
  - *Nota de reconciliación:* el repo usa **default `foco = 8`**; la maqueta del handoff usaba `0`. El `8` del repo es correcto y se mantiene (el `0` era placeholder de maqueta).
  - *Pendiente opcional:* el layout `Base.astro` no existe aún (la home compone `Header`/`BaseHead`/`Footer` sueltos). Sigue siendo un buen paso previo de des-duplicación.
- Componentes vigentes: `Header`, `Footer`, `BaseHead`, `Buscador`, `Destacado`, `EntradasTabs`, `FabulaCard`, `ListadoFabulasTaxonomia`, `NavegacionFabulas`, `SpotifyEmbed`, `EscuchaEnSpotify`, `CartaHeader`, `LogoMark`. Un único layout: `Fabula.astro`.
- Páginas ya existentes: `/`, `/fabulas`, `/autores`, `/entradas`, `/buscar`, `/personajes`, `/temas`, `/formas`, `/tradiciones`, `/traducciones`, `/colaborar`, `/correspondencia`, `/sobre`.
- **Nav — YA aplicado (2026-08-02):** el header muestra **Inicio · Fábulas · Autores · Bitácora · Contacto · Acerca de** + lupa de búsqueda. (Ver Fase A.6.)

---

## Fase A · Cimientos de sistema visual (transversal) — **HECHA (2026-08-02)**
Al revisar el codebase se comprobó que el sistema visual **ya existía** de trabajo previo (los tokens llevan la nota "Fase 2 · v1") y **ya coincide con los valores definitivos del handoff**. Solo faltaban dos remates, ya aplicados. Detalle:

1. **Tokens de color** — YA en [`src/styles/tokens.css`](../src/styles/tokens.css), idénticos al handoff: `--color-marfil #F0E5CE` · `--color-negro #1A1714` · `--color-oro #C9A14A` · `--color-oro-texto #7A5F1F` · `--color-esmeralda #0A5F3E` · `--color-coral #D45B3C` · `--color-zafiro #1C3A7A` · `--color-text-soft #4A413A`. **Añadido ahora:** `--color-marfil-alt #EBDDBF` (hover de fichas de autor, Fase 4). Las reglas de uso WCAG ya están documentadas en el propio archivo.
2. **Tipografía** — YA autoalojada vía `@fontsource` en [`BaseHead.astro`](../src/components/BaseHead.astro) (Cinzel 400/700, Cormorant Garamond 400/400-italic/600). Familias y escala fluida (`--fs-*`, `--ls-*`) en `tokens.css`.
3. **Primitivas de filete** — YA en [`global.css`](../src/styles/global.css): `.frame` (doble encuadre `border` + `::before inset`), grosores `--rule-hairline/thin/medium/thick`, `.invert` (reverso oscuro con sus enlaces oro→coral).
4. **Enlaces globales** — YA: `--color-link` zafiro / `--color-link-hover` esmeralda.
5. **Anillo de foco de teclado** — YA: `:focus-visible { outline: 2px solid var(--color-zafiro); outline-offset: 3px }` en `global.css` (exactamente la sugerencia del handoff).
6. **Nav del header** — APLICADO ahora en [`Header.astro`](../src/components/Header.astro): **Inicio · Fábulas · Autores · Bitácora · Contacto · Acerca de** + lupa de búsqueda.
   - Añadido el enlace a `/autores` (antes no estaba).
   - Etiqueta "Correspondencia" → **"Contacto"** (ruta sigue siendo `/correspondencia`).
   - El estado activo (subrayado dorado) ya lo resolvía `HeaderLink.astro` con la clase `.active`.
   - La búsqueda es la **lupa** (`Buscador.astro`), no un enlace de texto — confirmado por el usuario.

*Pendiente menor (no bloquea):* verificar en Fase 6 que la escala de tracking en mayúsculas de Cinzel llega hasta `0.30em` donde el handoff lo pide (hoy el token máximo es `--ls-widest: 0.2em`; puede necesitar un `--ls-hero`/eyebrow más abierto).

*Referencia handoff:* §Design Tokens, §0 (cabecera/pie), §Interactions (foco de teclado, nav activa).

## Fase 1 · Portada inmersiva — **HECHA (2026-08-02)**
Reemplaza el bloque `Destacado` + rejilla `FabulaCard` de la home. Orden de la vista: **cabecera → hero → filete doble → banda de título → bloque Spotify → Últimas fábulas → Explorar → pie.**

> **Estado:** implementada y luego **rehecha a la dirección «Cartelera»** (segundo handoff, [`spec-portada-cartelera.md`](rediseno/spec-portada-cartelera.md)), que resuelve el exceso de aire y la monotonía de la lista.
> - `HeroInmersivo.astro`: hero a sangre con `foco` + filete doble + banda de título. **Altura parametrizable** — la portada usa **300px fijos** (recorte bajo que densifica); queda 8:3 disponible para la ficha de fábula (Fase 3). Reemplazó el hero de texto y `Destacado.astro` (eliminado).
> - `FichaFabula.astro` + `utils/lectura.ts` → "Últimas fábulas" es una **rejilla de 5 fichas encuadradas (3:2) + cartela de archivo** con el total en letra (`utils/numeroEnLetras.ts`). *(La primera versión eran filas alternas `FilaFabula.astro`, ya eliminado.)*
> - `EscuchaEnSpotify.astro`: banda pódcast a sangre compacta; **CTA con texto negro sobre coral** (corrige contraste — marfil sobre coral no cumple AA).
> - **Explorar** en banda `marfil-alt` con numerales de 26px en oro y cuatro ejes: tradición / autor / forma / moraleja. *(Resuelve la antigua duda de destinos: se adoptan los ejes del handoff Cartelera.)*
> - Tokens añadidos: `--ls-eyebrow: 0.28em`, `--fw-medium: 500`, `--color-marfil-alt: #EBDDBF`.
> - **Tipografía**: corregida la escala de pesos de Cinzel (400/500/600, sin 700) en todo el sitio (commits `86288c2`, `e3d07d6`).

7. **Hero** a sangre `aspect-ratio: 8/3`, `min-height: 520px`, `object-fit: cover`, con `object-position: 50% <foco>%` del destacado. Fondo de respaldo (radial + linear gradient) mientras carga. **La cabecera nunca se superpone a la ilustración** (decisión explícita del handoff).
8. **Banda de título** bajo el filete doble (no velo sobre la imagen — de los tres tratamientos evaluados se eligió la **banda inferior**, que mantiene la ilustración intacta y garantiza AA): eyebrow "FÁBULA DEL MES", H1 Cinzel, byline en cursiva esmeralda, y lede a la derecha con `border-left` dorado.
9. **Bloque Spotify** (nuevo respecto al plan anterior): banda fondo negro con filete oro, eyebrow "PÓDCAST · SPOTIFY", frase en Cormorant marfil y **CTA coral** a la derecha (fondo `--coral`, hover invertido a negro con texto/borde coral). Es el único uso de coral como fondo de botón.
10. **Últimas fábulas**: cuatro **filas ilustradas** (no rejilla), separadas por filete atenuado, imagen `aspect-ratio: 4/3` **alternando lado** (`row` / `row-reverse`). Eyebrow con autor en esmeralda, título Cinzel, resumen en cursiva, filete corto y metadatos "Tradición · Forma · N min". → nuevo componente `FilaFabula.astro`.
11. **Explorar** (nuevo): `grid auto-fit minmax(220px,1fr)`, cuatro columnas con **numeral romano I–IV** en Cinzel oro, título y glosa en cursiva. Enlaza a los cuatro ejes con volumen (personajes / temas / formas / tradiciones — ver Fase 4).

*Riesgo:* bajo-medio. La colección `destacado` ya es polimórfica idéntica; el grueso es render nuevo + dos secciones nuevas (Spotify, Explorar).

*Referencia handoff:* §1 · Portada.

## Fase 2 · Índice ilustrado de fábulas (`/fabulas`)
12. **Filas** (no rejilla): cada fila es un `<a>` completo con miniatura **`aspect-ratio: 3/2`** (proporción nativa de las ilustraciones — **no** recortar a 4:3), bloque de texto (eyebrow autor esmeralda + título Cinzel + resumen cursiva) y columna de metadatos "tradición / forma / **Lectura · N min**". Hover: velo dorado al 10%. → rediseño de `FabulaCard.astro` o nuevo `FilaFabulaListado`.
13. **Barra de filtros — SOLO dos criterios: Tema y Autor.** Pastillas activa (fondo negro, texto marfil) / inactiva (borde oro atenuado, texto zafiro). Los temas llevan recuento ("Avaricia · 24"); los autores no. Orden a la derecha en cursiva.
    - **Reconciliación con la antigua Fase 4:** el handoff **simplifica** el listado a Tema + Autor, en lugar del facetado multi-eje que preveía el plan. Las taxonomías por personajes/formas/tradiciones **siguen existiendo como páginas propias** (`/personajes`, `/temas`, …) y se alcanzan desde "Explorar" (Fase 1) y desde los chips de la fábula individual, **no** desde una barra de facetas compleja en el listado. Ver Fase 4.
14. **Paginación** en numerales romanos; activo en negro con `border-bottom` oro; "SIGUIENTE PÁGINA →" a la derecha. Estado en la **URL** (`?tema=&autor=&pagina=`), no en cliente.
15. Aplicar el mismo tratamiento de fila a `ListadoFabulasTaxonomia.astro` (vistas `/personajes/<x>`, `/temas/<x>`, etc.).

*Referencia handoff:* §2 · Listado de fábulas.

## Fase 3 · Fábula individual (`/fabulas/<slug>`) — **rediseño mayor, faltaba en el plan**
El plan anterior **no contemplaba esta vista como fase**, pero el handoff la rediseña por completo. Es el corazón del sitio (la acción es leer). Rehace el layout `Fabula.astro`.

16. **Ilustración a sangre 8:3** (`min-height: 420px`, mismo mecanismo de `foco`), sin texto encima → filete doble.
17. **Encabezado**: migas de pan, H1, byline en cursiva esmeralda, línea de metadatos con separadores `·` en oro (origen · forma · "Lectura N min" · crédito de ilustración).
18. **Embed de Spotify** real bajo eyebrow "NARRACIÓN · SPOTIFY": `<iframe .../embed/episode/<id>>` estándar, `max-width: 640px`, `height: 152px`, radio 12px. **No maquetar reproductor propio.** (Reutiliza `SpotifyEmbed.astro`.)
19. **Cuerpo a dos columnas**:
    - **Artículo** (`max-width: 720px`): párrafos 20px/1.75 con **capitular** (Cinzel 76px `--oro-legible`) en el primero; **cita destacada** con filetes dorados arriba/abajo en cursiva zafiro; **caja de MORALEJA** con filete oro (eyebrow "MORALEJA" + frase en cursiva) — elemento propio del dominio fábula; chips de temas al final (estilo pastilla inactiva).
    - **Aside sticky** (`position: sticky; top: alto-cabecera + holgura`): ficha del autor (miniatura 3:2 84px, nombre, fechas, glosa, "VER SUS N FÁBULAS →") + bloque "SEGUIR LEYENDO" con tres fábulas.

*Riesgo:* medio. Es la plantilla con más piezas nuevas (moraleja, capitular, cita, aside sticky).

*Referencia handoff:* §3 · Fábula individual.

## Fase 4 · Autores (`/autores` + `/autores/<slug>`)
> **Contexto (usuario, 2026-08-01):** Fabulario tendrá **muy pocos autores** (Esopo, La Fontaine, Samaniego, Iriarte, Fedro… ~10 hoy). Cada uno merece página rica, pero **no** hace falta navegación facetada de autores.

20. **`/autores` — rejilla plana**, sin paginación ni filtros (diseñada para <20–30 autores). `grid auto-fill minmax(300px,1fr)` con gap real. **Ficha**: retrato `aspect-ratio: 3/2` sobre fondo negro con filete inferior, nombre Cinzel, "fechas · N fábulas" en oro legible, glosa en cursiva; hover `--hover-ficha`. Cierre con frase en cursiva + CTA coral "PROPONER UN AUTOR". → nuevo `AutorCard.astro`. **El párrafo introductorio debe citar el número real de fichas.**
21. **`/autores/<slug>` — ficha de autor** con **cabecera invertida** (fondo negro, retrato 3:2 con doble encuadre, eyebrow "FABULISTA · <PAÍS>", H1 marfil, línea de vida en cursiva) → semblanza + ficha lateral (caja con pares etiqueta/valor + CTA coral "LEER SUS FÁBULAS") → sección "Sus fábulas" (rejilla con numerales romanos). → nuevo layout `Autor.astro`.

*Referencia handoff:* §4 · Listado de autores, §5 · Ficha de autor.

## Fase 5 · Navegación por ejes (taxonomías) — reducida
El handoff no pide un motor de facetas: el listado ya filtra por Tema + Autor (Fase 2) y "Explorar" (Fase 1) da entrada a los ejes. Aquí solo se **armoniza visualmente** lo que ya existe.

22. Dar a las páginas de taxonomía existentes (`/personajes`, `/temas`, `/formas`, `/tradiciones`, `/traducciones`) y a sus términos el mismo lenguaje visual (eyebrows, filetes, numerales romanos, filas 3:2). Reutiliza `ListadoFabulasTaxonomia.astro` ya rediseñado en Fase 2.
23. ~~Motor de facetas multi-eje tipo `ChipsFacetas` + `GrillaTerminos` de Poemario~~ · **descartado/pospuesto**: el handoff resuelve el descubrimiento con listado Tema+Autor + "Explorar" + páginas de taxonomía. Si el volumen crece, se reconsidera.

## Fase 6 · Pulido y accesibilidad
24. **Fundido de ilustraciones al fondo marfil** (adaptación del método de Poemario #558/#559) — más simple aquí: un solo fondo, sin "línea de noche".
25. **Auditoría de contraste WCAG AA** con criterios ya fijados por el handoff como reglas duras:
    - Sobre marfil, el cuerpo va en negro.
    - `--oro-decorativo #C9A14A` **solo** como línea/ornamento o texto ≥24px.
    - `--coral` **solo** como fondo de CTA o texto ≥24px (nunca texto pequeño).
    - Metadatos pequeños en mayúsculas → `--oro-legible #7A5F1F`.
26. Verificar responsive **sin media queries** (todo por `clamp()` + `flex-wrap`/`grid auto-fill`): hero mantiene 8:3 hasta su `min-height`; filas a una columna bajo 300px; rejilla de autores 3→2→1; "Explorar" 4→2→1.

---

## Trabajo transversal de assets y contenido (no bloquea fases, pero condiciona la publicación)
- **Retratos de autores (nuevos, 10):** el handoff trae retratos 3:2 Art-Déco con orla dorada para Esopo, Leonardo Da Vinci, Jean de La Fontaine, Tomás de Iriarte, Félix María de Samaniego, Eugenio Hartzenbusch, Miguel Agustín Príncipe, Aquiles Nazoa, Alejandro Morales Loaiza y Anónimo (en `docs/rediseno/…` del paquete original / zip). **Al importarlos: renombrar a slugs** (los nombres llevan acentos y espacios) y colgarlos del campo `imagen` de cada autor. Encaja con el [flujo de ilustraciones] habitual.
- **Ilustraciones de fábulas** de la maqueta (El amor y la locura, El viejo y los higos, El bufón y el aldeano, El hombre y la comadreja, Las comadrejas y los ratones): ya en 3:2; asignar `foco` por fábula para que el recorte 8:3 no decapite personajes.
- **Contenido a revisar antes de publicar:** recuentos reales ("212 fábulas", "38 fábulas", "N fábulas" por autor deben cuadrar con las fichas reales), fechas y glosas. **Hueco confirmado:** fechas de Alejandro Morales Loaiza (la maqueta pone "Contemporáneo").

## Fuera de alcance (explícito)
- Tema día/noche · descartado por decisión de producto (siempre día).
- El Taller métrico · no aplica al dominio de la fábula.
- Motor de facetas multi-eje · pospuesto (ver Fase 5).
- El conmutador de vistas de la maqueta y `support.js` · **andamiaje**, no van a producción.

## Notas de dominio (poema → fábula)
- Taxonomías: Fabulario usa `personajes`, `temas`, `forma` (verso/prosa), `tradicion`. El listado público filtra solo por **tema** y **autor** (handoff); el resto son páginas de taxonomía.
- `autores.tipo`: `clasico | colaborador`.
- Metadatos siempre en clave de lectura: "Lectura · N min", nunca "Audio".

## Orden recomendado de ejecución
~~**A** (cimientos)~~ hecha → ~~**1** (portada)~~ hecha → **3** (fábula individual, corazón del sitio) → **2** (índice de fábulas) → **4** (autores) → **5** (taxonomías) → **6** (pulido/WCAG). Cada fase es un PR independiente y desplegable. El trabajo de assets/retratos puede correr en paralelo desde ya.
