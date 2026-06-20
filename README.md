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

## Docker local

```bash
cp .env.example .env
docker compose up -d --build
```

App: http://localhost:8080/ · Admin: http://localhost:8080/admin/

## Produção (VPS + Traefik)

Domínios:
- **https://cnh-digital-brasil.online** — app CNH Digital
- **https://cupulafenix.store** — painel admin

```bash
cd /docker/cnh-platform
cp .env.example .env   # configure JWT_SECRET e MP_ACCESS_TOKEN
docker compose -f docker-compose.prod.yml up -d --build
```

Rede Traefik externa: `pix-tips_proxy` (mesma do servidor Lemon).

Login admin padrão (primeiro start): `admin` / `cnh@2026`

## Estrutura

| Pasta | Descrição |
|-------|-----------|
| `app/` | Frontend CNH Digital (gov.br + CNH) |
| `admin/` | Painel operadores + API Express |
| `docker/` | Nginx + build multi-stage |
