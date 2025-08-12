# OpenChat - Synchronous Communication Platform

**CS 467/Summer/2025 Capstone Project**

[![CI](https://github.com/yshrkume/openchat/actions/workflows/ci.yml/badge.svg)](https://github.com/yshrkume/openchat/actions/workflows/ci.yml)

OpenChat is a real-time, team chat platform that bridges the gap between Slack-like channels and Discord-style direct messaging.  It’s a fully functional web-based application, complete with registration, and the ability to login and logout. It allows for real-time direct messaging between users, notifications for new messages/mentions, member lists, user status indicators, as well as basic emoji support.  There is also support for creation of public and private channels. It emphasizes responsive UX, reliable delivery, and an architecture that’s easy to develop locally and deploy to the cloud.

## Live Demo

**Production**: https://openchat-frontend-494715638539.us-west1.run.app/

## Preview
<img width="2557" height="1351" alt="Screenshot from 2025-08-11 21-15-32" src="https://github.com/user-attachments/assets/f9879d25-9f3a-4a84-947c-ebf82eca43ea" />


## Team Members

- **Archie Barash**
- **Wassim El Moznine**
- **Yashiro Kume**
- **Douglas Leedke**
- **Sarah Nowalk**

## Development

### Prerequisites

- Node.js (v20 or higher)
- npm (v10 or higher)
- Docker (for database)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd openchat
   ```

2. Install dependencies for all workspaces:

   ```bash
   npm install
   ```

3. Set up environment variables:

   **Server (required):**
   ```bash
   cd server
   cp .env.sample .env
   # Edit .env file:
   # - Configure DATABASE_URL if using non-default database settings
   # - Set JWT_SECRET (generate with: openssl rand -base64 32)
   ```

   **Client (for development):**
   ```bash
   cd client
   cp .env.example .env
   # The default values work for local development
   ```

4. Start the database:

   ```bash
   npm run db:setup
   ```

### Project Structure

```
openchat/
├── client/          # React + Vite frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/          # Express + Socket.io backend
│   ├── src/
│   ├── prisma/      # Database schema and migrations
│   ├── .env.sample  # Environment variables template
│   └── package.json
├── docker-compose.yml  # Database configuration
├── package.json     # Root workspace configuration
└── README.md
```

### Development Commands

#### Start Development Servers

```bash
# Start both client and server simultaneously
npm run dev

# Start client only (frontend)
npm run dev:client

# Start server only (backend)
npm run dev:server
```

#### Database Management

```bash
# Start PostgreSQL database
npm run db:setup

# Stop database
npm run db:down

# Run database migrations
npm run db:migrate

# Reset database
npm run db:reset

# Seed database
npm run db:seed

# Open database UI (Prisma Studio)
npm run db:ui
```

#### Code Quality

```bash
# Run ESLint on both client and server
npm run lint

# Fix ESLint issues automatically
npm run lint:fix
```

#### Testing

The project uses separate databases for development and testing to ensure data isolation:

- **Development DB**: `openchat` (configured in `.env`)
- **Test DB**: `openchat_test` (configured in `.env.test`)

**Test Database Setup (First Time):**
```bash
# 1. Ensure PostgreSQL container is running
npm run db:setup

# 2. Setup test database
cd server
npm run db:test:migrate
```

**Test Database Management:**
```bash
# Setup test database environment
npm run db:test:setup

# Run migrations on test database
npm run db:test:migrate

# Reset test database
npm run db:test:reset

# Seed test database
npm run db:test:seed
```

**Running Tests:**

The project includes comprehensive tests for both client and server components:

**Client Tests (React + Vitest):**
- Component rendering tests
- User interaction tests (button clicks, form interactions)
- UI element presence validation

**Server Tests (Express + Socket.io + Vitest):**
- HTTP endpoint testing with real database
- Socket.io connection handling

```bash
# Run tests for both client and server
npm run test

# Run client tests only
npm run test:client

# Run server tests only
npm run test:server

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI interface (client only)
npm run test:ui --workspace=client
```

**Test Environment Features:**
- Automatic test database selection (`openchat_test`)
- Database cleanup between tests for isolation
- Environment-specific configuration loading
- No interference with development data

#### Individual Workspace Commands

```bash
# Client-specific commands
npm run dev --workspace=client
npm run build --workspace=client
npm run lint --workspace=client

# Server-specific commands
npm run dev --workspace=server
npm run start --workspace=server
npm run lint --workspace=server
```

### Default Ports

- **Client (Frontend)**: http://localhost:5173
- **Server (Backend)**: http://localhost:3000
- **Database**: PostgreSQL on port 5432

### Technology Stack

- **Frontend**: React, Vite, ES Modules
- **Backend**: Express.js, Socket.io, ES Modules
- **Database**: PostgreSQL, Prisma ORM
- **Testing**: Vitest, Testing Library, Supertest, Happy DOM
- **Development**: ESLint, npm workspaces, Docker

### Debug Logging

The server uses the `debug` package for development logging. Debug output is controlled via the `DEBUG` environment variable in `.env`:

```bash
# Show all openchat logs
DEBUG=openchat:*

# Show only auth module logs
DEBUG=openchat:auth

# Show multiple specific modules
DEBUG=openchat:auth,openchat:db
```

### Database Configuration

The application uses PostgreSQL with Prisma ORM. The database configuration is managed through:

- **docker-compose.yml**: Database container setup
- **server/prisma/schema.prisma**: Database schema definition
- **server/.env**: Environment variables (copy from .env.sample)

## CI/CD

This project uses GitHub Actions to run automated workflows for code quality and security.

### Workflows

1. **CI (Continuous Integration)** - `ci.yml`
   - Runs tests and linting on all branches
   - Integration tests with PostgreSQL database
   - Coverage report generation

2. **Deploy** - `deploy.yml`
   - Deploys to Google Cloud Run on main branch
   - Builds and pushes Docker images to Artifact Registry
   - Updates Cloud Run services via Terraform
