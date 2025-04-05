import { MiniKit, VerificationLevel, VerifyCommandInput } from '@worldcoin/minikit-js';
import { useState } from "react";
import { submitVerification } from "../services/api";

interface VerifyWithWorldIDProps {
  signal: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const VerifyWithWorldID = ({
  signal,
  onSuccess,
  onError,
}: VerifyWithWorldIDProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleVerify = async () => {
    if (!MiniKit.isInstalled()) {
      onError?.("World App is not installed");
      return;
    }

    try {
      setIsVerifying(true);

      const verifyPayload: VerifyCommandInput = {
        action: "worldguard-verification",
        signal: signal,
        verification_level: VerificationLevel.Device,
      };

      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

      if (finalPayload.status === 'error') {
        throw new Error(`Error from World App: ${JSON.stringify(finalPayload)}`);
      }

      await submitVerification(
        JSON.stringify(finalPayload),
        "worldguard-verification",
        signal
      );

      setShowSuccessDialog(true);
      onSuccess?.();
    } catch (error) {
      onError?.(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReturnToTelegram = () => {
    window.location.href = "https://t.me";
  };

  return (
    <div className="verify-container">

      <button
        onClick={handleVerify}
        className="w-full px-6 py-3 bg-black text-white rounded-md hover:bg-black/90 transition-all font-medium"
        disabled={isVerifying}
      >
        {isVerifying ? "Verifying..." : "Verify with World ID"}
      </button>

      {showSuccessDialog && (
        <div className="fixed inset-0 bg-gray-600/30 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Verification successful!</h2>
            <p className="mb-6">You have successfully verified with World ID.</p>
            <button
              onClick={handleReturnToTelegram}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all font-medium"
            >
              Return to Telegram
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyWithWorldID;
