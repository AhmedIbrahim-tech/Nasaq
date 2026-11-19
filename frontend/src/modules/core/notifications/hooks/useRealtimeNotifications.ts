'use client';

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notificationsRealtimeService } from "../services/notificationsRealtime.service";

export function useRealtimeNotifications() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  useEffect(() => {
    if (accessToken) {
      notificationsRealtimeService.start(accessToken, dispatch);
    } else {
      notificationsRealtimeService.stop();
    }
  }, [accessToken, dispatch]);
}
