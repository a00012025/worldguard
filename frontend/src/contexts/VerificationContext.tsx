import { createContext, ReactNode, useContext, useState } from "react";
import { submitVerification } from "../services/api";

interface VerificationContextType {
  isVerifying: boolean;
  isVerified: boolean;
  error: string | null;
  telegramId: string | null;
  groupId: string | null;
  setTelegramId: (id: string) => void;
  setGroupId: (id: string) => void;
  startVerification: () => void;
  completeVerification: (proof: string) => Promise<void>;
  resetVerification: () => void;
}

const VerificationContext = createContext<VerificationContextType | undefined>(
  undefined
);

export function useVerification() {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error(
      "useVerification must be used within a VerificationProvider"
    );
  }
  return context;
}

interface VerificationProviderProps {
  children: ReactNode;
}

export function VerificationProvider({ children }: VerificationProviderProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [telegramId, setTelegramId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);

  const startVerification = () => {
    setIsVerifying(true);
    setError(null);
  };

  const completeVerification = async (proof: string) => {
    try {
      if (!telegramId) {
        throw new Error("Telegram ID is required for verification");
      }

      setIsVerifying(true);
      setError(null);

      await submitVerification(proof, "worldguard-verification", "1234567890_987654321");

      setIsVerified(true);
      setIsVerifying(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setIsVerifying(false);
    setIsVerified(false);
    setError(null);
  };

  const value = {
    isVerifying,
    isVerified,
    error,
    telegramId,
    groupId,
    setTelegramId,
    setGroupId,
    startVerification,
    completeVerification,
    resetVerification,
  };

  return (
    <VerificationContext.Provider value={value}>
      {children}
    </VerificationContext.Provider>
  );
}
