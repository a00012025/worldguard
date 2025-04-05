import { IDKitWidget } from "@worldcoin/idkit";
import { useState } from "react";
import { submitVerification } from "../services/api";

interface VerifyWithWorldIDProps {
  telegramUserId: string;
  telegramChatId: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const VerifyWithWorldID = ({
  telegramUserId,
  telegramChatId,
  onSuccess,
  onError,
}: VerifyWithWorldIDProps) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (proof: unknown) => {
    try {
      setIsVerifying(true);
      const proofString = JSON.stringify(proof);
      await submitVerification(proofString, telegramUserId, telegramChatId);
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="verify-container">
      <p>
        Your chat id: {telegramChatId}
        <br />
        Your user id: {telegramUserId}
      </p>

      <IDKitWidget
        app_id={import.meta.env.VITE_WORLD_APP_ID || ""}
        action="telegram-verification"

        signal={telegramUserId}
        onSuccess={handleVerify}
        handleVerify={() => Promise.resolve()}
      >
        {({ open }) => (
          <button
            onClick={open}
            className="w-full px-6 py-3 bg-black text-white rounded-md hover:bg-black/90 transition-all font-medium"
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify with World ID"}
          </button>
        )}
      </IDKitWidget>
    </div>
  );
};

export default VerifyWithWorldID;
