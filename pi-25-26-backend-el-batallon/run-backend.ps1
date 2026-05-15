# Arranca el backend sin acordarte de variables.
# - Si existe render-db.local.env (Postgres en Render), lo carga y ejecuta Maven.
# - Con -LocalDocker: perfil "local" (Postgres en Docker; antes: docker compose up -d).
# - Si usas Postgres instalado en Windows: define la clave antes de llamar al script:
#     $env:SPRING_DATASOURCE_PASSWORD = "tu_clave"
#     .\run-backend.ps1

param(
  [switch] $LocalDocker
)

$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
Set-Location $here

$envFile = Join-Path $here "render-db.local.env"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line.Length -eq 0 -or $line.StartsWith("#")) { return }
    $parts = $line -split "=", 2
    if ($parts.Length -ne 2) { return }
    $name = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"').Trim("'")
    [Environment]::SetEnvironmentVariable($name, $value, "Process")
  }
}

if ($LocalDocker) {
  Write-Host "Perfil local (password sportster en application-local.properties). Asegurate de: docker compose up -d" -ForegroundColor Cyan
  .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
  exit $LASTEXITCODE
}

$url = $env:SPRING_DATASOURCE_URL
if ([string]::IsNullOrWhiteSpace($url)) {
  $url = "jdbc:postgresql://localhost:5432/sportster"
}
$pass = $env:SPRING_DATASOURCE_PASSWORD
$needsLocalPassword = ($url -match "localhost|127\.0\.0\.1") -and [string]::IsNullOrWhiteSpace($pass)

if ($needsLocalPassword) {
  Write-Host ""
  Write-Host "Postgres en localhost suele exigir contraseña (SCRAM). No hay SPRING_DATASOURCE_PASSWORD." -ForegroundColor Yellow
  Write-Host "Opciones:"
  Write-Host "  A) Base en Render: crea render-db.local.env (ver render-db.local.env.example) y vuelve a ejecutar .\run-backend.ps1"
  Write-Host "  B) Postgres en Windows:  `$env:SPRING_DATASOURCE_PASSWORD='TU_CLAVE'; .\run-backend.ps1"
  Write-Host "  C) Postgres en Docker:   docker compose up -d   luego   .\run-backend.ps1 -LocalDocker"
  Write-Host ""
  exit 1
}

.\mvnw.cmd spring-boot:run
exit $LASTEXITCODE
