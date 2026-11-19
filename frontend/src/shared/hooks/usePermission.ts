'use client';

import { useMemo, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import { RoleNames } from "@/shared/constants/roles";

export function usePermission() {
  const { accessToken, roles } = useAppSelector((state) => state.auth);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!roles || roles.length === 0) {
        return false;
      }

      if (roles.includes(RoleNames.SuperAdmin) || roles.includes(RoleNames.Admin)) {
        return true;
      }

      return false;
    },
    [roles]
  );

  return useMemo(
    () => ({
      hasPermission,
      roles: roles ?? [],
      accessToken,
      loading: false,
    }),
    [hasPermission, roles, accessToken]
  );
}

