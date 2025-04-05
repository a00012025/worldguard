import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import type { ISuccessResult } from "@worldcoin/idkit";
import { useVerification } from "./VerificationContext";

interface MiniKitContextType {
  isReady: boolean;
  handleVerify: (result: ISuccessResult) => void;
}

const MiniKitContext = createContext<MiniKitContextType | undefined>(undefined);

export function useMiniKit() {
  const context = useContext(MiniKitContext);
  if (!context) {
    throw new Error("useMiniKit must be used within a MiniKitProvider");
  }
  return context;
}

interface MiniKitProviderProps {
  children: ReactNode;
}

export function MiniKitProvider({ children }: MiniKitProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const { completeVerification } = useVerification();

  useEffect(() => {
    // Initialize World ID Mini App
    setIsReady(true);
  }, []);

  const handleVerify = async (result: ISuccessResult) => {
    try {
      // Convert result to string form to send to backend
      const proofString = JSON.stringify(result);
      await completeVerification(proofString);
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  const value = {
    isReady,
    handleVerify,
  };

  return (
    <MiniKitContext.Provider value={value}>{children}</MiniKitContext.Provider>
  );
}
