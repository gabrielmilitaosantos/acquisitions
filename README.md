# Acquisitions API

A secure, production-ready Node.js/Express REST API for managing users in the acquisitions app with JWT-based authentication, role-based authorization, and comprehensive security features.

> 💡 **Note**: This is my first experience building with [Warp AI Agent](https://www.warp.dev) — an intelligent development environment that helped accelerate this project!

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication with httpOnly cookies
  - Role-based access control (User/Admin)
  - Password hashing with bcrypt
  - Secure session management

- **User Management**
  - Complete CRUD operations for user accounts
  - Profile management with authorization checks
  - Admin-only operations protection
  - Last admin deletion safeguard

- **Security**
  - Arcjet integration for DDoS protection and rate limiting
  - Bot detection and prevention
  - Helmet.js for HTTP security headers
  - CORS configuration
  - Input validation with Zod schemas

- **Developer Experience**
  - Hot reload in development mode
  - Comprehensive logging with Winston
  - ESLint and Prettier configured
  - Docker support (dev and prod)
  - CI/CD pipelines with GitHub Actions

## 📋 Prerequisites

- **Node.js**: >= 18.x
- **npm**: >= 9.x
- **PostgreSQL**: Database (or use Neon serverless)
- **Docker** (optional): For containerized deployment

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/gabrielmilitaosantos/acquisitions.git
cd acquisitions
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```bash
# Server Config
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# Database Config
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Arcjet (optional, for security features)
ARCJET_KEY=your-arcjet-key-here
```

> 📝 See `.env.example` for reference

### 4. Set up the database

Generate and run migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

#### Sign Up

```http
POST /api/auth/sign-up
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "user"  // optional, defaults to "user"
}
```

#### Sign In

```http
POST /api/auth/sign-in
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Sign Out

```http
POST /api/auth/sign-out
```

### User Management Endpoints

> 🔒 All user endpoints require authentication

#### Get All Users (Admin only)

```http
GET /api/users
Authorization: Bearer <token>
```

#### Get User by ID

```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Update User

```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

> Note: Users can only update their own info; admins can update any user. Only admins can change roles.

#### Delete User

```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

> Note: Users can only delete their own account; admins can delete any user. Cannot delete the last admin.

### Health Check

```http
GET /health
```

## 🧪 Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

## 🔧 Development Commands

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start development server with hot reload |
| `npm start`            | Start production server                  |
| `npm run lint`         | Run ESLint checks                        |
| `npm run lint:fix`     | Auto-fix ESLint issues                   |
| `npm run format`       | Format code with Prettier                |
| `npm run format:check` | Check code formatting                    |
| `npm run db:generate`  | Generate Drizzle migrations              |
| `npm run db:migrate`   | Apply database migrations                |
| `npm run db:studio`    | Open Drizzle Studio (database GUI)       |
| `npm test`             | Run Jest tests                           |

## 🐳 Docker Deployment

### Development

```bash
npm run dev:docker
```

### Production

```bash
npm run prod:docker
```

Or manually:

```bash
# Build image
docker build -t acquisitions-api .

# Run container
docker run -p 3000:3000 --env-file .env acquisitions-api
```

See [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) for detailed Docker instructions.

## 📁 Project Structure

```
acquisitions/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD pipelines
├── src/
│   ├── config/            # Database, logger, Arcjet configuration
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Authentication, security middleware
│   ├── models/            # Drizzle ORM schemas
│   ├── routes/            # Express route definitions
│   ├── services/          # Business logic layer
│   ├── utils/             # Helper functions (JWT, cookies, formatting)
│   ├── validations/       # Zod validation schemas
│   ├── app.js             # Express app configuration
│   ├── server.js          # Server initialization
│   └── index.js           # Entry point
├── tests/                 # Jest test files
├── drizzle/               # Database migrations
├── logs/                  # Application logs
├── scripts/               # Deployment scripts
├── .env                   # Environment variables (not in git)
├── .env.example           # Environment template
├── docker-compose.*.yaml  # Docker compose configurations
├── Dockerfile             # Docker image definition
├── package.json           # Dependencies and scripts
└── AGENTS.md              # Warp AI Agent context
```

## 🏗️ Architecture

This project follows a layered architecture pattern:

1. **Routes** → Define API endpoints
2. **Controllers** → Handle HTTP requests/responses
3. **Services** → Contain business logic
4. **Models** → Define database schemas
5. **Middleware** → Handle cross-cutting concerns (auth, logging)

### Request Flow

```
Client Request
    ↓
Security Middleware (Arcjet, Helmet, CORS)
    ↓
Route Handler
    ↓
Authentication Middleware (if protected)
    ↓
Controller (validates with Zod)
    ↓
Service (business logic)
    ↓
Database (Drizzle ORM)
    ↓
Response to Client
```

## 🔐 Security Features

- **Arcjet Protection**: DDoS mitigation, bot detection, rate limiting
- **JWT Tokens**: 1-day expiration with secure signing
- **httpOnly Cookies**: 15-minute cookie lifetime, secure in production
- **Password Hashing**: bcrypt with 10 salt rounds
- **Input Validation**: Zod schemas for all inputs
- **HTTP Security**: Helmet.js for security headers
- **CORS**: Configured cross-origin resource sharing

## 🌍 Environment Variables

| Variable       | Description                  | Default     | Required |
| -------------- | ---------------------------- | ----------- | -------- |
| `PORT`         | Server port                  | 3000        | No       |
| `NODE_ENV`     | Environment mode             | development | No       |
| `DATABASE_URL` | PostgreSQL connection string | -           | Yes      |
| `JWT_SECRET`   | Secret key for JWT signing   | -           | Yes      |
| `LOG_LEVEL`    | Winston log level            | info        | No       |
| `ARCJET_KEY`   | Arcjet API key               | -           | No       |

## 🚦 CI/CD Pipeline

This project includes GitHub Actions workflows for:

- **Linting & Formatting**: Runs ESLint and Prettier checks
- **Testing**: Executes Jest test suite
- **Docker Build**: Builds and pushes to Docker Hub

## 📝 Logging

Winston logger is configured with:

- **Development**: Colorized console output
- **Production**: File-based logging (`logs/error.log`, `logs/combined.log`)
- **HTTP Requests**: Logged via Morgan middleware

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👤 Author

**Gabriel Militao Santos**

- GitHub: [@gabrielmilitaosantos](https://github.com/gabrielmilitaosantos)
- Repository: [acquisitions](https://github.com/gabrielmilitaosantos/acquisitions)

## 🙏 Acknowledgments

- Built with [Warp AI Agent](https://www.warp.dev) — an intelligent development assistant
- [Express](https://expressjs.com/) - Fast, unopinionated web framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Arcjet](https://arcjet.com/) - Security and rate limiting
- [Zod](https://zod.dev/) - TypeScript-first schema validation

---
