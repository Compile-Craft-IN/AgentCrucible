[CmdletBinding()]
param (
    [string]$PR = "local"
)

$ErrorActionPreference = "Stop"

Write-Host "===============================================================" -ForegroundColor Yellow
Write-Host " [SHIELD] AgentCrucible Isolated Docker PR Sandbox Verifier" -ForegroundColor Cyan
Write-Host "===============================================================`n" -ForegroundColor Yellow

Write-Host "Target: PR/Branch '$PR'" -ForegroundColor Yellow
Write-Host "Security Model: Non-Root unprivileged container, CPU limit: 2, Mem: 2048MB, Cap Drop: ALL`n" -ForegroundColor Gray

# Check Docker
try {
    $dockerVersion = docker --version
    Write-Host "OK: Docker detected: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Error "Docker is required for isolated sandbox verification but was not found."
    exit 1
}

$imageName = "agentcrucible-pr-sandbox:$PR"

Write-Host "`n[1/3] Building ephemeral isolated sandbox container image..." -ForegroundColor Yellow
docker build -t $imageName -f Dockerfile.sandbox .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Sandbox container build failed. Dependencies or syntax invalid."
    exit $LASTEXITCODE
}

Write-Host "`n[2/3] Executing sandboxed test and benchmark verification sequence..." -ForegroundColor Yellow
docker run --rm `
    --name "agentcrucible-sandbox-$PR" `
    --cpus="2.0" `
    --memory="2048m" `
    --security-opt="no-new-privileges:true" `
    --cap-drop="ALL" `
    $imageName

$testExitCode = $LASTEXITCODE

Write-Host "`n[3/3] Sandbox Execution Result:" -ForegroundColor Yellow
if ($testExitCode -eq 0) {
    Write-Host "PASS: SANDBOX VERIFICATION PASSED: PR code is compliant, passes all unit tests, and satisfies resilience invariants." -ForegroundColor Green
    exit 0
} else {
    Write-Host "FAIL: SANDBOX VERIFICATION FAILED: Code failed unit tests, build, or resilience thresholds in isolation." -ForegroundColor Red
    exit $testExitCode
}
