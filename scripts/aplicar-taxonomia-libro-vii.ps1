# Aplica personajes y temas a las 8 fabulas del Libro VII de Samaniego.
# Falla si las lineas marcadoras no aparecen (proteccion contra doble ejecucion).
$ErrorActionPreference = 'Stop'
$base = Join-Path $PSScriptRoot 'src\content\fabulas'
$taxonomia = [ordered]@{
    'demetrio-y-menandro' = @{
        personajes = @('rey')
        temas      = @('adulacion', 'poder', 'vanidad')
    }
    'el-aguila-y-la-asamblea-de-los-animales' = @{
        personajes = @('aguila', 'gallo', 'leon', 'paloma', 'perro', 'pez', 'zeus', 'zorro')
        temas      = @('critica-social', 'envidia', 'necedad')
    }
    'el-buho-y-el-hombre' = @{
        personajes = @('buho')
        temas      = @('critica-social', 'soberbia', 'vanidad')
    }
    'el-chivo-afeitado' = @{
        personajes = @('chivo', 'mono')
        temas      = @('critica-social', 'necedad', 'vanidad')
    }
    'el-poeta-y-la-rosa' = @{
        personajes = @('poeta')
        temas      = @('adulacion', 'vanidad', 'verdad')
    }
    'esopo-y-un-ateniense' = @{
        personajes = @('anciano', 'nino')
        temas      = @('prudencia', 'sabiduria', 'vejez')
    }
    'las-hormigas' = @{
        personajes = @('hormiga', 'zeus')
        temas      = @('codicia', 'critica-social')
    }
    'los-gatos-escrupulosos' = @{
        personajes = @('gato')
        temas      = @('critica-social', 'gula', 'ironia')
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