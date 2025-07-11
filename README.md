# OpenChat - Synchronous Communication Platform

**CS 467/Summer/2025 Capstone Project**

[![CI](https://github.com/yshrkume/openchat/actions/workflows/ci.yml/badge.svg)](https://github.com/yshrkume/openchat/actions/workflows/ci.yml)

An open-source, fully customizable web-based chat platform that bridges the gap between specialized communication tools like Slack and Discord.

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

   ```bash
   cd server
   cp .env.sample .env
   ```

4. Start the database:

   ```bash
   npm run db:setup
   ```

5. Run database migrations:
   ```bash
   npm run db:migrate
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
```

#### Code Quality

```bash
# Run ESLint on both client and server
npm run lint

# Fix ESLint issues automatically
npm run lint:fix
```

#### Testing

The project includes minimal unit tests for both client and server components:

**Client Tests (React + Vitest):**

- Component rendering tests
- User interaction tests (button clicks, form interactions)
- UI element presence validation

**Server Tests (Express + Socket.io + Vitest):**

- HTTP endpoint testing
- Socket.io connection handling
- Error handling

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
npm run test:coverage --workspace=client
npm run test:coverage --workspace=server

# Run tests with UI interface (client only)
npm run test:ui --workspace=client
```

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
