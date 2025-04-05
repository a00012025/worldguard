import { useEffect } from "react";
import { IDKitWidget } from "@worldcoin/idkit";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useVerification } from "../contexts/VerificationContext";
import { useMiniKit } from "../contexts/MiniKitContext";

export default function VerificationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    isVerifying,
    isVerified,
    error,
    telegramId,
    groupId,
    setTelegramId,
    setGroupId,
    resetVerification,
  } = useVerification();

  const { isReady, handleVerify } = useMiniKit();

  // Get telegram user ID and group ID from URL params
  useEffect(() => {
    const tid = searchParams.get("tid");
    const gid = searchParams.get("gid");

    if (tid) {
      setTelegramId(tid);
    }

    if (gid) {
      setGroupId(gid);
    }
  }, [searchParams, setTelegramId, setGroupId]);

  // Redirect to homepage if no Telegram ID is provided
  useEffect(() => {
    if (!searchParams.get("tid")) {
      navigate("/");
    }
  }, [searchParams, navigate]);

  // Handle successful verification
  useEffect(() => {
    if (isVerified) {
      // If we're using Telegram's Mini App system, we could close the app here
      // or redirect back to Telegram with appropriate success message
    }
  }, [isVerified]);

  return (
    <div className="verification-page">
      <div className="verification-container">
        <div className="verification-header">
          <h1>WorldGuard Verification</h1>
          <p>
            Prove your humanity to gain access to the Telegram group. Your
            privacy is protected using World ID technology.
          </p>
        </div>

        <div className="verification-content">
          {error && <div className="error-message">{error}</div>}

          {isVerified ? (
            <div className="success-message">
              <h2>Verification Successful!</h2>
              <p>You have been successfully verified as human.</p>
              <p>You can now access the Telegram group.</p>
              <button onClick={() => resetVerification()} className="button">
                Verify Another Account
              </button>
            </div>
          ) : (
            <div className="verification-widget">
              {telegramId ? (
                <>
                  <p>Verifying Telegram User ID: {telegramId}</p>
                  {groupId && <p>For Group ID: {groupId}</p>}

                  {isReady ? (
                    <div className="world-id-button">
                      <IDKitWidget
                        app_id={import.meta.env.VITE_WORLD_APP_ID || ""}
                        action="telegram-verification"
                        signal={telegramId}
                        onSuccess={handleVerify}
                        handleVerify={async (proof) => {
                          // This is handled by our context
                          return true;
                        }}
                      >
                        {({ open }) => (
                          <button
                            onClick={open}
                            className="button primary"
                            disabled={isVerifying}
                          >
                            {isVerifying
                              ? "Verifying..."
                              : "Verify with World ID"}
                          </button>
                        )}
                      </IDKitWidget>
                    </div>
                  ) : (
                    <p>Loading verification system...</p>
                  )}
                </>
              ) : (
                <p>
                  Missing Telegram user ID. Please use the link provided by the
                  bot.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="verification-footer">
          <p>
            Powered by{" "}
            <a
              href="https://worldcoin.org/world-id"
              target="_blank"
              rel="noopener noreferrer"
            >
              World ID
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
