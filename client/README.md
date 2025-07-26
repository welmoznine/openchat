# OpenChat Frontend

React-based frontend for the OpenChat platform built with Vite.

## Environment Variables

The frontend requires environment variables to connect to the backend API:

### Setup

```bash
# Copy the example file
cp .env.example .env
```

### Configuration

- `VITE_API_BASE_URL`: Backend API URL (default: `http://localhost:3000`)

### Development

The default configuration connects to a local development server:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Production

In production, the `VITE_API_BASE_URL` is automatically configured via Terraform to point to the deployed backend service.

## Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Technology Stack

- **React 19**: Frontend framework
- **Vite**: Build tool and development server
- **Socket.io Client**: Real-time communication
- **React Router**: Client-side routing
- **Tailwind CSS**: Styling framework
- **Vitest**: Testing framework
