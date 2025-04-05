import type { ISuccessResult } from "@worldcoin/idkit";
import { MiniKit } from "@worldcoin/minikit-js";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
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
    // Initialize MiniKit
    try {
      MiniKit.install("app_e9ff38ec52182a86a2101509db66c179");
      setIsReady(MiniKit.isInstalled());
    } catch (error) {
      console.error("Error installing MiniKit:", error);
    } finally {
      setIsReady(false);
    }
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
