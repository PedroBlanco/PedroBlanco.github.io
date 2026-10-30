[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [string]$CalculatorRepository
)
$ErrorActionPreference = 'Stop'
$Source = (Resolve-Path -LiteralPath $CalculatorRepository).Path
$Site = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path

function Require-Ok([string]$Label) {
  if ($LASTEXITCODE -ne 0) { throw "$Label (exit code $LASTEXITCODE)" }
}

$Remote = (& git -C $Source remote get-url origin).Trim()
Require-Ok 'No se pudo leer el remoto de la calculadora'
if ($Remote -notmatch 'github[.]com[:/]PedroBlanco/calculadora-tiempo([.]git)?$') {
  throw 'La ruta indicada no corresponde al repositorio de la calculadora'
}
$Branch = (& git -C $Source branch --show-current).Trim()
Require-Ok 'No se pudo leer la rama de origen'
if ($Branch -ne 'main') { throw 'La calculadora debe estar en main' }
$Dirty = & git -C $Source status --porcelain --untracked-files=no
Require-Ok 'No se pudo comprobar el estado de Git'
if ($Dirty) { throw 'Hay cambios locales sin confirmar en la calculadora; no se puede atribuir el paquete al commit HEAD' }
$SourceSha = (& git -C $Source rev-parse HEAD).Trim()
Require-Ok 'No se pudo obtener el commit de origen'

$SiteRoot = (Resolve-Path -LiteralPath (Join-Path $Site '..')).Path
$SiteBranch = (& git -C $SiteRoot branch --show-current).Trim()
Require-Ok 'No se pudo leer la rama de la web'
if ($SiteBranch -ne 'prototype/eleventy-bilingual') {
  throw 'Esta operación solo se admite en la rama experimental de Eleventy'
}

Write-Host '1/4 - Instalar y probar las dependencias de la calculadora'
& npm --prefix $Source ci
Require-Ok 'No se pudieron instalar las dependencias de la calculadora'
& npm --prefix $Source test
Require-Ok 'Han fallado las pruebas de la calculadora'

Write-Host '2/4 - Generar ZIP y manifiesto externo desde el repositorio privado'
& npm --prefix $Source run package:web
Require-Ok 'No se pudo empaquetar la herramienta'

$Version = (& node -p "require('$($Source.Replace('\','/'))/package.json').version").Trim()
Require-Ok 'No se pudo obtener la version'
$Package = Join-Path $Source ("artifacts/web/calculadora-tiempo-" + $Version + ".zip")
$Manifest = Join-Path $Source 'artifacts/web/web-artifact.json'
if (-not (Test-Path -LiteralPath $Package -PathType Leaf)) { throw 'No se ha generado el ZIP' }
if (-not (Test-Path -LiteralPath $Manifest -PathType Leaf)) { throw 'No se ha generado el manifiesto' }

Write-Host '3/4 - Construir y validar la web con el contrato v1'
$Vars = @('WEB_ARTIFACT_MANIFEST','WEB_ARTIFACT_ZIP','WEB_ARTIFACT_EXPECTED_SHA')
$Old = @{}
foreach ($key in $Vars) { $Old[$key] = [Environment]::GetEnvironmentVariable($key) }
try {
  $env:WEB_ARTIFACT_MANIFEST = $Manifest
  $env:WEB_ARTIFACT_ZIP = $Package
  $env:WEB_ARTIFACT_EXPECTED_SHA = $SourceSha
  & npm --prefix $Site run build
  Require-Ok 'Falló la compilación e integración del artefacto'
  Write-Host '4/4 - Verificar todo el sitio'
  & npm --prefix $Site run check
  Require-Ok 'Falló la verificación del sitio'
} finally {
  foreach ($key in $Vars) {
    if ($null -eq $Old[$key]) { Remove-Item ("Env:" + $key) -ErrorAction SilentlyContinue }
    else { [Environment]::SetEnvironmentVariable($key, $Old[$key]) }
  }
}
Write-Host 'Vista previa integrada validada. No se ha hecho push ni desplegado.'
