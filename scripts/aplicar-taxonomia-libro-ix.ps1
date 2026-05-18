# Aplica la curaduría taxonómica (personajes + temas) a las 19 fábulas
# del Libro IX de Samaniego. Sigue el patrón canónico -vi/-vii/-viii:
# idempotente, ruta absoluta vía $PSScriptRoot, escribe UTF-8 sin BOM.
#
# Uso: powershell -ExecutionPolicy Bypass -File .\scripts\aplicar-taxonomia-libro-ix.ps1

$ErrorActionPreference = 'Stop'

# Raíz del repo: el script vive en scripts/, el repo es el padre.
$repoRoot = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }
$fabulasDir = Join-Path $repoRoot 'src\content\fabulas'

# Curaduría taxonómica del Libro IX (19 fábulas).
# Slugs validados contra src/utils/taxonomia.ts.
$curaduria = [ordered]@{
    'el-gato-y-las-aves'                               = @{ personajes = @('gato');                            temas = @('engano','hipocresia') }
    'la-danza-pastoril'                                = @{ personajes = @('pastor');                          temas = @('naturaleza','inocencia') }
    'los-dos-perros'                                   = @{ personajes = @('perro');                           temas = @('hipocresia') }
    'la-moda'                                          = @{ personajes = @('mono');                            temas = @('vanidad','necedad') }
    'el-lobo-y-el-mastin'                              = @{ personajes = @('lobo','perro');                    temas = @('libertad','traicion') }
    'la-hermosa-y-el-espejo'                           = @{ personajes = @();                                  temas = @('adulacion','vanidad','vejez') }
    'el-viejo-y-el-chalan'                             = @{ personajes = @('anciano','chalan','perro');        temas = @('engano') }
    'la-gata-con-cascabeles'                           = @{ personajes = @('gato');                            temas = @('vanidad') }
    'el-ruisenor-y-el-mochuelo'                        = @{ personajes = @('ruisenor','mochuelo');             temas = @('necedad','vanidad') }
    'el-amo-y-el-perro'                                = @{ personajes = @('amo','perro','gato');              temas = @('lealtad','engano') }
    'los-dos-cazadores'                                = @{ personajes = @('cazador','lobo');                  temas = @('prudencia','valentia','cobardia') }
    'el-gato-y-el-cazador'                             = @{ personajes = @('gato','cazador','conejo');         temas = @('codicia','trampa') }
    'el-pastor'                                        = @{ personajes = @('pastor');                          temas = @('necedad','trabajo') }
    'el-tordo-flautista'                               = @{ personajes = @('tordo');                           temas = @('envidia','vanidad') }
    'el-raposo-y-el-lobo'                              = @{ personajes = @('zorro','lobo');                    temas = @('astucia','engano') }
    'el-ciudadano-pastor'                              = @{ personajes = @('pastor');                          temas = @('necedad','naturaleza') }
    'el-ladron'                                        = @{ personajes = @('ladron');                          temas = @('codicia','gula') }
    'el-joven-filosofo-y-sus-companeros'               = @{ personajes = @('filosofo');                        temas = @('hipocresia','gula') }
    'el-elefante-el-toro-el-asno-y-los-demas-animales' = @{ personajes = @('elefante','toro','burro','leon');  temas = @('soberbia','vanidad') }
}

function Format-YamlArray {
    param([string[]]$items)
    if ($null -eq $items -or $items.Count -eq 0) { return '[]' }
    return '[' + ($items -join ', ') + ']'
}

# UTF-8 sin BOM (coherente con el resto del corpus).
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$ok = 0
$skipped = 0

foreach ($slug in $curaduria.Keys) {
    $path = Join-Path $fabulasDir "$slug.md"

    if (-not (Test-Path $path)) {
        Write-Warning "SKIP $slug (no existe en src/content/fabulas/)"
        $skipped++
        continue
    }

    $content = Get-Content $path -Raw -Encoding UTF8
    $personajesYaml = "personajes: " + (Format-YamlArray $curaduria[$slug].personajes)
    $temasYaml      = "temas: "      + (Format-YamlArray $curaduria[$slug].temas)

    # Idempotente: el regex matchea tanto la forma comentada (`# personajes: [] ...`)
    # como la forma activa (`personajes: [...]`). Ejecutar dos veces no rompe nada.
    $new = $content
    $new = $new -replace '(?m)^#?\s*personajes:.*$', $personajesYaml
    $new = $new -replace '(?m)^#?\s*temas:.*$',      $temasYaml

    if ($new -eq $content) {
        Write-Warning "SKIP $slug (patrones personajes/temas no encontrados)"
        $skipped++
        continue
    }

    [System.IO.File]::WriteAllText($path, $new, $utf8NoBom)
    Write-Host "OK $slug"
    $ok++
}

Write-Host ""
Write-Host "Libro IX: $ok fabulas curadas, $skipped omitidas (de $($curaduria.Count) totales)."