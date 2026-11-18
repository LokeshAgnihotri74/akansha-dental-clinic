$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendDir = Join-Path $scriptDir "frontend"

Write-Host "Launching Akansha Dental Clinic Frontend Dev Server (Port 5173)..." -ForegroundColor Cyan
Set-Location $frontendDir
& "npm.cmd" run dev
