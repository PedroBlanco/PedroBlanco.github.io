#requires -Version 5.1
<#
.SYNOPSIS
  Build and validate Eleventy locally; optionally publish its output to gh-pages.
.DESCRIPTION
  Default: validate only, no Git changes. -Publish explicitly allows pushing.
  Publication requires the strict gate, a clean master, and an exact origin ref.
#>
param([switch]$Publish)
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$prototype = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$repo = (Resolve-Path (Join-Path $prototype "..")).Path
$dist = Join-Path $prototype "dist"

function Invoke-Git {
    param([string]$Directory,[string[]]$Arguments)
    & git -C $Directory @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw ("git failed (" + ($Arguments -join " ") + ")")
    }
}

if (-not (Test-Path -LiteralPath (Join-Path $repo ".git"))) {
    throw "Expected a Git working tree at $repo"
}
if (-not (Test-Path -LiteralPath (Join-Path $prototype "package.json"))) {
    throw "Expected the Eleventy project"
}

# The build fetches public repository metadata and may rewrite this tracked JSON.
# Check that publication starts from a clean master, then preserve its exact bytes.
# The regenerated data remains in dist/; the local source snapshot is restored.
$catalogPath = Join-Path $prototype "src\data\repositories.json"
$catalogSnapshot = $null
if ($Publish) {
    $branchBefore = (& git -C $repo branch --show-current)
    if ($LASTEXITCODE -ne 0 -or $branchBefore.Trim() -ne "master") {
        throw "Publication requires the reviewed master branch"
    }
    $dirtyBefore = @(& git -C $repo status --porcelain)
    if ($LASTEXITCODE -ne 0 -or
        -not [string]::IsNullOrWhiteSpace(($dirtyBefore -join [Environment]::NewLine))) {
        throw "Source Git worktree must be clean before building"
    }
    if (-not (Test-Path -LiteralPath $catalogPath -PathType Leaf)) {
        throw "Missing tracked repository catalog"
    }
    $catalogSnapshot = [System.IO.File]::ReadAllBytes($catalogPath)
}

Push-Location $prototype
try {
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw "Eleventy build failed" }
    & npm.cmd run check:publish
    if ($LASTEXITCODE -ne 0) { throw "Strict publication check failed; no push performed" }
} finally {
    try {
        Pop-Location
    } finally {
        if ($Publish -and $null -ne $catalogSnapshot) {
            # Initial clean-tree check guarantees no user changes are overwritten.
            [System.IO.File]::WriteAllBytes($catalogPath, $catalogSnapshot)
        }
    }
}
if (-not (Test-Path -LiteralPath (Join-Path $dist "index.html") -PathType Leaf) -or
    -not (Test-Path -LiteralPath (Join-Path $dist "404.html") -PathType Leaf)) {
    throw "Missing required site files in dist"
}
$files = @(Get-ChildItem -LiteralPath $dist -Force -Recurse -File)
$reparse = @(Get-ChildItem -LiteralPath $dist -Force -Recurse |
    Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint })
if ($reparse.Count -gt 0) { throw "Symlink/reparse point in generated site" }
$total = ($files | Measure-Object -Property Length -Sum).Sum
if ($total -ge 1GB -or @($files | Where-Object { $_.Length -ge 100MB }).Count -gt 0) {
    throw "GitHub Pages site or individual-file limit exceeded"
}
Write-Host ("Validated output: {0} files, {1:N1} MiB" -f $files.Count, ($total / 1MB))

if (-not $Publish) {
    Write-Host "Validation complete. Nothing pushed."
    Write-Host "Explicit publication command: .\scripts\publish-gh-pages.ps1 -Publish"
    exit 0
}
$current = (& git -C $repo branch --show-current)
if ($LASTEXITCODE -ne 0 -or $current.Trim() -ne "master") {
    throw "Publication requires the reviewed master branch"
}
$dirty = (& git -C $repo status --porcelain)
if ($LASTEXITCODE -ne 0 -or -not [string]::IsNullOrWhiteSpace(($dirty -join [Environment]::NewLine))) {
    throw "Source Git worktree is not clean"
}
$remote = (& git -C $repo remote get-url origin)
if ($LASTEXITCODE -ne 0 -or
    $remote.Trim() -notmatch '^(?:git@github\.com:|https://github\.com/|ssh://git@github\.com/)(?i:PedroBlanco/PedroBlanco\.github\.io)(?:\.git)?$') {
    throw "Unexpected origin; refusing to push"
}
$heads = @(& git -C $repo ls-remote --heads origin refs/heads/master refs/heads/gh-pages)
if ($LASTEXITCODE -ne 0) { throw "Could not read origin refs" }
$remoteMaster = @($heads | Where-Object { $_ -match 'refs/heads/master$' })
if ($remoteMaster.Count -ne 1) { throw "Remote master not uniquely identified" }
$masterSha = ($remoteMaster[0] -split '\s+')[0]
$localSha = (& git -C $repo rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $localSha -ne $masterSha) {
    throw "Local master must match origin/master"
}
$remotePages = @($heads | Where-Object { $_ -match 'refs/heads/gh-pages$' })
if ($remotePages.Count -gt 1) { throw "Ambiguous remote Pages branch" }

$temp = Join-Path ([System.IO.Path]::GetTempPath()) ("eleventy-pages-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $temp | Out-Null
try {
    Invoke-Git -Directory $temp -Arguments @("init","-q","-b","gh-pages")
    Invoke-Git -Directory $temp -Arguments @("remote","add","origin",$remote.Trim())
    if ($remotePages.Count -eq 1) {
        Invoke-Git -Directory $temp -Arguments @("fetch","--depth=1","origin","gh-pages")
        Invoke-Git -Directory $temp -Arguments @("checkout","-q","-B","gh-pages","FETCH_HEAD")
    }
    Get-ChildItem -LiteralPath $temp -Force |
        Where-Object { $_.Name -ne ".git" } |
        ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force -Recurse }
    Get-ChildItem -LiteralPath $dist -Force | ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination $temp -Recurse -Force
    }
    # Skip Jekyll on the Pages source branch; all pages are built locally.
    [System.IO.File]::WriteAllBytes((Join-Path $temp ".nojekyll"),[byte[]]@())
    Invoke-Git -Directory $temp -Arguments @("add","--all")
    & git -C $temp diff --cached --quiet
    $diffCode = $LASTEXITCODE
    if ($diffCode -eq 0) {
        Write-Host "No changes to publish."
        exit 0
    }
    if ($diffCode -ne 1) { throw "Could not inspect the staging diff" }
    Invoke-Git -Directory $temp -Arguments @("commit","-m","Publish reviewed Eleventy static site")
    # No force-push; concurrent modifications will reject the push.
    Invoke-Git -Directory $temp -Arguments @("push","origin","HEAD:refs/heads/gh-pages")
    Write-Host "gh-pages updated. Set Pages source to gh-pages / (root) after verification."
} finally {
    if (Test-Path -LiteralPath $temp) {
        Remove-Item -LiteralPath $temp -Force -Recurse
    }
}
