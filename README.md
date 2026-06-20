# CNH Platform

Monorepo com o app **CNH Digital** (`/`) e painel **CNH Admin** (`/admin/`), API em `/api`.

## Desenvolvimento local

```bash
# Terminal 1 — API
cd admin && npm install && npm run server

# Terminal 2 — Admin
cd admin && npm install && npm run dev

# Terminal 3 — App
cd app && npm install && npm run dev
```

- App: http://localhost:5173
- Admin: http://localhost:5174
- API: http://localhost:3001

## Docker

```bash
cp .env.example .env
# Edite .env (JWT_SECRET, MP_ACCESS_TOKEN, etc.)

docker compose up -d --build
```

- App: http://localhost:8080/
- Admin: http://localhost:8080/admin/
- API: http://localhost:8080/api/

Login admin padrão (primeiro start): `admin` / `cnh@2026`

## Estrutura

| Pasta | Descrição |
|-------|-----------|
| `app/` | Frontend CNH Digital (gov.br + CNH) |
| `admin/` | Painel operadores + API Express |
| `docker/` | Nginx + build multi-stage |
