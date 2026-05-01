<#
.SYNOPSIS
  Migra el frontmatter de las fábulas: reemplaza el campo `etiquetas`
  por personajes, temas, forma y tradicion según mapeo-etiquetas.csv.

.DESCRIPTION
  v2:
  - Parseo línea por línea (más robusto que regex sobre todo el archivo).
  - Auto-detección de forma: si alguna línea del cuerpo > 100 chars,
    es prosa; si no, verso.
  - Overrides embebidos para los archivos que el CSV no cubre (fábulas
    cuyas etiquetas viejas eran insuficientes).
  - Reporta tags no reconocidas, archivos sin temas tras override,
    archivos con forma detectada por heurística.

.PARAMETER CsvPath
  Ruta al CSV de mapeo. Por defecto: ./mapeo-etiquetas.csv

.PARAMETER FabulasDir
  Ruta a la carpeta de fábulas. Por defecto: ./src/content/fabulas

.PARAMETER DryRun
  No escribe nada; solo reporta.
#>

[CmdletBinding()]
param(
  [string]$CsvPath = "./mapeo-etiquetas.csv",
  [string]$FabulasDir = "./src/content/fabulas",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# ── Overrides por archivo (ronda 2: temas y personajes faltantes) ───────────

$OVERRIDES = @{
  'el-aguila-y-los-lagartos.md'              = @{ AddTemas = @('soberbia', 'vanidad') }
  'el-calvo-y-la-mosca.md'                   = @{
    AddPersonajes = @('mosca')
    AddTemas      = @('necedad', 'ironia')
  }
  'el-ciervo-en-la-fuente.md'                = @{
    AddPersonajes = @('ciervo')
    AddTemas      = @('vanidad', 'prudencia')
  }
  'el-ciervo-que-se-miraba-en-el-agua.md'    = @{ AddTemas = @('vanidad', 'prudencia') }
  'el-labrador-y-la-ciguena.md'              = @{
    AddPersonajes = @('labrador', 'ciguena')
    AddTemas      = @('justicia')
  }
  'el-leon-con-su-ejercito.md'               = @{
    AddPersonajes = @('leon', 'elefante', 'oso', 'mona', 'lobo', 'zorro', 'liebre', 'burro')
    AddTemas      = @('prudencia', 'critica-social')
  }
  'el-leon-y-la-zorra.md'                    = @{
    AddPersonajes = @('leon', 'zorro')
  }
  'el-oso-en-el-pozo.md'                     = @{ AddTemas = @('engano', 'astucia') }
  'fabula-con-cochina.md'                    = @{ AddTemas = @('engano', 'ironia') }
  'fabula-con-cochino-ii.md'                 = @{ AddTemas = @('engano', 'traicion') }
  'fabula-con-loro.md'                       = @{ AddTemas = @('necedad', 'poder') }
  'fabula-con-otro-cochino.md'               = @{ AddTemas = @('necedad', 'ironia') }
  'fabula-de-la-avispa-ahogada.md'           = @{ AddTemas = @('necedad', 'muerte', 'ironia') }
  'fabula-del-rabipelado.md'                 = @{ AddTemas = @('vanidad', 'necedad', 'muerte') }
  'fabulas-con-cochino.md'                   = @{ AddTemas = @('vanidad', 'ironia', 'necedad') }
  'jupiter-y-el-caballo.md'                  = @{ AddTemas = @('soberbia', 'necedad') }
  'la-aguila-la-corneja-y-la-tortuga.md'     = @{
    AddPersonajes = @('aguila', 'tortuga')
  }
  'la-cierva-y-el-cervato.md'                = @{
    AddPersonajes = @('ciervo')
    AddTemas      = @('cobardia', 'miedo')
  }
  'la-liebre-y-la-tortuga.md'                = @{ AddTemas = @('prudencia', 'pereza') }
  'la-mariposa.md'                           = @{
    AddPersonajes = @('mariposa')
    AddTemas      = @('vanidad', 'necedad', 'muerte')
  }
  'la-piedra.md'                             = @{ AddTemas = @('naturaleza', 'prudencia') }
  'la-serpiente-y-la-lima.md'                = @{
    AddPersonajes = @('culebra')
    AddTemas      = @('necedad', 'ironia')
  }
  'los-guardianes-del-rey.md'                = @{
    AddPersonajes = @('rey')
    AddTemas      = @('engano', 'justicia', 'trampa')
    SetTradicion  = 'talmudica'
  }
}

# ── Validaciones previas ────────────────────────────────────────────────────

if (-not (Test-Path $CsvPath))    { throw "No existe el CSV: $CsvPath" }
if (-not (Test-Path $FabulasDir)) { throw "No existe la carpeta: $FabulasDir" }

$gitStatus = git status --porcelain 2>$null
if ($LASTEXITCODE -eq 0 -and $gitStatus) {
  Write-Warning "Hay cambios sin commitear. Recomendado: commit antes."
  if (-not $DryRun) {
    $resp = Read-Host "¿Continuar? (s/N)"
    if ($resp -ne 's') { Write-Host "Abortado."; exit 0 }
  }
}

# ── Cargar el CSV ───────────────────────────────────────────────────────────

$csv = Import-Csv -Path $CsvPath -Encoding UTF8
$mapeo = @{}
foreach ($fila in $csv) {
  $clave = $fila.old_tag.Trim().ToLower()
  $assigns = @()
  if ($fila.assignments) {
    $assigns = @($fila.assignments -split ';' | Where-Object { $_ })
  }
  $mapeo[$clave] = @{
    Action      = $fila.action
    Assignments = $assigns
  }
}
Write-Host "CSV cargado: $($mapeo.Count) etiquetas viejas."

# ── Función auxiliar: serializar set como inline YAML list ──────────────────

function Format-InlineList {
  param([System.Collections.Generic.HashSet[string]]$set)
  if ($set.Count -eq 0) { return '[]' }
  $sorted = $set | Sort-Object
  $quoted = $sorted | ForEach-Object { '"' + $_ + '"' }
  return '[' + ($quoted -join ', ') + ']'
}

# ── Procesar cada archivo ───────────────────────────────────────────────────

$archivos = Get-ChildItem $FabulasDir -Filter *.md
$totalArchivos = $archivos.Count
$modificados = 0
$saltados = 0
$tagsNoEncontradas = @{}
$archivosSinTemas = @()
$detectados = @{ Verso = @(); Prosa = @() }

foreach ($archivo in $archivos) {
  $lineas = @(Get-Content $archivo.FullName -Encoding UTF8)

  # 1. Localizar los dos delimitadores `---`
  $delim1 = -1
  $delim2 = -1
  for ($i = 0; $i -lt $lineas.Count; $i++) {
    if ($lineas[$i] -match '^---\s*$') {
      if ($delim1 -lt 0) { $delim1 = $i }
      else { $delim2 = $i; break }
    }
  }
  if ($delim1 -lt 0 -or $delim2 -lt 0) {
    Write-Warning "$($archivo.Name): sin frontmatter válido."
    $saltados++
    continue
  }

  # 2. Detectar idempotencia y extraer etiquetas viejas
  $tieneForma = $false
  $tieneEtiquetas = $false
  $idxEtiquetas = -1
  $etiquetasViejas = @()
  for ($i = $delim1 + 1; $i -lt $delim2; $i++) {
    if ($lineas[$i] -match '^forma:\s*\S') { $tieneForma = $true }
    if ($lineas[$i] -match '^etiquetas:\s*(.*)$') {
      $tieneEtiquetas = $true
      $idxEtiquetas = $i
      $resto = $Matches[1].Trim()
      if ($resto -match '^\[(.*)\]\s*$') {
        # Formato inline
        $contenido = $Matches[1]
        foreach ($item in ($contenido -split ',')) {
          $clean = $item.Trim().Trim('"').Trim("'").Trim()
          if ($clean) { $etiquetasViejas += $clean }
        }
      } elseif ($resto -eq '') {
        # Formato bloque: leer líneas siguientes con `- valor`
        for ($j = $i + 1; $j -lt $delim2; $j++) {
          if ($lineas[$j] -match '^\s*-\s+(.+)$') {
            $clean = $Matches[1].Trim().Trim('"').Trim("'")
            if ($clean) { $etiquetasViejas += $clean }
          } elseif ($lineas[$j] -match '^\S') {
            break
          }
        }
      }
    }
  }
  if ($tieneForma -and -not $tieneEtiquetas) {
    Write-Verbose "$($archivo.Name): ya migrado."
    $saltados++
    continue
  }

  # 3. Mapear etiquetas viejas a campos nuevos
  $personajes  = New-Object System.Collections.Generic.HashSet[string]
  $temas       = New-Object System.Collections.Generic.HashSet[string]
  $formas      = New-Object System.Collections.Generic.HashSet[string]
  $tradiciones = New-Object System.Collections.Generic.HashSet[string]

  foreach ($tag in $etiquetasViejas) {
    $clave = $tag.Trim().ToLower()
    if (-not $mapeo.ContainsKey($clave)) {
      if (-not $tagsNoEncontradas.ContainsKey($clave)) {
        $tagsNoEncontradas[$clave] = @()
      }
      $tagsNoEncontradas[$clave] += $archivo.Name
      continue
    }
    $regla = $mapeo[$clave]
    if ($regla.Action -ne 'map') { continue }
    foreach ($asig in $regla.Assignments) {
      $partes = $asig -split ':', 2
      if ($partes.Count -ne 2) { continue }
      $campo = $partes[0].Trim()
      $valor = $partes[1].Trim()
      switch ($campo) {
        'personajes' { [void]$personajes.Add($valor) }
        'temas'      { [void]$temas.Add($valor) }
        'forma'      { [void]$formas.Add($valor) }
        'tradicion'  { [void]$tradiciones.Add($valor) }
      }
    }
  }

  # 4. Aplicar overrides
  if ($OVERRIDES.ContainsKey($archivo.Name)) {
    $ov = $OVERRIDES[$archivo.Name]
    if ($ov.AddPersonajes) {
      foreach ($p in $ov.AddPersonajes) { [void]$personajes.Add($p) }
    }
    if ($ov.AddTemas) {
      foreach ($t in $ov.AddTemas) { [void]$temas.Add($t) }
    }
    if ($ov.SetTradicion) {
      $tradiciones.Clear()
      [void]$tradiciones.Add($ov.SetTradicion)
    }
    if ($ov.SetForma) {
      $formas.Clear()
      [void]$formas.Add($ov.SetForma)
    }
  }

  # 5. Auto-detectar forma si no se asignó
  if ($formas.Count -eq 0) {
    $body = $lineas[($delim2 + 1)..($lineas.Count - 1)]
    $maxLen = 0
    foreach ($bl in $body) {
      if ($bl.Length -gt $maxLen) { $maxLen = $bl.Length }
    }
    if ($maxLen -gt 100) {
      [void]$formas.Add('prosa')
      $detectados.Prosa += $archivo.Name
    } else {
      [void]$formas.Add('verso')
      $detectados.Verso += $archivo.Name
    }
  }

  # 6. Verificar temas no vacío (Zod min(1))
  if ($temas.Count -eq 0) {
    $archivosSinTemas += $archivo.Name
  }

  # 7. Construir las líneas YAML nuevas
  $nuevas = @()
  $nuevas += "personajes: $(Format-InlineList $personajes)"
  $nuevas += "temas: $(Format-InlineList $temas)"
  $nuevas += "forma: $($formas | Select-Object -First 1)"
  if ($tradiciones.Count -gt 0) {
    $nuevas += "tradicion: $($tradiciones | Select-Object -First 1)"
  } else {
    $nuevas += "tradicion:"
  }

  # 8. Reemplazar la línea de etiquetas (o insertar antes del cierre)
  if ($idxEtiquetas -ge 0) {
    $antes   = if ($idxEtiquetas -gt 0) { $lineas[0..($idxEtiquetas - 1)] } else { @() }
    $despues = if ($idxEtiquetas -lt ($lineas.Count - 1)) { $lineas[($idxEtiquetas + 1)..($lineas.Count - 1)] } else { @() }
    $resultado = @($antes) + @($nuevas) + @($despues)
  } else {
    $antes   = $lineas[0..($delim2 - 1)]
    $despues = $lineas[$delim2..($lineas.Count - 1)]
    $resultado = @($antes) + @($nuevas) + @($despues)
  }

  if ($DryRun) {
    Write-Host "[DRY-RUN] $($archivo.Name)"
    foreach ($n in $nuevas) { Write-Host "    $n" }
  } else {
    $contenidoNuevo = ($resultado -join "`n") + "`n"
    [System.IO.File]::WriteAllText(
      $archivo.FullName,
      $contenidoNuevo,
      [System.Text.UTF8Encoding]::new($false)
    )
  }
  $modificados++
}

# ── Reporte final ───────────────────────────────────────────────────────────

Write-Host ""
Write-Host "========================================"
Write-Host "  Resumen de la migración"
Write-Host "========================================"
Write-Host "Total archivos:              $totalArchivos"
Write-Host "  Modificados:               $modificados"
Write-Host "  Saltados (ya migrados):    $saltados"
Write-Host ""

Write-Host "Forma detectada por heurística (línea > 100 chars => prosa):"
Write-Host "  Verso: $($detectados.Verso.Count)"
Write-Host "  Prosa: $($detectados.Prosa.Count)"
Write-Host ""

if ($archivosSinTemas.Count -gt 0) {
  Write-Warning "Archivos SIN temas tras overrides ($($archivosSinTemas.Count)):"
  Write-Warning "Estos fallarán Zod min(1). Hay que añadir temas a mano."
  $archivosSinTemas | ForEach-Object { Write-Warning "  - $_" }
  Write-Host ""
}

if ($tagsNoEncontradas.Count -gt 0) {
  Write-Warning "Etiquetas no encontradas en CSV ($($tagsNoEncontradas.Count)):"
  foreach ($tag in ($tagsNoEncontradas.Keys | Sort-Object)) {
    $files = ($tagsNoEncontradas[$tag] | Select-Object -Unique) -join ', '
    Write-Warning "  '$tag' en: $files"
  }
  Write-Host ""
}

Write-Host "Detalle de detección de forma:"
Write-Host "  Verso ($($detectados.Verso.Count)):"
$detectados.Verso | ForEach-Object { Write-Host "    - $_" }
Write-Host "  Prosa ($($detectados.Prosa.Count)):"
$detectados.Prosa | ForEach-Object { Write-Host "    - $_" }
Write-Host ""

if ($DryRun) {
  Write-Host "DRY-RUN: No se escribió nada. Quita -DryRun para aplicar."
}
