/**
 * Interface for user verification state
 */
interface UserVerificationState {
  chatId: number;
  userId: number;
  username?: string;
  joinedAt: number;
  verificationMessageId?: number;
  isVerified: boolean;
  verificationTimerId?: NodeJS.Timeout;
}

/**
 * In-memory state store for user verification
 */
class StateManager {
  private verifications: Map<string, UserVerificationState>;

  constructor() {
    this.verifications = new Map();
  }

  /**
   * Create a key for the verification map
   */
  private getKey(chatId: number, userId: number): string {
    return `${chatId}:${userId}`;
  }

  /**
   * Add a new user to verification queue
   */
  addUserToVerification(
    chatId: number,
    userId: number,
    username?: string
  ): UserVerificationState {
    const key = this.getKey(chatId, userId);
    const state: UserVerificationState = {
      chatId,
      userId,
      username,
      joinedAt: Date.now(),
      isVerified: false,
    };

    this.verifications.set(key, state);
    return state;
  }

  /**
   * Get user verification state
   */
  getUserVerification(
    chatId: number,
    userId: number
  ): UserVerificationState | undefined {
    const key = this.getKey(chatId, userId);
    return this.verifications.get(key);
  }

  /**
   * Update user verification state
   */
  updateUserVerification(
    chatId: number,
    userId: number,
    updates: Partial<UserVerificationState>
  ): UserVerificationState | undefined {
    const key = this.getKey(chatId, userId);
    const currentState = this.verifications.get(key);

    if (!currentState) {
      return undefined;
    }

    const updatedState = { ...currentState, ...updates };
    this.verifications.set(key, updatedState);
    return updatedState;
  }

  /**
   * Set a user as verified
   */
  setUserVerified(
    chatId: number,
    userId: number
  ): UserVerificationState | undefined {
    return this.updateUserVerification(chatId, userId, { isVerified: true });
  }

  /**
   * Remove a user from verification queue
   */
  removeUserVerification(chatId: number, userId: number): boolean {
    const key = this.getKey(chatId, userId);
    const state = this.verifications.get(key);

    if (state?.verificationTimerId) {
      clearTimeout(state.verificationTimerId);
    }

    return this.verifications.delete(key);
  }

  /**
   * Set verification timer for a user
   */
  setVerificationTimer(
    chatId: number,
    userId: number,
    timerId: NodeJS.Timeout
  ): UserVerificationState | undefined {
    return this.updateUserVerification(chatId, userId, {
      verificationTimerId: timerId,
    });
  }

  /**
   * Set verification message ID for a user
   */
  setVerificationMessageId(
    chatId: number,
    userId: number,
    messageId: number
  ): UserVerificationState | undefined {
    return this.updateUserVerification(chatId, userId, {
      verificationMessageId: messageId,
    });
  }
}

// Export a singleton instance
export const stateManager = new StateManager();
