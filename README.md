# OpenChat - Synchronous Communication Platform

**CS 467/Summer/2025 Capstone Project**

An open-source, fully customizable web-based chat platform that bridges the gap between specialized communication tools like Slack and Discord.

## Team Members

- **Archie Barash**
- **Wassim El Moznine**
- **Yashiro Kume**
- **Douglas Leedke**
- **Sarah Nowalk**

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
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
```

#### Code Quality

```bash
# Run ESLint on both client and server
npm run lint

# Fix ESLint issues automatically
npm run lint:fix
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
- **Development**: ESLint, npm workspaces, Docker

### Database Configuration

The application uses PostgreSQL with Prisma ORM. The database configuration is managed through:

- **docker-compose.yml**: Database container setup
- **server/prisma/schema.prisma**: Database schema definition
- **server/.env**: Environment variables (copy from .env.sample)

