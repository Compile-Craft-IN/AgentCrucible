<#
.SYNOPSIS
  AgentCrucible Autonomous Automation Launcher (PowerShell)
.DESCRIPTION
  Single-command automated pipeline for AgentCrucible.
  Runs verification tests, builds artifacts, runs isolated sandboxes, and starts the studio.
.EXAMPLE
  .\run.ps1
  .\run.ps1 -Test
  .\run.ps1 -Eval
  .\run.ps1 -Sandbox
  .\run.ps1 -Schedule
  .\run.ps1 -Listen
  .\run.ps1 -Build
  .\run.ps1 -Dev
#>

[CmdletBinding()]
param (
    [switch]$Test,
    [switch]$Eval,
    [switch]$Sandbox,
    [switch]$Schedule,
    [switch]$Listen,
    [switch]$Build,
    [switch]$Dev
)

$ErrorActionPreference = "Stop"

Write-Host "===============================================================" -ForegroundColor Yellow
Write-Host " [CRUCIBLE] AgentCrucible - Autonomous Studio Automation Launcher" -ForegroundColor Cyan
Write-Host "===============================================================`n" -ForegroundColor Yellow

# If specific flags are not passed, execute the standard full lifecycle
if (-not ($Test -or $Eval -or $Sandbox -or $Schedule -or $Listen -or $Build -or $Dev)) {
    Write-Host "[1/4] Running Unit & Engine Test Suite..." -ForegroundColor Yellow
    npm test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "`n[2/4] Executing Headless CI/CD Benchmark Matrix..." -ForegroundColor Yellow
    npm run cli:eval
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "`n[3/4] Compiling Production Bundle..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    Write-Host "`n[4/4] Starting AgentCrucible Studio..." -ForegroundColor Green
    npm run dev
    exit 0
}

if ($Test) {
    Write-Host "Running Vitest test suite..." -ForegroundColor Yellow
    npm test
    exit $LASTEXITCODE
}

if ($Eval) {
    Write-Host "Running Headless Evaluation Benchmarks..." -ForegroundColor Yellow
    npm run cli:eval
    exit $LASTEXITCODE
}

if ($Sandbox) {
    Write-Host "Running Isolated Non-Root Docker PR Sandbox Verification..." -ForegroundColor Cyan
    powershell -ExecutionPolicy Bypass -File .\scripts\sandbox-verify-pr.ps1
    exit $LASTEXITCODE
}

if ($Schedule) {
    Write-Host "Launching Periodic Continuous Resilience Scheduler..." -ForegroundColor Cyan
    npm run scheduler
    exit $LASTEXITCODE
}

if ($Listen) {
    Write-Host "Starting GitHub Collaboration Event Listener..." -ForegroundColor Cyan
    npm run github:listen
    exit $LASTEXITCODE
}

if ($Build) {
    Write-Host "Building Production Distribution..." -ForegroundColor Yellow
    npm run build
    exit $LASTEXITCODE
}

if ($Dev) {
    Write-Host "Launching Local Studio Dev Server..." -ForegroundColor Green
    npm run dev
    exit $LASTEXITCODE
}
