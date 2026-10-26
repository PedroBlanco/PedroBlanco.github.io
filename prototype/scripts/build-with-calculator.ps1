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

$SiteRoot = (Resolve-Path -LiteralPath (Join-Path $Site '..')).Path
$SiteBranch = (& git -C $SiteRoot branch --show-current).Trim()
Require-Ok 'No se pudo leer la rama de la web'
if ($SiteBranch -ne 'prototype/eleventy-bilingual') {
  throw 'Esta operación solo se admite en la rama experimental de Eleventy'
}

Write-Host '1/4 - Instalar dependencias privadas (no se copia el código fuente al sitio)'
& npm --prefix $Source ci
Require-Ok 'No se pudieron instalar las dependencias de la calculadora'
Write-Host '2/4 - Ejecutar las pruebas del proyecto privado'
& npm --prefix $Source test
Require-Ok 'Han fallado pruebas de la calculadora'
Write-Host '3/4 - Generar artefacto web estático'
& npm --prefix $Source run build:web
Require-Ok 'No se pudo crear el artefacto web'
Write-Host '4/4 - Construir y verificar el prototipo sin despliegue'
$OldValue = [Environment]::GetEnvironmentVariable('CALCULADORA_WEB_DIST')
try {
  $env:CALCULADORA_WEB_DIST = (Join-Path $Source 'dist')
  & npm --prefix $Site run build
  Require-Ok 'Falló la compilación del sitio'
  & npm --prefix $Site run check
  Require-Ok 'Falló la verificación del sitio'
} finally {
  if ($null -eq $OldValue) { Remove-Item Env:CALCULADORA_WEB_DIST -ErrorAction SilentlyContinue }
  else { $env:CALCULADORA_WEB_DIST = $OldValue }
}
Write-Host 'Revisión local completa. No se han enviado cambios ni publicado la web.'
