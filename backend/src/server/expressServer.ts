import express from "express";
import {
  verifyCloudProof,
  IVerifyResponse,
  ISuccessResult,
} from "@worldcoin/minikit-js";
import { markUserAsVerified } from "../bot/telegramBot";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Create and start the server
export function startServer(port: number) {
  if (!process.env.WORLD_APP_ID) {
    throw new Error("WORLD_APP_ID is not set in environment variables");
  }

  console.log("Starting Express server...");

  // Simple health check endpoint
  app.get("/health", function (req, res) {
    res.status(200).json({ status: "ok" });
  });

  // Endpoint to verify World ID proof
  app.post("/api/verify", function (req, res) {
    const { payload, action, signal, chatId } = req.body;

    if (!payload || !action || !signal || !chatId) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters",
      });
    }

    console.log(
      `Received verification request for user ${signal} in chat ${chatId}`
    );

    // The action ID you configured in World ID Developer Portal
    const actionId = action || "worldguard-verification";

    // Convert the string signal to integer for the Telegram user ID
    const userId = parseInt(signal, 10);
    const groupChatId = parseInt(chatId, 10);

    if (isNaN(userId) || isNaN(groupChatId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid userId or chatId",
      });
    }

    // Verify the proof with World ID
    const app_id = process.env.WORLD_APP_ID as `app_${string}`;
    verifyCloudProof(payload as ISuccessResult, app_id, actionId, signal)
      .then((verifyRes: IVerifyResponse) => {
        if (verifyRes.success) {
          console.log(
            `Verification successful for user ${userId} in chat ${groupChatId}`
          );

          // Mark the user as verified in the bot
          markUserAsVerified(groupChatId, userId)
            .then((success) => {
              if (success) {
                return res.status(200).json({
                  success: true,
                  message: "Verification successful",
                });
              } else {
                return res.status(404).json({
                  success: false,
                  error: "User not found in verification queue",
                });
              }
            })
            .catch((error) => {
              console.error("Error marking user as verified:", error);
              return res.status(500).json({
                success: false,
                error: "Internal server error",
              });
            });
        } else {
          console.error(`Verification failed for user ${userId}:`, verifyRes);
          return res.status(400).json({
            success: false,
            error: "Verification failed",
            details: verifyRes,
          });
        }
      })
      .catch((error) => {
        console.error("Error during verification:", error);
        return res.status(500).json({
          success: false,
          error: "Internal server error",
        });
      });
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
  });

  return app;
}
