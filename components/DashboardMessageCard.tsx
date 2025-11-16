import { MessagesRequest } from "@/utils/axios";
import { useGlobal } from "@/utils/globals";
import { VoxaMessage } from "@/utils/myTypes";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";

export default function MessageItem({
  message,
  idx,
  activeMessage,
  opened,
}: any) {
  // Animation values
  const router = useRouter();
  const x = useSharedValue(20);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(message.isStarred ? 20 : 0);

  const { messages, setMessages, setFavoriteMessages } = useGlobal();

  useEffect(() => {
    x.value = withSpring(0, { damping: 20, stiffness: 150 });
    opacity.value = withSpring(1, { damping: 20, stiffness: 150 });
  }, []);

  useEffect(() => {
    rotate.value = withSpring(message.isStarred ? 20 : 0, {
      damping: 10,
      stiffness: 300,
    });
  }, [message.isStarred]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    opacity: opacity.value,
  }));

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const isActive = activeMessage?._id === message._id;

  function timeAgo(date: any) {
    const timeMs = typeof date === "number" ? date : date.getTime();
    const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);
    const cutoffs = [
      60,
      3600,
      86400,
      86400 * 7,
      86400 * 30,
      86400 * 365,
      Infinity,
    ];
    const units = ["s", "m", "h", "d", "w", "mo", "y"];
    const unitIndex = cutoffs.findIndex(
      (cutoff) => cutoff > Math.abs(deltaSeconds)
    );
    const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
    const value = Math.floor(Math.abs(deltaSeconds) / divisor);

    if (value <= 0) return "now";
    return `${value}${units[unitIndex]} ago`;
  }

  const handleToggleFavorite = async (id: string) => {
    try {
      const f: VoxaMessage[] = [];
      const newMessages = messages.map((x) => {
        console.log(x._id);
        if (x._id == id) {
          x.isStarred = !x.isStarred;
        }
        if (x.isStarred) {
          f.push(x);
        }

        return x;
      });
      setMessages(newMessages);
      console.log(f);
      setFavoriteMessages(f);
      await MessagesRequest.toggleFav(id);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Somethin went wrong",
        position: "top",
      });
    }
  };

  const handleOpenMessage = (
    type: string,
    message: string,
    audioUrl: string,
    id: string
  ) => {
    console.log({ message, id, type });
    if (type == "text") {
      router.push({
        pathname: "/textMessageModal",
        params: {
          messageText: message,
          id,
          opened,
        },
      });
    } else {
      router.push({
        pathname: "/audioMessageModal",
        params: {
          type: message,
          id,
          audioUrl,
        },
      });
    }
    console.log("emnd");
  };

  return (
    <TouchableOpacity key={idx}>
      <Animated.View
        key={idx}
        style={[styles.messageContainer, containerStyle]}
      >
        <TouchableOpacity
          onPress={() =>
            handleOpenMessage(
              message.type,
              message.messageText,
              message.audioUrl,
              message._id
            )
          }
          style={styles.messageHeader}
        >
          <View
            style={[
              styles.iconHead,
              message.isOpened && styles.viewedMessageIcon,
            ]}
          >
            <Image
              source={require("../assets/images/heart-with-ribbon.png")}
              style={styles.ribbonIcon}
            />
          </View>

          <View style={styles.chatInfo}>
            <Text
              numberOfLines={1}
              style={[
                styles.messageText,
                message.isOpened ? styles.openedText : styles.unreadText,
              ]}
            >
              {message.type === "text" ? message.messageText : "Voice Message"}
            </Text>

            <View style={styles.timeRow}>
              {message.type === "text" ? (
                <Image
                  source={require("../assets/images/type-text.png")}
                  style={{ height: 18, width: 18 }}
                />
              ) : (
                <Image
                  source={require("../assets/images/type-audio.png")}
                  style={{ height: 18, width: 18 }}
                />
              )}
              <Text style={styles.timeText}>
                {timeAgo(new Date(message.createdAt))}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <Animated.View style={[starStyle]}>
          <TouchableOpacity onPress={() => handleToggleFavorite(message._id)}>
            {message.isStarred ? (
              <Image
                source={require("../assets/images/magic-star-2.png")}
                style={{ height: 20, width: 20 }}
              />
            ) : (
              <Image
                source={require("../assets/images/magic-star.png")}
                style={{ height: 20, width: 20 }}
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  activeBackground: {
    backgroundColor: "#f2f2f2",
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconHead: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  viewedMessageIcon: {
    backgroundColor: "#ddd",
  },
  ribbonIcon: {
    width: 28,
    height: 28,
  },
  chatInfo: {
    flex: 1,
  },
  messageText: {
    fontSize: 13,
    fontFamily: "Regular",
  },
  unreadText: {
    color: "#FF6600",
  },
  openedText: {
    color: "#333",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 6,
    fontFamily: "Regular",
  },
  starIcon: {
    marginLeft: 10,
  },
});
