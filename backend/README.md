# WorldGuard - Anti-Spam Telegram Bot

A Telegram bot that protects groups from spam by requiring new members to verify their identity using World ID.

## Features

- Automatically restricts new members from sending messages until verified
- Integrates with World ID for secure human verification
- Kicks users who don't verify within a configurable time limit (default: 5 minutes)
- Maintains verification state with in-memory storage (no database required)

## Prerequisites

- Node.js 16+ and pnpm
- Telegram Bot token (obtain from [@BotFather](https://t.me/BotFather))
- World ID App ID (create from the [World ID Developer Portal](https://developer.worldcoin.org))

## Setup Instructions

1. Clone the repository and navigate to the backend directory:

```bash
git clone https://github.com/yourusername/worldguard.git
cd worldguard/backend
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file based on the provided `.env.example`:

```bash
cp .env.example .env
```

4. Edit the `.env` file and add your Telegram Bot token and World ID App ID:

```
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
WORLD_APP_ID=app_your_world_app_id_here
PORT=3000
HOST=localhost
VERIFICATION_TIMEOUT_MS=180000
```

5. Build the project:

```bash
pnpm build
```

6. Start the bot:

```bash
pnpm start
```

For development, you can use:

```bash
pnpm dev
```

## How It Works

1. When a new user joins a group where WorldGuard is added:
   - The bot restricts their ability to send messages
   - The bot sends a verification message with a button linking to World ID

2. The user clicks the button and completes verification in the World ID app

3. After successful verification:
   - The World ID app sends the proof to the backend
   - The backend verifies the proof
   - The bot grants message permissions to the verified user

4. If a user doesn't complete verification within the time limit:
   - The bot removes the user from the group
   - The bot cleans up the verification message

## Adding the Bot to a Telegram Group

1. Add the bot to your group by searching for its username
2. Make the bot an administrator with the following permissions:
   - Delete messages
   - Ban users
   - Restrict members

## Development

The project structure is organized as follows:

- `src/index.ts` - Main entry point
- `src/bot/telegramBot.ts` - Telegram bot implementation
- `src/server/expressServer.ts` - Express server for World ID verification
- `src/utils/stateManager.ts` - In-memory state management

## License

[MIT](LICENSE)
