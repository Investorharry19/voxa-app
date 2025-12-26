import MessageItem from "@/components/DashboardMessageCard";
import ToggleTabs from "@/components/DashboardMessageToggle";
import DoubleTapManual from "@/components/headerLogo";
import SettingsModal from "@/components/settings";
import VoxaGradientButton from "@/components/VoxaGradientButton";
import { Colors } from "@/constants/Colors";
import useFetchMessages from "@/hooks/useFetchMessags";
import useAnonymousMessages from "@/hooks/useSocket";
import { backendUrl } from "@/sever";
import { MessagesRequest } from "@/utils/axios";
import { useGlobal } from "@/utils/globals";
import { VoxaMessage } from "@/utils/myTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Modal as MyModal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function dashboad() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("messages");
  const {
    messages,
    favoriteMessages,
    username,
    setMessages,
    setFavoriteMessages,
  } = useGlobal();
  const [deleteModalVisible, setDeleteModaVisible] = useState(false);
  const [fetchingMessages, setFetchingMessages] = useState(true);
  const [displayMessages, setDisplayMessages] = useState<VoxaMessage[]>([]);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Get username once

  const { fetchingMessage: FM, refetchMessages } = useFetchMessages();

  // Call the socket hook at the top-level of the component
  // Hooks must not be called inside effects or conditionals.
  useAnonymousMessages({
    serverUrl: backendUrl,
  });

  // Log only on mount, not on every render
  useEffect(() => {
    console.log("Dashboard mounted with username:", username);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp(); // Exit the app
        return true; // Prevent default back behavior
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove(); // Changed this line
    }, [])
  );

  useEffect(() => {
    setFetchingMessages(FM);
  }, [FM]);

  useEffect(() => {
    if (activeTab === "messages") {
      setDisplayMessages(messages);
    } else {
      setDisplayMessages(favoriteMessages);
    }
  }, [activeTab, messages]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    refetchMessages();
    // Simulate network request or data reload
    setRefreshing(false);
  }, []);

  const [copyText, setCopyText] = useState("Copy Link");
  const copyLink = async () => {
    console.log("Copied");
    setCopyText("Copied");
    await Clipboard.setStringAsync(
      "https://www.voxa.buzz/send-message/" + username
    );

    console.log({username})
    Toast.show({
      type: "success",
      text1: "Link Copied",
      position: "top",
    });
    setTimeout(() => {
      setCopyText("Copy Link");
    }, 5000);
  };

  async function deleteAllMessage() {
    const tempHolder = messages;
    setFavoriteMessages(messages.filter((msg) => msg.isStarred === true));
    setDeleteModaVisible(false);

    try {
      await MessagesRequest.deleteAllMessages();
      router.back();
    } catch (error) {
      console.log("Delete error:", error);
      setMessages(tempHolder);
      setFavoriteMessages(tempHolder.filter((msg) => msg.isStarred === true));
      Toast.show({
        type: "error",
        text1: "Failed to delete all message",
        position: "top",
      });
    }
  }

  async function logoutUser() {
    await AsyncStorage.removeItem("voxaToken");
    setTimeout(() => {
      router.replace("/login");
    }, 100);
  }

  return (
    <SafeAreaView
      style={{ backgroundColor: "white", flex: 1, paddingHorizontal: 10 }}
    >
      <View style={styles.header}>
        <DoubleTapManual />
        <View
          style={{
            marginLeft: "auto",
            flexDirection: "row",

            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={copyLink} activeOpacity={0.8}>
            <Image
              source={require("../assets/images/copy.png")}
              style={styles.headerIcon}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setDeleteModaVisible(true)}>
            <Image
              source={require("../assets/images/trash.png")}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSettingsModalVisible(true)}
          >
            <Image
              source={require("../assets/images/fox-header.png")}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ToggleTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {fetchingMessages && (
          <View>
            <ActivityIndicator
              size={80}
              color={Colors.orange}
              style={{ marginTop: 100 }}
            />
          </View>
        )}
        {!fetchingMessages && displayMessages.length === 0 && (
          <View style={{ marginTop: 60, alignItems: "center" }}>
            <Image
              source={require("../assets/images/empty-state.png")}
              style={{ width: 150, height: 150 }}
            />
            <Text style={{ fontFamily: "Regular", fontSize: 14 }}>
              {activeTab === "messages"
                ? "No Messages Yet"
                : "No Favourites Yet"}
            </Text>
            <Text
              style={{ fontFamily: "Regular", fontSize: 12, color: "gray" }}
            >
              {activeTab === "messages"
                ? "Share Link To Friends"
                : "Click Favourite icon to add"}
            </Text>
            {activeTab === "messages" && (
              <VoxaGradientButton
                onPress={copyLink}
                style={{ marginTop: 0, paddingHorizontal: 50 }}
              >
                <Text
                  style={{ fontFamily: "Bold", fontSize: 12, color: "white" }}
                >
                  {copyText}
                </Text>
              </VoxaGradientButton>
            )}
          </View>
        )}
        {!fetchingMessages && (
          <View>
            {displayMessages.map((message) => {
              return (
                <MessageItem
                  message={message}
                  idx={message._id}
                  key={message._id}
                  opened={message.isOpened}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        onLogout={() => logoutUser()}
      />

      <MyModal
        transparent
        animationType="fade"
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModaVisible(false)}
      >
        <BlurView style={styles.overlay} intensity={100} tint="dark">
          <View style={styles.modalBox}>
            {/* Trash Icon */}
            <Image
              source={require("../assets/images/trash-red.png")}
              style={styles.icon}
            />

            {/* Title */}
            <Text style={styles.title}>Delete all Messagees</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              Do you want to delete this message?{"\n"}This action cannot be
              undone
            </Text>

            {/* Buttons */}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => setDeleteModaVisible(false)}
                activeOpacity={0.8}
                style={buttons.buttonWrapper}
              >
                <LinearGradient
                  colors={["#d7d7d7", "#aaa", "#a2a2a2"]}
                  locations={[0, 0.6667, 0.9687]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={buttons.gradient}
                >
                  <Text
                    style={{ ...buttons.buttonText, fontFamily: "Regular" }}
                  >
                    Cancel
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  deleteAllMessage();
                }}
                activeOpacity={0.8}
                style={buttons.buttonWrapper} // Changed from buttons.buttonWrapper
              >
                <LinearGradient
                  colors={["#fe5b51", "#fe2e22", "#ff3b30"]} // Removed extra space after "#fe2e22 "
                  locations={[0, 0.6667, 0.9687]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={buttons.gradient} // Changed from buttons.gradient
                >
                  <Text
                    style={{ ...buttons.buttonText, fontFamily: "Regular" }} // Changed from buttons.buttonText
                  >
                    Delete
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </MyModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
  },
  headerIcon: {
    height: 50,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: "Regular",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Regular",
  },
  modalBox: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 10,
    tintColor: "#FF3B30",
  },
});

const buttons = StyleSheet.create({
  buttonWrapper: {
    borderRadius: 150,
    borderWidth: 0.5,
    borderColor: "#ffffff",
    // Outer shadows
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.25,
        shadowRadius: 0.5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  gradient: {
    paddingVertical: 12,
    borderRadius: 30,
    paddingHorizontal: 35,
    alignItems: "center",
    justifyContent: "center",
    // Inner shadows (approximated with border)
    borderTopWidth: 0.5,
    borderTopColor: "rgba(202, 189, 182, 0.3)",
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(165, 157, 157, 0.3)",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
