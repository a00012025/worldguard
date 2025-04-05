/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ReactNode,
  useEffect,
  createContext,
  useContext,
  useState,
} from "react";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";

// Define the context type
type MiniKitContextType = {
  isInstalled: boolean;
  isLoading: boolean;
  verifyWithWorldID: (signal: string) => Promise<any>;
};

// Create context with default values
const MiniKitContext = createContext<MiniKitContextType>({
  isInstalled: false,
  isLoading: true,
  verifyWithWorldID: async () => ({}),
});

// Hook to use the MiniKit context
export const useMiniKit = () => useContext(MiniKitContext);

// MiniKit Provider component
export default function MiniKitProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Initialize MiniKit
    try {
      MiniKit.install();
      setIsInstalled(MiniKit.isInstalled());
    } catch (error) {
      console.error("Error installing MiniKit:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to trigger World ID verification
  const verifyWithWorldID = async (signal: string) => {
    if (!MiniKit.isInstalled()) {
      console.error("MiniKit is not installed");
      return { status: "error", message: "MiniKit is not installed" };
    }

    try {
      // Set up verification payload
      const verifyPayload = {
        action: "worldguard-verification", // This is your action ID from the Developer Portal
        signal, // User's Telegram ID
        verification_level: VerificationLevel.Orb, // Orb verification level
      };

      // Trigger verification flow
      const { finalPayload } = await MiniKit.commandsAsync.verify(
        verifyPayload
      );

      if (finalPayload.status === "error") {
        console.error("Verification error:", finalPayload);
        return {
          status: "error",
          message: "Verification failed",
          details: finalPayload,
        };
      }

      return { status: "success", payload: finalPayload };
    } catch (error) {
      console.error("Error during verification:", error);
      return { status: "error", message: "Error during verification", error };
    }
  };

  // Provide context values
  const contextValue = {
    isInstalled,
    isLoading,
    verifyWithWorldID,
  };

  return (
    <MiniKitContext.Provider value={contextValue}>
      {children}
    </MiniKitContext.Provider>
  );
}
