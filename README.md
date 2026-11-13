# Store API

Backend de uma loja virtual construído com **Express**, **Prisma** e **Stripe**.

## Tecnologias

- **Node.js** + **TypeScript**
- **Express 5** — HTTP framework
- **Prisma** — ORM (PostgreSQL)
- **Stripe** — Processamento de pagamentos
- **Zod** — Validação de schemas
- **bcrypt** — Hash de senhas
- **UUID** — Geração de tokens

## Estrutura do projeto

```
src/
├── controllers/     # Handlers das rotas
├── services/        # Regras de negócio e acesso ao banco
├── schemas/         # Validação com Zod
├── middlewares/      # Auth middleware
├── libs/            # Prisma client e Stripe SDK
├── routes/          # Definição das rotas
├── types/           # Tipos TypeScript
├── utils/           # Funções auxiliares
└── server.ts        # Entrypoint
```

## Setup

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Gerar o Prisma Client
npm run generate

# Rodar migrations
npm run migrate

# Popular o banco (opcional)
npm run seed

# Iniciar em modo dev
npm run dev
```

O servidor sobe em `http://localhost:4000` por padrão.

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do PostgreSQL |
| `STRIPE_KEY` | Secret key do Stripe |
| `STRIPE_WEBHOOK_SECRET_KEY` | Secret do webhook do Stripe |
| `BASE_URL` | URL base da API (para montar URLs de imagens) |
| `FRONTEND_URL` | URL do frontend (para redirect do Stripe) |
| `PORT` | Porta do servidor (padrão: 4000) |

## Endpoints

### Público

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/ping` | Health check |
| `GET` | `/banners` | Listar banners |
| `GET` | `/products` | Listar produtos (filtros via query) |
| `GET` | `/products/:id` | Detalhes de um produto |
| `GET` | `/product/:id/related` | Produtos relacionados |
| `GET` | `/category/:slug/metadata` | Metadata de uma categoria |
| `POST` | `/cart/mount` | Montar carrinho a partir de IDs |
| `GET` | `/cart/shipping` | Calcular frete |
| `POST` | `/user/register` | Criar conta |
| `POST` | `/user/login` | Login (retorna token) |
| `POST` | `/webhook/stripe` | Webhook do Stripe |

### Autenticado (Bearer token)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/user/addresses` | Adicionar endereço |
| `GET` | `/user/addresses` | Listar endereços |
| `POST` | `/cart/finish` | Finalizar compra |
| `GET` | `/orders` | Listar pedidos |
| `GET` | `/orders/:id` | Detalhes de um pedido |
| `GET` | `/orders/sessions` | Buscar pedido por session ID do Stripe |

## Scripts

```bash
npm run dev        # Desenvolvimento com hot reload
npm run build      # Compilar TypeScript
npm run seed       # Popular banco com dados de teste
npm run migrate    # Rodar migrations do Prisma
npm run generate   # Gerar Prisma Client
```

---

## Atividade da UFC - Docker, PostgreSQL e GitHub Actions

Este projeto possui Node.js, Express, Prisma 7 e PostgreSQL. O workflow
`.github/workflows/ci.yml` valida as migrations **e os dados** no banco, 
constroi uma imagem Docker, roda o container e verifica rotas HTTP.

### Como executar pelo Docker

```bash
cp .env.example .env
docker compose up -d --build
docker compose ps
curl http://localhost:4000/ping
```

A API aguarda o PostgreSQL ficar pronto e executa `prisma migrate deploy`
automaticamente ao iniciar. Para popular e verificar o banco:

```bash
docker compose exec api npm run seed
docker compose exec api npm run verify:db
curl http://localhost:4000/products
```

Execute o seed apenas uma vez por banco, pois o script original cria
novos produtos e pedidos quando repetido. Para reiniciar com banco vazio:
`docker compose down -v` (esse comando apaga os dados locais).

O Docker usa uma chave Stripe ficticia por padrao, suficiente para demonstrar
a API sem realizar pagamentos. Configure uma chave Stripe de teste verdadeira
no `.env` apenas se precisar usar checkout. **Nao commite o arquivo .env**.

### Como funciona o GitHub Actions

Entre no GitHub em **Actions > Store API - Docker, Prisma e PostgreSQL**.
O workflow pode ser acionado por push, pull request ou `Run workflow`.
Ele cria um PostgreSQL 16 temporario, executa `prisma migrate deploy`,
valida o schema, roda o seed, checa tabelas, colunas, chaves estrangeiras,
indices, migrations concluidas, registros e relacionamentos, constroi
a imagem Docker e testa as rotas `/ping`, `/products` e `/banners`.
O container do banco e descartado automaticamente ao fim do job.

### Cadastrar variaveis no GitHub

Em **Settings > Secrets and variables > Actions > Variables > New repository variable**,
adicione, para a demonstracao:

| Nome | Valor |
| --- | --- |
| `PORT` | `4000` |
| `BASE_URL` | `http://localhost:4000` |
| `FRONTEND_URL` | `http://localhost:3000` |

O workflow ja aceita valores padrao para essas variaveis caso nao tenham
sido cadastradas. Nao e necessario cadastrar um banco hospedado nem
uma chave real do Stripe: o job utiliza banco descartavel, credenciais
ficticias e nao executa pagamentos.

### Evidencias para entregar

Mostre na aba Actions o job concluido com sucesso e as etapas de
migration, seed, verificacao de dados e construcao da imagem Docker.
Os arquivos `Dockerfile`, `compose.yaml`, `prisma/migrations/`,
`.github/workflows/ci.yml` e `scripts/verify-db.mjs` comprovam
a implementacao. Use `npm run migrate:deploy` em CI e
`npm run migrate` apenas em desenvolvimento local.
