# scripts/

Scripts auxiliares para la curaduría editorial de El Fabulario. Versionados
desde el PR del Libro VIII para auditabilidad: cualquiera puede revisar qué
taxonomía se aplicó a qué fábula y cuándo.

## Convenciones

### `aplicar-taxonomia-libro-{N}.ps1`

Un script por libro de Samaniego. Cada uno aplica `personajes` y `temas`
a las fábulas en borrador de ese libro, reemplazando los marcadores que
emite `extraer_samaniego.py`:

```yaml
# personajes: []          # lista cerrada en src/utils/taxonomia.ts
# temas: []               # al menos uno, obligatorio
```

Por listas inline:

```yaml
personajes: [filosofo, pulga]
temas: [vanidad, soberbia, ironia]
```

**Idempotencia.** Los scripts fallan ruidosamente si las líneas marcadoras
no aparecen (ya se aplicó la taxonomía). Esto previene doble ejecución
accidental.

**Cobertura.** Los scripts cubren únicamente las fábulas nuevas (en borrador)
de su libro. Las fábulas ya publicadas previamente con taxonomía a mano
quedan fuera y conservan su frontmatter intacto. Ejemplo: el Libro VI tiene
12 fábulas en el INDICE pero el script procesa solo 11; la 12ª
(`el-jabali-y-el-carnero`) estaba publicada desde 2012.

**Fallback `$PSScriptRoot`.** Si el script se ejecuta como archivo, usa
`$PSScriptRoot` para localizar el repo. Si se pega línea a línea en la
consola, `$PSScriptRoot` está vacío y cae a `Get-Location` con un
`Write-Warning`. Asegúrate de estar en la raíz del repo cuando uses el
modo "pegado".

### Criterio editorial fijo

Todas las fábulas de Samaniego llevan `tradicion: hispanica`, sin examen
caso por caso. Justificación: versión hispana que reformula material
esópico, no traducción directa. Aplica al corpus completo de 157 fábulas
en cualquier extracción o normalización futura.

## Sincronización con la taxonomía

Si necesitas un slug nuevo (personaje, tema, tradición), hay que tocar tres
archivos a mano antes de usarlo en cualquier script:

1. `src/utils/taxonomia.ts` — fuente única de verdad (arrays + mapas display)
2. `src/content.config.ts` — usa los arrays importados, no requiere cambio
   salvo que se añada un eje nuevo
3. `public/admin/config.yml` — panel editorial Decap, los `select`

Sin esos tres en sincronía, el build falla por validación Zod.

---

### `extraer_samaniego.py`

Extractor del corpus completo de Samaniego (157 fábulas) desde una fuente
HTML local. Genera esqueletos `.md` en `salida-libro-<N>/` con:

- Estrofas separadas por línea en blanco (convención del sitio: salto de
  línea = verso, línea en blanco = estrofa).
- `tradicion: hispanica` aplicado por defecto (criterio editorial fijo).
- Última estrofa envuelta en `***...***` como hipótesis de moraleja
  (verificar a mano).
- `personajes` y `temas` como líneas comentadas (`# personajes: []`)
  para que `aplicar-taxonomia-libro-<N>.ps1` las reemplace.

**Uso:**

```sh
python extraer_samaniego.py --libro VIII --out .\salida-libro-8
python extraer_samaniego.py --listar
```

**Numerales romanos obligatorios** en `--libro` (I–IX). Dígitos arábigos
no funcionan.

**Dependencias:** `beautifulsoup4`, `lxml`. Instalar con `pip install
beautifulsoup4 lxml`.

**Flujo completo por libro:**

1. `python extraer_samaniego.py --libro <ROMANO> --out .\salida-libro-<N>`
2. Comparar con `src\content\fabulas\` para descartar duplicados.
3. Copiar los `.md` restantes a `src\content\fabulas\`.
4. Actualizar `aplicar-taxonomia-libro-<N>.ps1` con la curaduría
   (`personajes` y `temas` validados contra `src/utils/taxonomia.ts`).
5. Ejecutar el script de taxonomía.
6. `npm run build` para verificar Zod.
