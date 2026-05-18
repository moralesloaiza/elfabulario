# Aplica personajes y temas a las 8 fabulas del Libro VIII de Samaniego.
# Falla si las lineas marcadoras no aparecen (proteccion contra doble ejecucion).
#
# Uso (preferido, como script):
#     .\scripts\aplicar-taxonomia-libro-viii.ps1
#
# Uso (pegado linea a linea en consola): tambien funciona; en ese caso
# $PSScriptRoot esta vacio y se hace fallback a Get-Location.

$ErrorActionPreference = 'Stop'

# Fallback: $PSScriptRoot solo esta definido cuando el .ps1 se ejecuta
# como archivo. Si se pega en la consola, usamos el cwd con un aviso.
if ([string]::IsNullOrEmpty($PSScriptRoot)) {
    Write-Warning "PSScriptRoot vacio (script pegado en consola?). Usando cwd: $((Get-Location).Path)"
    $repoRoot = (Get-Location).Path
} else {
    # El script vive en <repo>/scripts/, asi que el repo es el padre.
    $repoRoot = Split-Path -Parent $PSScriptRoot
}

$base = Join-Path $repoRoot 'src\content\fabulas'

if (-not (Test-Path $base)) {
    throw "No existe la carpeta de fabulas: $base"
}

$taxonomia = [ordered]@{
    'el-naufragio-de-simonides' = @{
        personajes = @('poeta')
        temas      = @('sabiduria', 'riqueza', 'prudencia', 'mar')
    }
    'el-filosofo-y-la-pulga' = @{
        personajes = @('filosofo', 'pulga')
        temas      = @('vanidad', 'soberbia', 'ironia')
    }
    'el-cazador-y-los-conejos' = @{
        personajes = @('cazador', 'conejo')
        temas      = @('necedad', 'miedo', 'critica-social')
    }
    'el-filosofo-y-el-faisan' = @{
        personajes = @('filosofo', 'faisan')
        temas      = @('ingratitud', 'critica-social', 'ironia')
    }
    'el-zapatero-medico' = @{
        personajes = @('zapatero', 'rey')
        temas      = @('engano', 'necedad', 'critica-social')
    }
    'la-mariposa-y-el-caracol' = @{
        personajes = @('mariposa', 'caracol')
        temas      = @('vanidad', 'soberbia', 'humildad')
    }
    'los-dos-titiriteros' = @{
        personajes = @()
        temas      = @('engano', 'critica-social', 'ironia')
    }
    'el-raposo-y-el-perro' = @{
        personajes = @('zorro', 'perro')
        temas      = @('engano', 'mentira', 'verdad')
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
