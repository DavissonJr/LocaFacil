# LocaFácil — Gestão de Locação de Veículos

MVP multi-tenant (uma instalação atende várias locadoras) para gerenciamento de veículos, clientes e contratos de locação.

## Stack
- **Frontend:** Angular 18 (standalone components)
- **Backend:** .NET 8 Web API + Entity Framework Core
- **Banco:** SQL Server 2022
- **Storage de imagens:** MinIO (S3-compatible)
- **Auth:** JWT (com claim `empresaId` para isolamento multi-tenant)
- **Orquestração:** Docker Compose

## Como rodar

Pré-requisito: apenas **Docker** e **Docker Compose** instalados. Não precisa de .NET nem Node na sua máquina.

### 1. Gerar a migration inicial (só na primeira vez)

```bash
./scripts/gerar-migrations.sh
```

Isso baixa uma imagem temporária do SDK do .NET, gera os arquivos de migration do Entity Framework e sai. Só precisa ser feito uma vez (ou de novo, sempre que você alterar os models em `backend/LocacaoVeiculos.Api/Models`).

### 2. Subir tudo

```bash
docker compose up --build
```

Isso vai subir, em ordem:
1. **SQL Server** (porta 1433)
2. **MinIO** (porta 9000 = API, 9001 = console web)
3. **API .NET** (porta 5000) — aplica as migrations automaticamente ao iniciar
4. **Frontend Angular** (porta 4200)

### 3. Acessar

| Serviço | URL |
|---|---|
| App (frontend) | http://localhost:4200 |
| API (Swagger) | http://localhost:5000/swagger |
| Console MinIO | http://localhost:9001 (usuário: `minioadmin` / senha: `minioadmin123`) |

Abra http://localhost:4200, clique em **"Cadastre-se"** e crie a conta da sua empresa (isso cria o tenant + o usuário administrador). Depois é só logar.

## Como funciona o multi-tenant

- Toda empresa cadastrada vira um "tenant" (tabela `Empresas`).
- Cada usuário pertence a uma empresa.
- No login, o JWT gerado carrega a claim `empresaId`.
- O `AppDbContext` tem um **Global Query Filter** que filtra automaticamente `Veiculos`, `Clientes` e `Contratos` pela empresa do usuário logado — nenhuma query no código dos controllers precisa se preocupar em filtrar isso manualmente, e não tem risco de uma empresa ver dado de outra.

## Estrutura do projeto

```
locacao-veiculos/
├── docker-compose.yml
├── scripts/
│   └── gerar-migrations.sh
├── backend/LocacaoVeiculos.Api/
│   ├── Models/           # Empresa, Usuario, Veiculo, Cliente, Contrato
│   ├── Data/              # AppDbContext + filtro multi-tenant
│   ├── DTOs/
│   ├── Services/          # TokenService (JWT), MinioService (upload de imagens)
│   ├── Controllers/       # Auth, Veiculos, Clientes, Contratos
│   └── Program.cs
└── frontend/src/app/
    ├── core/               # auth service, interceptor JWT, guard, models
    ├── features/
    │   ├── auth/           # login, registro de empresa
    │   ├── veiculos/       # CRUD + upload de foto
    │   ├── clientes/       # CRUD
    │   └── contratos/      # criar locação, finalizar, cancelar
    └── layout/shell/       # sidebar + navegação
```

## Regras de negócio já implementadas

- Ao criar um contrato, o veículo precisa estar com status **Disponível**; ele passa automaticamente para **Locado**.
- Ao finalizar um contrato, o sistema calcula o valor total (dias × valor da diária), atualiza o km do veículo e libera ele novamente como **Disponível**.
- Exclusão de cliente é *soft delete* (fica inativo) para preservar o histórico de contratos.
- Placas e documentos (CPF/CNPJ) são únicos **por empresa** — duas locadoras diferentes podem ter veículos com a mesma placa cadastrados (empresas distintas), mas não a mesma empresa duas vezes.

## Próximos passos sugeridos

- Recuperação de senha / convite de novos usuários dentro da empresa
- Dashboard com indicadores (veículos disponíveis, receita do mês, contratos vencendo)
- Notificação de contratos próximos do vencimento
- Testes automatizados (xUnit no backend, Jasmine/Karma no frontend)

## ⚠️ Antes de ir para produção

- Troque a chave JWT (`Jwt:Key` em `appsettings.json`) por um valor longo e aleatório, via variável de ambiente/secret — nunca deixe hardcoded no repositório.
- Troque as senhas padrão do SQL Server e do MinIO.
- Ative HTTPS (hoje tudo roda em HTTP simples, adequado só para desenvolvimento local).
