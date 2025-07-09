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

### Project Structure

```
openchat/
├── client/          # React + Vite frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── server/          # Express + Socket.io backend
│   ├── src/
│   └── package.json
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

### Technology Stack

- **Frontend**: React, Vite, ES Modules
- **Backend**: Express.js, Socket.io, ES Modules
- **Development**: ESLint, npm workspaces
