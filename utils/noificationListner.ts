import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";

export default function useNotifications(onNotification, onResponse) {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📩 Notification received:", notification);
        onNotification?.(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 Notification clicked:", response);
        onResponse?.(response);
      });

    // Cleanup properly
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);
}
