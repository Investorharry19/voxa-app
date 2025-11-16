import { useColorScheme } from "@/hooks/useColorScheme";
import { registerForPushNotificationsAsync } from "@/hooks/usePushNotification";
import { AccountApiRequest } from "@/utils/axios";
import { GlobalProvider, useGlobal } from "@/utils/globals";
import { toastConfig } from "@/utils/toastConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Image, Platform, View } from "react-native";
import "react-native-reanimated";
import Toast from "react-native-toast-message";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Regular: require("../assets/fonts/Regular.ttf"),
    Light: require("../assets/fonts/Light.ttf"),
    Bold: require("../assets/fonts/Bold.ttf"),
  });

  if (!loaded) return null;

  return (
    <GlobalProvider>
      <InnerRootLayout colorScheme={colorScheme} />
    </GlobalProvider>
  );
}

function InnerRootLayout({ colorScheme }: any) {
  const { setUsername } = useGlobal();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | any>(null);
  const router = useRouter();

  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("voxa-messages", {
          name: "VOXA Messages",
          importance: Notifications.AndroidImportance.MAX, // HIGH visuals
          sound: "custom_sound", // name without extension if using custom sound
          vibrationPattern: [0, 250, 250, 250],
        });
      }
    })();
    // Listen when a notification
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received!", notification);
      });

    //Listen when user clicks/taps a notification (foreground, background, or closed)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification clicked:", response);

        const data: any = response.notification.request.content.data;
        // Example: navigate or open a screen based on notification data

        console.log({
          messageText: data.messageText,
          id: data.id,
          opened: "false",
        });
        if (data?.screen) {
          router.push({
            pathname: `/${data.screen}` as any,
            params: {
              messageText: data.messageText,
              id: data.id,
              opened: "false",
            },
          });
          console.log("Navigate to:", data.screen);
        }
      });

    // Cleanup when component unmounts
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  async function fetchUser() {
    try {
      const prevHavenToken = await AsyncStorage.getItem("voxaToken");
      console.log({ prevHavenToken });
      if (!prevHavenToken) {
        setInitialRoute("/login");
        return;
      }
      console.log("Getting current user");
      const res = await AccountApiRequest.currentUser();
      await AsyncStorage.setItem("voxaToken", res.Token);
      setUsername(res.username);
      console.log(res);
      if (res.pushToken.length === 0) {
        const token = await registerForPushNotificationsAsync();
        if (!token) return;
        await AccountApiRequest.createPushToken(token);
      }
      setInitialRoute("/dashboard");
    } catch (error) {
      console.log(error);
      setInitialRoute("/login");
    } finally {
      setIsInitialized(true);
    }
  }
  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (isInitialized && initialRoute) {
      router.replace(initialRoute);
    }
  }, [isInitialized, initialRoute]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {isInitialized ? (
        <Stack>
          <Stack.Screen
            name="dashboard"
            options={{
              headerShown: false,
              gestureEnabled: false,
              headerBackVisible: false,
            }}
          />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen
            name="textMessageModal"
            options={{ presentation: "modal", headerShown: false }}
          />
          <Stack.Screen
            name="audioMessageModal"
            options={{ presentation: "modal", headerShown: false }}
          />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      ) : (
        <LoadingScreen />
      )}
      <StatusBar style="auto" />
      <Toast config={toastConfig} />
    </ThemeProvider>
  );
}
function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#ffffffff",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={require("../assets/images/logo.png")}
        style={{ width: 150, height: 150, objectFit: "contain" }}
      />
    </View>
  );
}
