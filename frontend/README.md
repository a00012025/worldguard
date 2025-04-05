# WorldGuard Frontend

A React frontend for the WorldGuard Telegram bot that integrates with World ID for human verification.

## Features

- World ID integration for human verification
- Responsive design for mobile and desktop
- Integration with the WorldGuard backend API

## Prerequisites

- Node.js 16+ and pnpm
- World ID App ID (obtain from the [World ID Developer Portal](https://developer.worldcoin.org))

## Setup Instructions

1. Install dependencies:

```bash
pnpm install
```

2. Create a `.env` file based on the provided `.env.example`:

```bash
cp .env.example .env
```

3. Edit the `.env` file and add your World ID App ID:

```
VITE_API_URL=http://localhost:3000
VITE_WORLD_APP_ID=app_your_app_id_here
```

4. Start the development server:

```bash
pnpm dev
```

5. Build for production:

```bash
pnpm build
```

## How It Works

1. When a user joins a Telegram group with the WorldGuard bot:
   - The bot sends a verification link to the Telegram user
   - The link directs to this frontend application

2. In the frontend:
   - The user is prompted to verify with World ID
   - World ID verification is performed using the mini-app SDK
   - Upon successful verification, the proof is sent to the backend
   - The backend communicates with the Telegram bot to grant the user access

## Project Structure

- `src/components/` - Reusable React components
- `src/contexts/` - React context providers
- `src/pages/` - Page components
- `src/services/` - API and service functions

## Key Technologies

- React with TypeScript
- Vite for fast development and building
- World ID Mini-App SDK for verification
- React Router for navigation
- Axios for API requests
