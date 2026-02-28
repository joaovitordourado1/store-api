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
