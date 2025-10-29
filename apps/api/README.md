# linkvault API

API REST para gerenciamento de links com autenticação JWT.

## Stack

- Node.js + Express
- TypeScript
- Drizzle ORM
- PostgreSQL
- JWT (access + refresh tokens)
- Bcrypt

## Funcionalidades

- Autenticação completa (registro, login, refresh, logout)
- CRUD de links com status (unread, read, archived)
- Rate limiting (100 req/15min)
- Validação com Zod
- Middlewares de segurança (helmet, cors)

## Setup Local

1. Instalar dependências:
```bash
pnpm install
```

2. Copiar arquivo de ambiente:
```bash
cp env.example .env
```

3. Editar `.env` com suas credenciais.

4. Gerar migrations:
```bash
pnpm db:generate
```

5. Rodar migrations:
```bash
pnpm db:migrate
```

6. Iniciar servidor de desenvolvimento:
```bash
pnpm dev
```

## Rotas

### Autenticação

- `POST /auth/register` - Criar conta
- `POST /auth/login` - Fazer login
- `POST /auth/refresh` - Renovar access token
- `POST /auth/logout` - Fazer logout

### Links (requer autenticação)

- `GET /links` - Listar links (filtro: `?status=unread|read|archived`)
- `POST /links` - Criar link
- `PATCH /links/:id/read` - Marcar como lido
- `PATCH /links/:id/archive` - Arquivar
- `DELETE /links/:id` - Deletar

## Docker

Rodar com Docker Compose:
```bash
docker-compose up -d
```

