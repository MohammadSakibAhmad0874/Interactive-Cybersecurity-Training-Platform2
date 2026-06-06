# 🐳 Docker Deployment Guide — Cyber Attack Simulation Lab

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 24.0
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2.0
- 2GB free disk space
- Ports **80** available (or modify `docker-compose.yml`)

---

## One-Command Setup

```bash
# 1. Clone / open the project
cd "Cyber Attack Simulation Lab"

# 2. Copy and configure environment (optional — defaults work out of the box)
cp .env.example .env
# Edit .env to change JWT_SECRET for production

# 3. Build and start all services
docker-compose up --build

# Or run in background (detached mode)
docker-compose up --build -d
```

Open **http://localhost** in your browser.  
Default admin login: `admin@cyberlab.local` / `Admin@123`

---

## Service Architecture

| Service | Container | Port | Image |
|---------|-----------|------|-------|
| Frontend | `casl-frontend` | 80 | nginx:alpine |
| Backend | `casl-backend` | 5000 (internal) | node:20-alpine |

The SQLite database is persisted in a Docker named volume (`casl-sqlite-data`) so data survives container restarts.

---

## Common Commands

```bash
# View logs
docker-compose logs -f

# View logs for a specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Stop and remove volumes (DELETES ALL DATA)
docker-compose down -v

# Restart a single service
docker-compose restart backend

# Shell into backend container
docker-compose exec backend sh

# Check SQLite database
docker-compose exec backend sh -c "ls -la /app/data/"

# Rebuild without cache
docker-compose build --no-cache
docker-compose up
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_SECRET` | `cyberlab_super_secret_...` | **Change this in production!** |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `NODE_ENV` | `production` | Runtime environment |
| `PORT` | `5000` | Backend port (internal) |

---

## Volumes

| Volume | Mount | Purpose |
|--------|-------|---------|
| `casl-sqlite-data` | `/app/data` | SQLite database persistence |

---

## Health Checks

The backend container exposes a health check at `GET /api/health`:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

The frontend container only starts after the backend reports healthy (Docker `depends_on` with health condition).

---

## Accessing the Database

```bash
# Copy database out of container
docker cp casl-backend:/app/data/cyber_lab.db ./cyber_lab.db

# Open with any SQLite browser (e.g., DB Browser for SQLite)
# Or query from shell:
docker-compose exec backend sh -c "sqlite3 /app/data/cyber_lab.db '.tables'"
```

---

## Changing the Default Port

To run on a port other than 80, edit `docker-compose.yml`:

```yaml
frontend:
  ports:
    - "8080:80"   # Access via http://localhost:8080
```

---

## Production Notes

1. **Change JWT_SECRET** — use `openssl rand -hex 32` to generate a secure key
2. **HTTPS** — place a reverse proxy (Nginx/Traefik/Caddy) in front with TLS
3. **Backup** — the `casl-sqlite-data` volume should be backed up regularly
4. **Updates** — `docker-compose pull && docker-compose up --build`
