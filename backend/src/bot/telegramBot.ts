import TelegramBot from "node-telegram-bot-api";
import { stateManager } from "../utils/stateManager";

// Set the bot token from environment variables
const token = process.env.TELEGRAM_BOT_TOKEN || "";

// Verification timeout in milliseconds (default: 5 minutes)
const VERIFICATION_TIMEOUT_MS = parseInt(
  process.env.VERIFICATION_TIMEOUT_MS || "180000",
  10
);

// Create a bot instance
const bot = new TelegramBot(token, {
  polling: {
    params: {
      allowed_updates: [
        "message",
        "edited_message",
        "channel_post",
        "edited_channel_post",
        "callback_query",
        "my_chat_member",
        "chat_member",
        "chat_join_request",
      ],
    },
  },
});

// Store bot ID for later use
let botId: number;

/**
 * Helper function to format bot messages with consistent styling
 */
const formatBotMessage = (
  title: string,
  content: string,
  buttons?: TelegramBot.InlineKeyboardButton[][]
) => {
  const message = `*${title}*\n\n${content}`;

  const options: TelegramBot.SendMessageOptions = {
    parse_mode: "Markdown",
  };

  if (buttons) {
    options.reply_markup = {
      inline_keyboard: buttons,
    };
  }

  return { message, options };
};

/**
 * Handle the process for a new member joining a chat
 */
async function handleNewMember(
  chatId: number,
  userId: number,
  username?: string
) {
  console.log(`Processing new member: ${username || userId} in chat ${chatId}`);

  // Check if user is already in verification process to prevent duplicate processing
  const existingVerification = stateManager.getUserVerification(chatId, userId);
  if (existingVerification) {
    console.log(
      `User ${userId} in chat ${chatId} is already in verification process, skipping`
    );
    return;
  }

  try {
    // Check bot permissions first
    try {
      const chatMember = await bot.getChatMember(chatId, botId);
      if (chatMember.status !== "administrator") {
        console.warn(
          `Bot is not an administrator in chat ${chatId}, cannot restrict members`
        );
        return;
      }

      // Check if bot has permission to restrict members
      const botPermissions = chatMember as any;
      if (!botPermissions.can_restrict_members) {
        console.warn(
          `Bot doesn't have permission to restrict members in chat ${chatId}`
        );
        return;
      }
    } catch (error) {
      console.error(`Error checking bot permissions in chat ${chatId}:`, error);
      return;
    }

    // Restrict user from sending messages initially
    try {
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
    } catch (error) {
      console.error(
        `Failed to restrict user ${userId} in chat ${chatId}:`,
        error
      );
      // Continue with verification process even if restriction fails
    }

    // Add user to verification queue
    stateManager.addUserToVerification(chatId, userId, username);

    // Format welcome message with more information
    const verificationContent =
      `Welcome @${username || userId}!\n\n` +
      "To prevent spam, please verify you're human using World ID.\n\n" +
      "World ID is a digital passport that protects groups from bots while preserving your privacy. " +
      "The verification takes just a few seconds.";

    const verificationButtons = [
      [
        {
          text: "🌎 Verify with World ID",
          url: (() => {
            // Create the signal in the requested format
            const signal = `${userId}_${chatId}`;

            // Create a path with all parameters
            let path = `?action=worldguard-verification&signal=${signal}`;
            // Encode the entire path
            const encodedPath = encodeURIComponent(path);

            // Construct the final URL
            return `https://worldcoin.org/mini-app?app_id=app_e9ff38ec52182a86a2101509db66c179&path=${encodedPath}`;
          })(),
        },
      ],
    ];

    // Send verification message with button
    try {
      const message = await bot.sendMessage(chatId, verificationContent, {
        reply_markup: {
          inline_keyboard: verificationButtons,
        },
      });

      // Store verification message ID for later cleanup
      stateManager.setVerificationMessageId(chatId, userId, message.message_id);
    } catch (error) {
      console.error(
        `Failed to send verification message for user ${userId} in chat ${chatId}:`,
        error
      );
    }

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

/**
 * Initialize the Telegram bot
 */
export function startBot() {
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not set in environment variables");
  }

  console.log("Starting Telegram bot...");

  // Get bot info to store its ID
  bot.getMe().then((botInfo) => {
    botId = botInfo.id;
    console.log(`Bot initialized with ID: ${botId}`);
  });

  // Set up bot commands menu
  bot
    .setMyCommands([
      {
        command: "start",
        description: "Start the bot and get usage instructions",
      },
      { command: "help", description: "Show help information" },
    ])
    .then(() => {
      console.log("Bot commands menu set up successfully");
    })
    .catch((error) => {
      console.error("Error setting up bot commands menu:", error);
    });

  // Handle when a new member joins the chat (via new_chat_members event)
  bot.on("new_chat_members", async (msg) => {
    const chatId = msg.chat.id;

    // Process each new member
    // Check if new_chat_members exists
    if (!msg.new_chat_members) return;

    for (const user of msg.new_chat_members) {
      if (user.is_bot) continue; // Skip bots

      const userId = user.id;
      const username = user.username;

      console.log(
        `New user joined via new_chat_members: ${username}, ${userId} in chat ${chatId}`
      );

      // Use the extracted function to handle the new member
      await handleNewMember(chatId, userId, username);
    }
  });

  // Handle when a chat member's status changes (including when they join)
  bot.on("chat_member", async (chatMemberUpdate) => {
    console.log("Chat member status updated:", chatMemberUpdate);

    // Check if this is a new member joining (status changed to 'member')
    if (
      chatMemberUpdate.old_chat_member.status !== "member" &&
      chatMemberUpdate.new_chat_member.status === "member"
    ) {
      const userId = chatMemberUpdate.new_chat_member.user.id;
      const chatId = chatMemberUpdate.chat.id;
      const username = chatMemberUpdate.new_chat_member.user.username;

      console.log(
        `User joined via chat_member event: ${
          username || userId
        } in chat ${chatId}`
      );

      // Skip if it's the bot itself
      if (userId === botId) {
        console.log(`Skipping verification for bot itself (ID: ${botId})`);
        return;
      }

      // Use the extracted function to handle the new member
      await handleNewMember(chatId, userId, username);
    }
  });

  // Handle when a user leaves the chat
  bot.on("left_chat_member", (msg) => {
    const chatId = msg.chat.id;
    // console.log("left_chat_member", msg);

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

    console.log("start verify!", msg, match);

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

  // Handle basic /start command when users interact with the bot directly
  bot.onText(/^\/start$/, async (msg) => {
    const chatId = msg.chat.id;

    // Get bot info to use the username in the add to group link
    const botInfo = await bot.getMe();
    const botUsername = botInfo.username;

    const content =
      "I help protect Telegram groups from spam and bots using World ID verification.\n\n" +
      "🚀 *How to use me:*\n" +
      "1. Add this bot to your existing group\n" +
      "2. Make the bot an admin with these permissions:\n" +
      "   - Delete messages\n" +
      "   - Ban users\n" +
      "   - Restrict members\n\n" +
      "No additional setup needed - verification will take effect immediately!\n\n" +
      "When new users join your group, they'll be asked to verify with World ID before they can chat.";

    const buttons = [
      [
        {
          text: "➕ Add to Group",
          url: `https://t.me/${botUsername}?startgroup=start`,
        },
      ],
      [
        {
          text: "📋 Learn About World ID",
          url: "https://worldcoin.org/world-id",
        },
      ],
    ];

    const { message, options } = formatBotMessage(
      "👋 Welcome to WorldGuard Bot!",
      content,
      buttons
    );

    // Send welcome message with instructions
    bot.sendMessage(chatId, message, options);
  });

  // Handle /help command
  bot.onText(/^\/help$/, (msg) => {
    const chatId = msg.chat.id;

    const content =
      "*Commands:*\n" +
      "- /start - Show welcome message\n" +
      "- /help - Show this help message\n\n" +
      "*Setup Instructions:*\n" +
      "1. Add this bot to your group\n" +
      "2. Make the bot an admin with these permissions:\n" +
      "   - Delete messages\n" +
      "   - Ban users\n" +
      "   - Restrict members\n\n" +
      "*How it Works:*\n" +
      "When someone joins your group, they'll be asked to verify with World ID. If they don't verify within 3 minutes, they'll be removed automatically.\n\n" +
      "Need more help? Contact us through the button below.";

    const { message, options } = formatBotMessage(
      "🛡️ WorldGuard Bot Help",
      content,
      []
    );

    // Send help message
    bot.sendMessage(chatId, message, options);
  });

  // Handle when the bot is added to a group or its status changes
  bot.on("my_chat_member", async (msg) => {
    console.log(
      "Bot's chat member status changed:",
      msg.new_chat_member?.user?.id,
      msg.new_chat_member?.status
    );

    // Check if the bot was just added to a group
    if (
      msg.new_chat_member &&
      msg.new_chat_member.user.id === botId &&
      ["administrator", "member"].includes(msg.new_chat_member.status)
    ) {
      console.log(`Bot was added to chat ${msg.chat.id}`);
      // Add any initialization code for the bot in this group
    }
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
    try {
      const unbanDate = Math.floor(Date.now() / 1000) + 65;

      await bot.banChatMember(chatId, userId, {
        until_date: unbanDate, // Ban for 31 seconds (must be > 30 to not be permanent)
      });

      console.log(
        `User ${userId} banned until ${new Date(
          unbanDate * 1000
        ).toISOString()}`
      );
    } catch (error) {
      console.error(`Failed to ban user ${userId} from chat ${chatId}:`, error);
    }

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
