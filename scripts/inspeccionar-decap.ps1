# Inspecciona la rama cms/ mas reciente creada por Decap y vuelca un informe
# de lo que commiteo: archivos tocados, ilustracion referenciada y si existe.
# Uso:  .\scripts\inspeccionar-decap.ps1 -Rama "cms/fabulas/el-asno-y-su-amo"
#       (sin -Rama, intenta detectar la rama cms/ actualizada mas recientemente)
param(
  [string]$Rama
)

$ErrorActionPreference = "Stop"
git fetch origin --prune | Out-Null

if (-not $Rama) {
  # Rama cms/ con el commit mas reciente
  $Rama = git for-each-ref --sort=-committerdate --format='%(refname:short)' 'refs/remotes/origin/cms/fabulas/*' |
          Select-Object -First 1
  $Rama = $Rama -replace '^origin/',''
}
$ref = "origin/$Rama"

Write-Host "===== RAMA: $ref =====" -ForegroundColor Cyan

Write-Host "`n--- Commits sobre main ---" -ForegroundColor Yellow
git log --oneline origin/main..$ref

Write-Host "`n--- Archivos tocados frente a main ---" -ForegroundColor Yellow
git diff --name-status origin/main $ref

Write-Host "`n--- Ilustracion referenciada y existencia ---" -ForegroundColor Yellow
$mds = git diff --name-only origin/main $ref -- "src/content/fabulas/*.md"
foreach ($md in ($mds -split "`n" | Where-Object { $_.Trim() })) {
  $linea = (git show "${ref}:$md" 2>$null | Select-String "^ilustracion:").Line
  if ($linea) {
    $ruta = ($linea -split ':',2)[1].Trim().Trim('"').Trim("'").TrimStart('/')
    git cat-file -e "${ref}:$ruta" 2>$null
    $existe = if ($LASTEXITCODE -eq 0) { "EXISTE" } else { "FALTA" }
    Write-Host ("{0,-45} -> {1}  [{2}]" -f (Split-Path $md -Leaf), (Split-Path $ruta -Leaf), $existe)
  } else {
    Write-Host ("{0,-45} -> (sin campo ilustracion)" -f (Split-Path $md -Leaf))
  }
}

Write-Host "`n--- Imagenes anadidas/borradas frente a main ---" -ForegroundColor Yellow
git diff --name-status origin/main $ref -- "src/assets/uploads/*"