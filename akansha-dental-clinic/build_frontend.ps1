$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $scriptDir "frontend"

Write-Host "Building Akansha Dental Clinic Frontend..." -ForegroundColor Cyan
Set-Location $frontendDir
& "npm.cmd" run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend build succeeded!" -ForegroundColor Green
} else {
    Write-Error "Frontend build failed with code $LASTEXITCODE"
}
