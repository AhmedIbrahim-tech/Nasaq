"use client";

import React, { ReactNode } from "react";
import { AuthSessionProvider } from "../context/AuthSessionContext";

/**
 * Component mounted inside PersistGate to execute automatic session initialization
 * and provide shared session status across Route Guards and components.
 */
export function AuthSessionInitializer({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}

export default AuthSessionInitializer;
