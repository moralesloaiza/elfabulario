# Aplica personajes y temas a las fabulas del Libro IV de Samaniego.
# Version robusta: resuelve rutas absolutas y aborta si el directorio
# de fabulas no existe.
#
# Uso desde C:\Users\LG\Documents\BLOGS\elfabulario :
#   .\aplicar-taxonomia-libro-iv.ps1
#
# Con ruta explicita:
#   .\aplicar-taxonomia-libro-iv.ps1 -FabulasDir 'C:\Users\LG\Documents\BLOGS\elfabulario\src\content\fabulas'

param(
    [string]$FabulasDir = 'src/content/fabulas'
)

$mappings = @(
    @{ Slug = 'la-mona-corrida';                         Personajes = 'mona';                 Temas = 'vanidad, necedad' },
    @{ Slug = 'el-asno-y-jupiter';                       Personajes = 'burro, zeus';          Temas = 'necedad, pereza' },
    @{ Slug = 'el-cazador-y-la-perdiz';                  Personajes = 'cazador, perdiz';      Temas = 'traicion, engano' },
    @{ Slug = 'el-viejo-y-la-muerte';                    Personajes = 'anciano, muerte';      Temas = 'miedo, vejez' },
    @{ Slug = 'el-enfermo-y-el-medico';                  Personajes = 'doctor';               Temas = 'necedad, ironia' },
    @{ Slug = 'la-zorra-y-las-uvas';                     Personajes = 'zorro';                Temas = 'envidia, soberbia' },
    @{ Slug = 'la-cierva-y-la-vina';                     Personajes = 'ciervo, cazador';      Temas = 'ingratitud' },
    @{ Slug = 'el-asno-cargado-de-reliquias';            Personajes = 'burro';                Temas = 'vanidad, necedad' },
    @{ Slug = 'los-dos-machos';                          Personajes = 'burro';                Temas = 'riqueza, codicia' },
    @{ Slug = 'el-cazador-y-el-perro';                   Personajes = 'perro, cazador';       Temas = 'ingratitud, vejez' },
    @{ Slug = 'la-tortuga-y-el-aguila';                  Personajes = 'tortuga, aguila';      Temas = 'necedad, soberbia' },
    @{ Slug = 'las-liebres-y-las-ranas';                 Personajes = 'liebre, rana';         Temas = 'miedo, prudencia' },
    @{ Slug = 'el-leon-y-la-cabra';                      Personajes = 'leon, cabra';          Temas = 'astucia, prudencia' },
    @{ Slug = 'la-hacha-y-el-mango';                     Personajes = '';                     Temas = 'traicion, engano' },
    @{ Slug = 'la-onza-y-los-pastores';                  Personajes = 'leopardo, pastor';     Temas = 'traicion, venganza, piedad' },
    @{ Slug = 'el-grajo-vano';                           Personajes = 'pava';                 Temas = 'vanidad, necedad' },
    @{ Slug = 'el-hombre-y-la-comadreja';                Personajes = 'comadreja';            Temas = 'engano, mentira' },
    @{ Slug = 'batalla-de-las-comadrejas-y-los-ratones'; Personajes = 'comadreja, raton';     Temas = 'guerra, soberbia' },
    @{ Slug = 'el-leon-y-la-rana';                       Personajes = 'leon, rana';           Temas = 'vanidad, soberbia' },
    @{ Slug = 'el-ciervo-y-los-bueyes';                  Personajes = 'ciervo, buey, pastor'; Temas = 'prudencia' },
    @{ Slug = 'los-navegantes';                          Personajes = '';                     Temas = 'prudencia, miedo' },
    @{ Slug = 'el-torrente-y-el-rio';                    Personajes = '';                     Temas = 'prudencia, miedo, engano' },
    @{ Slug = 'el-leon-el-lobo-y-la-zorra';              Personajes = 'leon, lobo, zorro';    Temas = 'adulacion, traicion, venganza' }
)

# Resolver ruta absoluta del directorio de fabulas
$cwd = (Get-Location).Path
Write-Host "Directorio actual: $cwd" -ForegroundColor Cyan

if ([System.IO.Path]::IsPathRooted($FabulasDir)) {
    $absDir = $FabulasDir
} else {
    $absDir = Join-Path $cwd $FabulasDir
}

if (-not (Test-Path -LiteralPath $absDir -PathType Container)) {
    Write-Host "ERROR: el directorio '$absDir' no existe." -ForegroundColor Red
    Write-Host "Ejecuta desde la raiz del repo, o pasa -FabulasDir con ruta absoluta." -ForegroundColor Red
    exit 1
}

$absDir = (Resolve-Path -LiteralPath $absDir).Path
Write-Host "Directorio de fabulas: $absDir" -ForegroundColor Cyan
Write-Host ""

$modificados   = 0
$noEncontrados = 0
$conflictos    = 0
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

foreach ($m in $mappings) {
    $path = Join-Path $absDir "$($m.Slug).md"

    if (-not (Test-Path -LiteralPath $path)) {
        Write-Host "  [NO ENCONTRADO]  $($m.Slug).md" -ForegroundColor Yellow
        $noEncontrados++
        continue
    }

    $content  = [System.IO.File]::ReadAllText($path, $utf8NoBom)
    $original = $content

    $personajesLinea = "personajes: [$($m.Personajes)]"
    $temasLinea      = "temas: [$($m.Temas)]"

    if ($content -match '(?m)^# personajes:.*$') {
        $content = $content -replace '(?m)^# personajes:.*$', $personajesLinea
    } elseif ($content -match '(?m)^personajes:') {
        Write-Host "  [CONFLICTO]      $($m.Slug).md ya tiene personajes descomentado" -ForegroundColor Yellow
        $conflictos++
        continue
    } else {
        Write-Host "  [SIN PATRON]     $($m.Slug).md no contiene linea de personajes" -ForegroundColor Yellow
        $conflictos++
        continue
    }

    if ($content -match '(?m)^# temas:.*$') {
        $content = $content -replace '(?m)^# temas:.*$', $temasLinea
    } elseif ($content -match '(?m)^temas:') {
        Write-Host "  [CONFLICTO]      $($m.Slug).md ya tiene temas descomentado" -ForegroundColor Yellow
        $conflictos++
        continue
    } else {
        Write-Host "  [SIN PATRON]     $($m.Slug).md no contiene linea de temas" -ForegroundColor Yellow
        $conflictos++
        continue
    }

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
        Write-Host "  [OK]             $($m.Slug).md" -ForegroundColor Green
        $modificados++
    }
}

Write-Host ""
Write-Host "Resumen: $modificados modificados, $noEncontrados no encontrados, $conflictos conflictos." -ForegroundColor Cyan
