import { useColorScheme } from "@/hooks/useColorScheme";
import { registerForPushNotificationsAsync } from "@/hooks/usePushNotification";
import { AccountApiRequest } from "@/utils/axios";
import { GlobalProvider, useGlobal } from "@/utils/globals";
import { handleDeleteMessage, handleMarkAsRead } from "@/utils/messageActions";
import { toastConfig } from "@/utils/toastConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addEventListener } from "@react-native-community/netinfo";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Image, Linking, Platform, View } from "react-native";
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
  const {
    setUsername,
    setAllowPushNOtification,
    messages,
    setMessages,
    setFavoriteMessages,
  } = useGlobal();
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const [isInitialized, setIsInitialized] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | any>(null);
  const router = useRouter();
  const pathName = usePathname();
  const prevPath = useRef(pathName);

  console.log("InnerRootLayout rendered", { isInitialized, initialRoute, pathName });

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

      // Set up interactive notification categories
      await Notifications.setNotificationCategoryAsync("voxa-messages", [
        {
          identifier: "mark-read",
          buttonTitle: "Mark as Read",
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: "delete",
          buttonTitle: "Delete",
          options: {
            isDestructive: true,
            opensAppToForeground: false,
          },
        },
        {
          identifier: "share",
          buttonTitle: "Share",
          options: {
            opensAppToForeground: true,
          },
        },
      ]);
    })();
    // Listen when a notification
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received!", notification);
      });

    //Listen when user clicks/taps a notification (foreground, background, or closed)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(async (response) => {
        console.log("Notification clicked:", response);

        // Dismiss the notification when interacted with
        await Notifications.dismissNotificationAsync(
          response.notification.request.identifier
        );

        const actionId = response.actionIdentifier;
        const data: any = response.notification.request.content.data;
        
        // Handle interactive buttons
        if (actionId === "mark-read") {
          console.log("Mark as read action triggered for:", data.id);
          handleMarkAsRead(
            data.id,
            messagesRef.current,
            setMessages,
            setFavoriteMessages,
            "false"
          );
        } else if (actionId === "delete") {
          console.log("Delete action triggered for:", data.id);
          handleDeleteMessage(
            data.id,
            messagesRef.current,
            setMessages,
            setFavoriteMessages,
            null
          );
        } else if (actionId === "share") {
          console.log("Share action triggered");
          if (data?.screen) {
            router.push({
              pathname: `/${data.screen}` as any,
              params: {
                messageText: data.messageText,
                audioUrl: data.audioUrl,
                id: data.id,
                opened: "true",
                autoShare: "true", // Pass this to trigger share modal automatically
              },
            });
          }
        } else if (actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) {
          // Normal notification tap
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
                audioUrl: data.audioUrl,
                id: data.id,
                opened: "false",
              },
            });
            console.log("Navigate to:", data.screen);
          }
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
      const res: {
        username: string;
        Token: string;
        pushToken: string[];
        pushNotificationEnabled: boolean;
      } = await AccountApiRequest.currentUser();
      await AsyncStorage.setItem("voxaToken", res.Token);
      console.log(res, 117);
      setUsername(res.username);
      setAllowPushNOtification(res.pushNotificationEnabled);

      const token = await registerForPushNotificationsAsync();
      if (!token) return;
      if (!res.pushToken.includes(token)) {
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

  const isOfflineRef = useRef(false);

  // Set up network listener separately to avoid re-render issues
  useEffect(() => {
    const unsubscribe = addEventListener((state) => {
      if (state.isConnected === false) {
        console.log("Offline - navigating to offline page");
        isOfflineRef.current = true;
        router.replace("/offline");
      } else if (state.isConnected === true && isOfflineRef.current) {
        console.log("Online - navigating back to dashboard");
        isOfflineRef.current = false;
        router.replace("/dashboard");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Handle deep links
  useEffect(() => {
    // Handle initial URL (app opened from link)
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    // Handle URL when app is already open
    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    handleInitialURL();

    return () => {
      subscription.remove();
    };
  }, []);

  // Parse and navigate based on deep link
  const handleDeepLink = (url: string) => {
    console.log("Deep link received:", url);
    
    // Parse the URL
    // Examples:
    // https://www.voxa.buzz/send-message/hendrix
    // voxa://send-message/hendrix
    
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      
      // Check if it's a send-message link
      if (path.includes("/send-message/")) {
        const username = path.split("/send-message/")[1];
        
        if (username) {
          console.log("Navigating to send message for:", username);
          // Navigate to your send message screen with the username
          // Adjust this route based on your app structure
          router.push({
            pathname: "/send-message",
            params: { targetUsername: username }
          } as any);
        }
      }
    } catch (error) {
      console.error("Error parsing deep link:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (isInitialized && initialRoute) {
      router.replace(initialRoute);
    }
  }, [isInitialized, initialRoute]);

  useEffect(() => {
    if (prevPath.current !== pathName) {
      console.log(`Navigated from: ${prevPath.current} to ${pathName}`);
    }
    prevPath.current = pathName;
  }, [pathName]);
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {isInitialized ? (
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
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
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="audioMessageModal"
            options={{ presentation: "modal", headerShown: false }}
          />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="offline" options={{ headerShown: false }} />

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
