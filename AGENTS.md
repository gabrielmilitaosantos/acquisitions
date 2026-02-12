# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Node.js/Express REST API for an acquisitions system with JWT-based authentication. The application uses:
- **Database**: PostgreSQL via Neon serverless with Drizzle ORM
- **Authentication**: JWT tokens stored in httpOnly cookies
- **Validation**: Zod schemas
- **Logging**: Winston (file-based with console in development)

## Development Commands

### Running the Application
- `npm run dev` - Start development server with auto-reload (watches src/index.js)
- Default port: 3000 (configurable via PORT env var)

### Code Quality
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting without modifying files

### Database Operations
- `npm run db:generate` - Generate Drizzle migrations from schema changes
- `npm run db:migrate` - Apply migrations to database
- `npm run db:studio` - Open Drizzle Studio (visual database browser)

## Architecture

### Project Structure
The codebase follows a layered architecture pattern:
```
src/
├── config/        - Database connection, Winston logger setup
├── controllers/   - Request/response handlers
├── services/      - Business logic (user creation, password hashing)
├── models/        - Drizzle ORM schemas (pgTable definitions)
├── routes/        - Express route definitions
├── validations/   - Zod validation schemas
├── utils/         - Shared utilities (JWT, cookies, formatting)
└── middleware/    - (currently empty, ready for auth/error middleware)
```

### Request Flow
1. Route receives request → 2. Controller validates with Zod → 3. Service performs business logic → 4. Database operations via Drizzle → 5. Response with JWT cookie

### Key Implementation Details

**Database Layer**:
- Uses Drizzle ORM with `@neondatabase/serverless` driver
- Schema definitions in `src/models/*.js` (e.g., users.model.js)
- After schema changes: run `npm run db:generate` then `npm run db:migrate`

**Authentication Flow**:
- User data validated with Zod schemas in `src/validations/`
- Passwords hashed with bcrypt (10 rounds) in auth.service.js
- JWT tokens signed with 1-day expiration
- Tokens stored in httpOnly cookies (15 min maxAge, secure in production)

**Logging**:
- Winston logger configured in `src/config/logger.js`
- Development: Console output (colorized, simple format)
- Production: File-based only (logs/error.log, logs/combined.log)
- HTTP requests logged via Morgan middleware

**Environment Variables**:
- Required: `DATABASE_URL` (Neon PostgreSQL connection string)
- Optional: `PORT` (default: 3000), `NODE_ENV`, `LOG_LEVEL`, `JWT_SECRET`
- Reference `.env.example` for complete list

## Current Implementation State

**Completed**:
- User signup endpoint (`POST /api/auth/sign-up`) with email uniqueness validation
- JWT token generation and cookie-based storage
- Database schema for users table with role-based access (user/admin)

**In Progress**:
- Sign-in and sign-out endpoints exist as route stubs but lack controller logic
- No authentication middleware yet for protected routes

## Development Notes

- Project uses ES modules (`"type": "module"` in package.json)
- Import statements must include `.js` extensions
- The middleware directory exists but is currently empty - authentication/authorization middleware should be added here
- Validation errors are formatted via `src/utils/format.js` before responding to clients
