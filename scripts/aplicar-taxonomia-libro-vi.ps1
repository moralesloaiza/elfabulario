# Aplica personajes y temas a las 11 fabulas del Libro VI de Samaniego.
# Falla si las lineas marcadoras no aparecen (proteccion contra doble ejecucion).

$ErrorActionPreference = 'Stop'

$base = Join-Path $PSScriptRoot 'src\content\fabulas'

$taxonomia = [ordered]@{
    'el-amor-y-la-locura' = @{
        personajes = @('amor', 'locura', 'zeus')
        temas      = @('venganza', 'justicia', 'ironia')
    }
    'el-camello-y-la-pulga' = @{
        personajes = @('camello', 'pulga')
        temas      = @('vanidad', 'soberbia', 'ironia')
    }
    'el-cerdo-el-carnero-y-la-cabra' = @{
        personajes = @('cerdo', 'carnero', 'cabra', 'carretero')
        temas      = @('muerte', 'inocencia', 'miedo')
    }
    'el-enfermo-y-la-vision' = @{
        personajes = @('enfermo', 'vision')
        temas      = @('codicia', 'muerte', 'piedad')
    }
    'el-filosofo-y-el-rustico' = @{
        personajes = @('filosofo', 'rustico', 'milano')
        temas      = @('critica-social', 'ironia', 'justicia')
    }
    'el-hombre-y-la-fantasma' = @{
        personajes = @('fantasma')
        temas      = @('codicia', 'ironia', 'critica-social')
    }
    'el-leon-el-tigre-y-el-caminante' = @{
        personajes = @('leon', 'tigre', 'caminante')
        temas      = @('poder', 'adulacion', 'piedad')
    }
    'el-pastor-y-el-filosofo' = @{
        personajes = @('pastor', 'filosofo')
        temas      = @('sabiduria', 'naturaleza', 'humildad')
    }
    'el-raposo-la-mujer-y-el-gallo' = @{
        personajes = @('zorro', 'gallo')
        temas      = @('astucia', 'engano', 'prudencia')
    }
    'la-muerte' = @{
        personajes = @('muerte')
        temas      = @('muerte', 'gula', 'ironia')
    }
    'la-pava-y-la-hormiga' = @{
        personajes = @('pava', 'hormiga')
        temas      = @('ironia', 'critica-social', 'necedad')
    }
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$procesadas = 0

foreach ($slug in $taxonomia.Keys) {
    $path = Join-Path $base "$slug.md"
    if (-not (Test-Path $path)) {
        throw "No existe: $path"
    }

    $content = [System.IO.File]::ReadAllText($path, $utf8NoBom)

    if ($content -notmatch '(?m)^# personajes: \[\].*$') {
        throw "$slug : no se encontro la linea marcadora '# personajes: []'"
    }
    if ($content -notmatch '(?m)^# temas: \[\].*$') {
        throw "$slug : no se encontro la linea marcadora '# temas: []'"
    }

    $tax = $taxonomia[$slug]
    $personajesYaml = "personajes: [$($tax.personajes -join ', ')]"
    $temasYaml      = "temas: [$($tax.temas -join ', ')]"

    $content = $content -replace '(?m)^# --- .*PENDIENTE.*$\r?\n?', ''
    $content = $content -replace '(?m)^# personajes: \[\].*$', $personajesYaml
    $content = $content -replace '(?m)^# temas: \[\].*$',      $temasYaml

    [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
    Write-Host "OK $slug"
    $procesadas++
}

Write-Host ""
Write-Host "Listo. $procesadas/$($taxonomia.Count) fabulas modificadas."
