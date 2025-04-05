import dotenv from "dotenv";
import { startBot } from "./bot/telegramBot";
import { startServer } from "./server/expressServer";

// Load environment variables from .env file
dotenv.config();

// Start the Telegram bot
startBot();

// Start the Express server
const PORT = process.env.PORT || 3000;
startServer(Number(PORT));

console.log("WorldGuard bot is running!");
