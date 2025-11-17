import { MessagesRequest } from "@/utils/axios";
import { useGlobal } from "@/utils/globals";
import { VoxaMessage } from "@/utils/myTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

const useFetchMessages = () => {
  const router = useRouter();
  const { setFavoriteMessages, setMessages, messages } = useGlobal();
  const [fetchingMessage, setFetchingMessages] = useState(false);
  const [allMessagefetched, setAllMessagefetched] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      setFetchingMessages(true);

      const token = await AsyncStorage.getItem("voxaToken");

      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await MessagesRequest.getMessages();
      const m: VoxaMessage[] = res.messages;

      setMessages(m);
      setFavoriteMessages(m.filter((fav) => fav.isStarred));
      setAllMessagefetched(true);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Failed to load messages... try reload",
        position: "bottom",
      });

      if (error?.status >= 400) {
        router.push({
          pathname: "/login",
          params: { expiredToken: "true" },
        });
      }
    } finally {
      setFetchingMessages(false);
    }
  }, []); // <— stable dependency

  // Auto-run ONLY when username changes
  useEffect(() => {
    fetchMessages();
  }, []); // <— NEVER put fetchMessages here

  return {
    fetchingMessage,
    messages,
    refetchMessages: fetchMessages,
    allMessagefetched,
  };
};

export default useFetchMessages;
