# Arranca Spring Boot en local usando la base PostgreSQL de Render.
# 1) Copia render-db.local.env.example → render-db.local.env y rellena (no lo subas a git).
# 2) Ejecuta: .\run-local-with-render-db.ps1

$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
Set-Location $here

$envFile = Join-Path $here "render-db.local.env"
if (-not (Test-Path $envFile)) {
    Write-Host ""
    Write-Host "No existe render-db.local.env" -ForegroundColor Yellow
    Write-Host "  1. Copia render-db.local.env.example a render-db.local.env"
    Write-Host "  2. Pega URL, usuario y contrasena desde Render (PostgreSQL, Connections, External)."
    Write-Host "  3. URL JDBC con doble barra: jdbc:postgresql://HOST:5432/BD?sslmode=require"
    Write-Host ""
    exit 1
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line.Length -eq 0 -or $line.StartsWith("#")) { return }
    $parts = $line -split "=", 2
    if ($parts.Length -ne 2) { return }
    $name = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"').Trim("'")
    [Environment]::SetEnvironmentVariable($name, $value, "Process")
}

if (-not $env:SPRING_DATASOURCE_URL) {
    Write-Host "render-db.local.env debe definir SPRING_DATASOURCE_URL" -ForegroundColor Red
    exit 1
}
if (-not $env:SPRING_DATASOURCE_USERNAME) {
    Write-Host "render-db.local.env debe definir SPRING_DATASOURCE_USERNAME" -ForegroundColor Red
    exit 1
}
if (-not $env:SPRING_DATASOURCE_PASSWORD) {
    Write-Host "render-db.local.env debe definir SPRING_DATASOURCE_PASSWORD" -ForegroundColor Red
    exit 1
}

Write-Host "Arrancando contra la base de datos remota (Render)..." -ForegroundColor Cyan
.\mvnw.cmd spring-boot:run
