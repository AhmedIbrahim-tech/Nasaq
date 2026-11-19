"use client";

import React, { createContext, useContext, ReactNode } from "react";
import {
  useAuthSession,
  AuthSessionResult,
  AuthSessionStatus,
  ConnectionErrorReason,
} from "../hooks/useAuthSession";
import { useSessionExpiryWarning } from "../hooks/useSessionExpiryWarning";

export type { AuthSessionStatus, AuthSessionResult, ConnectionErrorReason };

const defaultContextValue: AuthSessionResult = {
  status: "initializing",
  isInitialized: false,
  isAuthenticated: false,
  isVerifying: false,
  isNetworkError: false,
  errorReason: null,
  retryCount: 0,
  maxRetries: 3,
  nextRetryIn: null,
  retryVerification: async () => {},
  resetAndLogin: async () => {},
};

export const AuthSessionContext =
  createContext<AuthSessionResult>(defaultContextValue);

/**
 * Custom hook to consume the shared session status across Route Guards and UI components.
 */
export function useAuthSessionContext(): AuthSessionResult {
  return useContext(AuthSessionContext);
}

/**
 * Provider component that runs useAuthSession once and distributes status to all children.
 * Also monitors refresh token expiration to offer early renewal when supported.
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const session = useAuthSession();
  useSessionExpiryWarning();

  return (
    <AuthSessionContext.Provider value={session}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export default AuthSessionProvider;
