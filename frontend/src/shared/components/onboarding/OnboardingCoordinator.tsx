"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { TemporaryPasswordReminderDialog } from "@/modules/auth/components/TemporaryPasswordReminderDialog";
import { EmployeeLocationOnboardingDialog } from "@/modules/locations/components/EmployeeLocationOnboardingDialog";

const STORAGE_KEY_TEMP_PWD = "nasaq.temp_password_reminder_dismissed";
const STORAGE_KEY_LOCATION = "nasaq.location_onboarding_dismissed";

export const OnboardingCoordinator: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => Boolean(state.auth.accessToken));

  const [pwdDismissed, setPwdDismissed] = useState(true);
  const [locDismissed, setLocDismissed] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated) {
      setPwdDismissed(sessionStorage.getItem(STORAGE_KEY_TEMP_PWD) === "true");
      setLocDismissed(sessionStorage.getItem(STORAGE_KEY_LOCATION) === "true");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) return null;

  // Popup 1: Temporary Password Reminder
  const showTempPasswordReminder = user.mustChangePasswordOnNextLogin === true && !pwdDismissed;

  // Popup 2: Personal Location Onboarding (Only shown after Popup 1 is closed/dismissed)
  const showLocationOnboarding =
    !showTempPasswordReminder &&
    !user.hasApprovedPersonalLocation &&
    !user.hasPendingLocationRequest &&
    !locDismissed;

  const handleDismissPwd = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY_TEMP_PWD, "true");
    }
    setPwdDismissed(true);
  };

  const handleDismissLoc = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY_LOCATION, "true");
    }
    setLocDismissed(true);
  };

  return (
    <>
      {showTempPasswordReminder && (
        <TemporaryPasswordReminderDialog
          open={showTempPasswordReminder}
          onClose={handleDismissPwd}
          onLater={handleDismissPwd}
        />
      )}

      {showLocationOnboarding && (
        <EmployeeLocationOnboardingDialog
          open={showLocationOnboarding}
          onClose={handleDismissLoc}
          onLater={handleDismissLoc}
          onSuccess={handleDismissLoc}
        />
      )}
    </>
  );
};
