import axios from "axios";

const API_URL = "https://sensible-sparrow-admittedly.ngrok-free.app/api";

/**
 * Axios instance with base configuration for API requests
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Submit World ID verification proof to the backend
 * @param proof The World ID verification proof
 * @param telegramId The Telegram user ID
 * @param groupId The Telegram group ID (optional)
 */
export const submitVerification = async (
  payload: string,
  action: string,
  signal: string
) => {
  try {
    const response = await api.post("/verify", {
      payload,
      action,
      signal,
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting verification:", error);
    throw error;
  }
};

/**
 * Check verification status for a Telegram user
 * @param telegramId The Telegram user ID
 */
export const checkVerificationStatus = async (telegramId: string) => {
  try {
    const response = await api.get(`/status/${telegramId}`);
    return response.data;
  } catch (error) {
    console.error("Error checking verification status:", error);
    throw error;
  }
};

export default api;
