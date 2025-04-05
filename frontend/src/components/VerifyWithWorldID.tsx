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
        Your signal: {signal}
      </p>

      <button
        onClick={handleVerify}
        className="w-full px-6 py-3 bg-black text-white rounded-md hover:bg-black/90 transition-all font-medium"
        disabled={isVerifying}
      >
        {isVerifying ? "Verifying..." : "Verify with World ID"}
      </button>
    </div>
  );
};

export default VerifyWithWorldID;
