$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir "backend"

Write-Host "===========================================================" -ForegroundColor Green
Write-Host " Launching Akansha Dental Clinic Node.js Backend (:8080)..." -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Green
Set-Location $backendDir
& "npm.cmd" run dev
