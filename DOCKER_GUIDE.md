# Docker Setup Guide - Acquisitions API

This guide explains how to run the Acquisitions API using Docker with Neon Database for both development and production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Architecture Overview](#architecture-overview)
- [Development Setup (with Neon Local)](#development-setup-with-neon-local)
- [Production Deployment (with Neon Cloud)](#production-deployment-with-neon-cloud)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** v3.8 or higher
- **Neon Account** - Sign up at [https://console.neon.tech](https://console.neon.tech)
- **Neon API Key** - Generate from [API Keys Settings](https://console.neon.tech/app/settings/api-keys)
- **Neon Project ID** - Found in your project settings under General

---

## Architecture Overview

### Development Environment
```
┌─────────────────────────────────────────┐
│  Docker Compose (dev)                   │
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   App        │───▶│ Neon Local   │  │
│  │  Container   │    │   Proxy      │  │
│  │              │    │              │  │
│  │  Express +   │    │ Ephemeral    │  │
│  │  Drizzle     │    │  Branches    │  │
│  └──────────────┘    └──────┬───────┘  │
│                             │           │
└─────────────────────────────┼───────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Neon Cloud DB  │
                    │  (Your Project) │
                    └─────────────────┘
```

### Production Environment
```
┌─────────────────────────────────────────┐
│  Docker Compose (prod)                  │
│                                         │
│  ┌──────────────┐                       │
│  │   App        │                       │
│  │  Container   │                       │
│  │              │                       │
│  │  Express +   │                       │
│  │  Drizzle     │                       │
│  └──────┬───────┘                       │
│         │                               │
└─────────┼───────────────────────────────┘
          │
          ▼
    ┌──────────────────┐
    │  Neon Cloud DB   │
    │  (Production)    │
    └──────────────────┘
```

---

## Development Setup (with Neon Local)

### 1. Get Your Neon Credentials

1. **Create a Neon Project** (if you haven't already):
   - Go to [https://console.neon.tech](https://console.neon.tech)
   - Create a new project or select an existing one

2. **Get your Project ID**:
   - In the Neon Console, navigate to **Project Settings → General**
   - Copy the **Project ID** (format: `ep-example-123456`)

3. **Generate an API Key**:
   - Navigate to **Account Settings → API Keys**
   - Click **Generate new API key**
   - Copy and save the API key securely

### 2. Configure Environment Variables

Copy the development environment template:

```powershell
# Windows PowerShell
Copy-Item .env.example .env.development
```

```bash
# Linux/Mac
cp .env.example .env.development
```

Edit `.env.development` and fill in your Neon credentials:

```env
# Neon Local Configuration
NEON_API_KEY=your_actual_neon_api_key
NEON_PROJECT_ID=your_actual_project_id
PARENT_BRANCH_ID=main

# Server Config
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Application Secrets
JWT_SECRET=dev_jwt_secret_change_in_production
```

### 3. Start the Development Environment

```powershell
# Windows PowerShell
docker-compose -f docker-compose.dev.yaml --env-file .env.development up --build
```

```bash
# Linux/Mac
docker-compose -f docker-compose.dev.yaml --env-file .env.development up --build
```

The application will start with:
- **App** running on `http://localhost:3000`
- **Neon Local** proxy on `localhost:5432`
- An **ephemeral database branch** created automatically

### 4. How Neon Local Works in Development

- **Ephemeral Branches**: Each time you start the containers, Neon Local creates a fresh database branch from your parent branch (usually `main`)
- **Automatic Cleanup**: When you stop the containers (`docker-compose down`), the ephemeral branch is automatically deleted
- **No Manual Cleanup**: No need for cleanup scripts or manual branch management
- **Git Integration**: If configured, Neon Local can create a persistent branch per Git branch

### 5. Run Database Migrations

Once the containers are running, execute migrations:

```powershell
# Windows PowerShell
docker-compose -f docker-compose.dev.yaml exec app npm run db:migrate
```

```bash
# Linux/Mac
docker-compose -f docker-compose.dev.yaml exec app npm run db:migrate
```

### 6. Stop the Development Environment

```bash
docker-compose -f docker-compose.dev.yaml down
```

This will:
- Stop all containers
- Remove containers and networks
- Delete the ephemeral database branch (if `DELETE_BRANCH=true`)

---

## Production Deployment (with Neon Cloud)

### 1. Get Your Production Database URL

1. Go to your Neon Console: [https://console.neon.tech](https://console.neon.tech)
2. Select your **production project** (or create a new one for production)
3. Navigate to **Dashboard → Connection Details**
4. Copy the **Connection String** (format: `postgres://user:password@ep-example-123456.region.aws.neon.tech/neondb?sslmode=require`)

### 2. Configure Production Environment

Create a production environment file:

```powershell
# Windows PowerShell
Copy-Item .env.example .env.production
```

```bash
# Linux/Mac
cp .env.example .env.production
```

Edit `.env.production` with your production values:

```env
# Server Config
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Neon Cloud Database (Production)
DATABASE_URL=postgres://user:password@ep-prod-123456.us-east-2.aws.neon.tech/neondb?sslmode=require

# Strong Production Secrets (REPLACE THESE!)
JWT_SECRET=your_very_strong_random_jwt_secret_minimum_32_characters

# Optional: Arcjet
# ARCJET_KEY=your_production_arcjet_key
```

⚠️ **Security Warning**: Never commit `.env.production` to version control!

### 3. Deploy to Production

```bash
docker-compose -f docker-compose.prod.yaml --env-file .env.production up -d --build
```

The `-d` flag runs containers in detached mode (background).

### 4. Run Production Migrations

```bash
docker-compose -f docker-compose.prod.yaml exec app npm run db:migrate
```

### 5. Monitor Production Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yaml logs -f

# View only app logs
docker-compose -f docker-compose.prod.yaml logs -f app
```

### 6. Stop Production Environment

```bash
docker-compose -f docker-compose.prod.yaml down
```

---

## Environment Variables

### Common Variables (Both Environments)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `LOG_LEVEL` | Logging level | `info` |
| `JWT_SECRET` | JWT signing secret | *(required)* |

### Development-Only Variables (Neon Local)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEON_API_KEY` | Neon API key | ✅ Yes | - |
| `NEON_PROJECT_ID` | Neon project ID | ✅ Yes | - |
| `PARENT_BRANCH_ID` | Parent branch for ephemeral branches | No | `main` |
| `DELETE_BRANCH` | Auto-delete branch on stop | No | `true` |
| `DATABASE_NAME` | Database name | No | `neondb` |

### Production-Only Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Full Neon Cloud connection string | ✅ Yes |

---

## Database Migrations

### Generate Migration Files

When you modify your Drizzle schema:

```bash
# Development
docker-compose -f docker-compose.dev.yaml exec app npm run db:generate

# Production
docker-compose -f docker-compose.prod.yaml exec app npm run db:generate
```

### Apply Migrations

```bash
# Development
docker-compose -f docker-compose.dev.yaml exec app npm run db:migrate

# Production
docker-compose -f docker-compose.prod.yaml exec app npm run db:migrate
```

### Open Drizzle Studio (Development Only)

```bash
docker-compose -f docker-compose.dev.yaml exec app npm run db:studio
```

Then open `https://local.drizzle.studio` in your browser.

---

## Troubleshooting

### Issue: "Cannot connect to Neon Local"

**Solution**:
1. Ensure Neon Local container is healthy:
   ```bash
   docker-compose -f docker-compose.dev.yaml ps
   ```
2. Check Neon Local logs:
   ```bash
   docker-compose -f docker-compose.dev.yaml logs neon-local
   ```
3. Verify your `NEON_API_KEY` and `NEON_PROJECT_ID` are correct

### Issue: "Branch not found" or "Project not found"

**Solution**:
- Verify your `NEON_PROJECT_ID` matches your actual project ID from the Neon Console
- Ensure your `PARENT_BRANCH_ID` exists (usually `main`)

### Issue: Self-signed certificate errors in development

**Solution**:
This is expected with Neon Local. The application is already configured to handle this in `src/config/database.js`.

### Issue: Database connection timeout in production

**Solution**:
1. Verify your `DATABASE_URL` is correct
2. Check Neon Console for database status
3. Ensure your production database allows connections from your deployment IP

### Issue: Hot reload not working in development

**Solution**:
The development setup already mounts your source code as a volume. Ensure you're using:
```bash
docker-compose -f docker-compose.dev.yaml up
```

### Rebuild Containers

If you make changes to `package.json` or `Dockerfile`:

```bash
# Development
docker-compose -f docker-compose.dev.yaml up --build

# Production
docker-compose -f docker-compose.prod.yaml up --build -d
```

### Clean Up Everything

Remove all containers, volumes, and images:

```bash
# Development
docker-compose -f docker-compose.dev.yaml down -v

# Production
docker-compose -f docker-compose.prod.yaml down -v
```

---

## Quick Reference

### Start Development
```bash
docker-compose -f docker-compose.dev.yaml --env-file .env.development up
```

### Start Production
```bash
docker-compose -f docker-compose.prod.yaml --env-file .env.production up -d
```

### Run Migrations
```bash
# Dev
docker-compose -f docker-compose.dev.yaml exec app npm run db:migrate

# Prod
docker-compose -f docker-compose.prod.yaml exec app npm run db:migrate
```

### View Logs
```bash
# Dev
docker-compose -f docker-compose.dev.yaml logs -f

# Prod
docker-compose -f docker-compose.prod.yaml logs -f
```

### Stop Everything
```bash
# Dev
docker-compose -f docker-compose.dev.yaml down

# Prod
docker-compose -f docker-compose.prod.yaml down
```

---

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Neon Local Documentation](https://neon.tech/docs/local/neon-local)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

---

**Need Help?**

If you encounter issues not covered in this guide, please:
1. Check the container logs: `docker-compose logs`
2. Verify your environment variables are correct
3. Consult the [Neon Discord](https://discord.gg/neon) or [GitHub Issues](https://github.com/neondatabase/neon/issues)
