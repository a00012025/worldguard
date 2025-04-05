import { useState } from "react";
import { useMiniKit } from "../contexts/MiniKitProvider";
import { verifyWithWorldID as apiVerify } from "../services/api";

interface VerifyWithWorldIDProps {
  telegramUserId: string;
  telegramChatId: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const VerifyWithWorldID = ({
  telegramUserId,
  telegramChatId,
  onSuccess,
  onError,
}: VerifyWithWorldIDProps) => {
  const { isInstalled, isLoading, verifyWithWorldID } = useMiniKit();
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!isInstalled || isLoading) {
      setError("World ID is not available. Please open this app in World App.");
      setVerificationStatus("error");
      onError?.({ message: "World ID is not available" });
      return;
    }

    try {
      setVerificationStatus("loading");
      setError(null);

      // Trigger World ID verification
      const result = await verifyWithWorldID(telegramUserId);

      if (result.status === "error") {
        setError(result.message || "Verification failed");
        setVerificationStatus("error");
        onError?.(result);
        return;
      }

      // Send verification to backend
      const apiResult = await apiVerify({
        payload: result.payload,
        action: "worldguard-verification",
        signal: telegramUserId,
        chatId: telegramChatId,
      });

      setVerificationStatus("success");
      onSuccess?.();

      return apiResult;
    } catch (error) {
      console.error("Verification error:", error);
      setError(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      setVerificationStatus("error");
      onError?.(error);
    }
  };

  if (isLoading) {
    return <div>Loading World ID integration...</div>;
  }

  if (!isInstalled) {
    return (
      <div className="world-id-error">
        <h3>World ID Not Available</h3>
        <p>
          This feature requires World App. Please open this link in the World
          App or download it from your app store.
        </p>
        <div className="app-links">
          <a
            href="https://apps.apple.com/app/worldcoin-world-id/id1640532694"
            target="_blank"
            rel="noreferrer"
          >
            Download for iOS
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.worldcoin.newwallet"
            target="_blank"
            rel="noreferrer"
          >
            Download for Android
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="world-id-verification">
      <h3>Verify with World ID</h3>
      <p>Verify your identity with World ID to access this Telegram group.</p>
      <button
        onClick={handleVerify}
        disabled={verificationStatus === "loading"}
        className={`verify-button ${
          verificationStatus === "loading" ? "loading" : ""
        }`}
      >
        {verificationStatus === "loading"
          ? "Verifying..."
          : "Verify with World ID"}
      </button>

      {verificationStatus === "success" && (
        <div className="success-message">
          <p>Verification successful! You can now chat in the group.</p>
        </div>
      )}

      {verificationStatus === "error" && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={() => setVerificationStatus("idle")}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default VerifyWithWorldID;
