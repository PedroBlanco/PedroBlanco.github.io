# Ejecutar desde PowerShell en Windows: .\prototype\scripts\run-media-audit.ps1
# Auditoria de solo lectura del material; npm ci/build/check escriben solo archivos generados locales.
# No publica, no aprueba recursos, no modifica master ni el historial.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Push-Location $root
try {
  $branch = (git branch --show-current).Trim()
  if ($LASTEXITCODE -ne 0 -or $branch -ne 'prototype/eleventy-bilingual') {
    throw 'La auditoria exige la rama prototype/eleventy-bilingual.'
  }
  $dirty = @(git status --porcelain)
  if ($LASTEXITCODE -ne 0 -or $dirty.Count -ne 0) {
    throw 'Arbol de trabajo no limpio. No se inicia la auditoria.'
  }
  if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    throw 'Falta Python Launcher (py).'
  }
  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw 'Falta npm.'
  }
  $results = [ordered]@{}
  function Run-Aggregated([string]$Name, [scriptblock]$Command) {
    # Ocultar stdout y stderr: no divulgar valores de celdas, metadatos ni URLs sensibles.
    # No almacenar transcripciones o logs detallados.
    try {
      & $Command *> $null
      $ok = $LASTEXITCODE -eq 0
    } catch { $ok = $false }
    $script:results[$Name] = if ($ok) { 'PASS' } else { 'FAIL' }
  }
  Run-Aggregated 'python_synthetic' { py -3 prototype\scripts\test-audit-legacy-assets.py }
  Run-Aggregated 'image_ods_originals' { py -3 prototype\scripts\audit-legacy-assets.py --all }
  Run-Aggregated 'pdf_croquetas' { py -3 prototype\scripts\audit-legacy-pdf.py CROQUETAS2024.pdf }
  Run-Aggregated 'pdf_nexum' { py -3 prototype\scripts\audit-legacy-pdf.py NEXUM2024.pdf }
  Run-Aggregated 'pdf_revista' { py -3 prototype\scripts\audit-legacy-pdf.py revista/2024-09-23_presentacion_revista.pdf }
  Push-Location (Join-Path $root 'prototype')
  try {
    Run-Aggregated 'npm_ci' { npm ci --no-audit --no-fund }
    if ($results['npm_ci'] -eq 'PASS') {
      Run-Aggregated 'eleventy_build' { npm run build }
      if ($results['eleventy_build'] -eq 'PASS') {
        Run-Aggregated 'media_output_integrity' { npm run audit:media }
        Run-Aggregated 'crossword_tests' { npm run test:crossword }
        Run-Aggregated 'full_check' { npm run check }
      }
    }
  } finally { Pop-Location }
  Write-Output 'Resultados agregados (sin logs ni contenido de archivos):'
  foreach ($key in $results.Keys) { Write-Output ($key + ': ' + $results[$key]) }
  if (@($results.Values | Where-Object { $_ -ne 'PASS' }).Count -gt 0 -or -not $results.Contains('full_check')) { exit 1 }
} finally { Pop-Location }
