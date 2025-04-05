import { IDKitWidget, VerificationLevel } from "@worldcoin/idkit";
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

  const handleVerify = async (proof: unknown) => {
    try {
      setIsVerifying(true);
      const proofString = JSON.stringify(proof);
      await submitVerification(proofString, "worldguard-verification", signal,);
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

      <IDKitWidget
        app_id={"app_e9ff38ec52182a86a2101509db66c179"}
        action="worldguard-verification"
        signal={signal}
        onSuccess={handleVerify}
        verification_level={VerificationLevel.Device}
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
