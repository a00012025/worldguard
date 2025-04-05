import TelegramBot from "node-telegram-bot-api";
import { stateManager } from "../utils/stateManager";

// Set the bot token from environment variables
const token = process.env.TELEGRAM_BOT_TOKEN || "";

// Verification timeout in milliseconds (default: 5 minutes)
const VERIFICATION_TIMEOUT_MS = parseInt(
  process.env.VERIFICATION_TIMEOUT_MS || "300000",
  10
);

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

/**
 * Initialize the Telegram bot
 */
export function startBot() {
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set in environment variables");
  }

  console.log("Starting Telegram bot...");

  // Handle when a new member joins the chat
  bot.on("new_chat_members", async (msg) => {
    const chatId = msg.chat.id;

    // Process each new member
    // Check if new_chat_members exists
    if (!msg.new_chat_members) return;

    for (const user of msg.new_chat_members) {
      if (user.is_bot) continue; // Skip bots

      const userId = user.id;
      const username = user.username;

      console.log(`New user joined: ${username}, ${userId} in chat ${chatId}`);

      try {
        // Restrict user from sending messages initially
        await bot.restrictChatMember(chatId, userId, {
          can_send_messages: false,
          can_send_photos: false,
          can_send_videos: false,
          can_send_audios: false,
          can_send_voice_notes: false,
          can_send_documents: false,
          can_send_polls: false,
          can_send_other_messages: false,
          can_add_web_page_previews: false,
        });

        // Add user to verification queue
        stateManager.addUserToVerification(chatId, userId, username);

        // Send verification message with button
        const message = await bot.sendMessage(
          chatId,
          `Welcome @${
            username || userId
          }! To prevent spam, please verify you're human using World ID.`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🌎 Verify with World ID",
                    url: `https://worldcoin.org/mini-app?app_id=app_e9ff38ec52182a86a2101509db66c179&action=${encodeURIComponent(
                      "worldguard-verification"
                    )}&signal=${encodeURIComponent(
                      userId.toString()
                    )}&redirect_url=${encodeURIComponent(
                      `https://t.me/worldguard_bot?start=verify_${chatId}_${userId}`
                    )}`,
                  },
                ],
              ],
            },
          }
        );

        // Store verification message ID for later cleanup
        stateManager.setVerificationMessageId(
          chatId,
          userId,
          message.message_id
        );

        // Set timeout to kick user if not verified in time
        const timerId = setTimeout(
          () => handleVerificationTimeout(chatId, userId),
          VERIFICATION_TIMEOUT_MS
        );
        stateManager.setVerificationTimer(chatId, userId, timerId);
      } catch (error) {
        console.error(
          `Error handling new member ${userId} in chat ${chatId}:`,
          error
        );
      }
    }
  });

  // Handle when a user leaves the chat
  bot.on("left_chat_member", (msg) => {
    const chatId = msg.chat.id;
    // Check if left_chat_member exists
    if (!msg.left_chat_member) return;
    const userId = msg.left_chat_member.id;

    // Clean up verification state
    stateManager.removeUserVerification(chatId, userId);
  });

  // Handle deep link start commands (for verification callback)
  bot.onText(/\/start verify_(\d+)_(\d+)/, (msg, match) => {
    if (!match) return;

    const fromId = msg.from?.id;
    const chatId = parseInt(match[1], 10);
    const userId = parseInt(match[2], 10);

    // Ensure the user starting the bot is the same one being verified
    if (fromId !== userId) {
      bot.sendMessage(msg.chat.id, "This verification link is not for you.");
      return;
    }

    // This is just a confirmation message - actual verification happens via the API
    bot.sendMessage(
      msg.chat.id,
      "Thanks for starting the verification process. Please complete it in the World ID app."
    );
  });

  console.log("Telegram bot started successfully");

  return bot;
}

/**
 * Handle when a user's verification times out
 */
async function handleVerificationTimeout(chatId: number, userId: number) {
  const state = stateManager.getUserVerification(chatId, userId);

  if (!state || state.isVerified) return;

  try {
    console.log(`Verification timeout for user ${userId} in chat ${chatId}`);

    // Send message that user is being removed due to timeout
    await bot.sendMessage(
      chatId,
      `User ${
        state.username ? "@" + state.username : userId
      } has been removed for not completing verification.`
    );

    // Delete the verification message if possible
    if (state.verificationMessageId) {
      try {
        await bot.deleteMessage(chatId, state.verificationMessageId);
      } catch (error) {
        console.error("Error deleting verification message:", error);
      }
    }

    // Kick user from the group (using banChatMember which replaced kickChatMember)
    await bot.banChatMember(chatId, userId, {
      until_date: Math.floor(Date.now() / 1000) + 30, // Ban for 30 seconds
    });

    // Clean up verification state
    stateManager.removeUserVerification(chatId, userId);
  } catch (error) {
    console.error(
      `Error handling verification timeout for ${userId} in chat ${chatId}:`,
      error
    );
  }
}

/**
 * Mark a user as verified and allow them to chat
 */
export async function markUserAsVerified(
  chatId: number,
  userId: number
): Promise<boolean> {
  const state = stateManager.getUserVerification(chatId, userId);

  if (!state) {
    console.warn(
      `Cannot verify user ${userId} in chat ${chatId}: user not found in verification queue`
    );
    return false;
  }

  try {
    // Mark as verified in state
    stateManager.setUserVerified(chatId, userId);

    // Remove timeout
    if (state.verificationTimerId) {
      clearTimeout(state.verificationTimerId);
    }

    // Allow user to send messages
    await bot.restrictChatMember(chatId, userId, {
      can_send_messages: true,
      can_send_photos: true,
      can_send_videos: true,
      can_send_audios: true,
      can_send_voice_notes: true,
      can_send_documents: true,
      can_send_polls: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
    });

    // Send success message
    await bot.sendMessage(
      chatId,
      `User ${
        state.username ? "@" + state.username : userId
      } has been verified and can now chat!`
    );

    // Delete the verification message if possible
    if (state.verificationMessageId) {
      try {
        await bot.deleteMessage(chatId, state.verificationMessageId);
      } catch (error) {
        console.error("Error deleting verification message:", error);
      }
    }

    return true;
  } catch (error) {
    console.error(
      `Error marking user ${userId} as verified in chat ${chatId}:`,
      error
    );
    return false;
  }
}
