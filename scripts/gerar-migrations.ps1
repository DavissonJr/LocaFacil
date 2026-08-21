# Gera a migration inicial do EF Core usando um container temporario do SDK do .NET.
# Nao precisa ter .NET instalado na maquina - so Docker.
# Rode isso UMA VEZ, antes do primeiro "docker compose up" (ou de novo, se voce alterar algum Model).

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$apiDir = Join-Path $scriptDir "..\backend\LocacaoVeiculos.Api"
$apiDir = Resolve-Path $apiDir

Write-Host "Gerando migration em: $apiDir" -ForegroundColor Cyan

docker run --rm `
  -v "${apiDir}:/src" `
  -w /src `
  mcr.microsoft.com/dotnet/sdk:8.0 `
  bash -c "dotnet tool install --global dotnet-ef --version 8.* > /dev/null && export PATH=`$PATH:/root/.dotnet/tools && dotnet restore && dotnet ef migrations add InitialCreate -o Migrations"

Write-Host ""
Write-Host "Migration gerada em backend\LocacaoVeiculos.Api\Migrations\" -ForegroundColor Green
Write-Host "Agora rode: docker compose up --build" -ForegroundColor Green
