#!/usr/bin/env bash
# Gera a migration inicial do EF Core usando um container temporário do SDK do .NET.
# Não precisa ter .NET instalado na máquina - só Docker.
# Rode isso UMA VEZ, antes do primeiro "docker compose up".
set -e

cd "$(dirname "$0")/../backend/LocacaoVeiculos.Api"

docker run --rm \
  -v "$(pwd):/src" \
  -w /src \
  mcr.microsoft.com/dotnet/sdk:8.0 \
  bash -c "
    dotnet tool install --global dotnet-ef --version 8.* > /dev/null &&
    export PATH=\$PATH:/root/.dotnet/tools &&
    dotnet restore &&
    dotnet ef migrations add InitialCreate -o Migrations
  "

echo ""
echo "Migration gerada em backend/LocacaoVeiculos.Api/Migrations/"
echo "Agora rode: docker compose up --build"
