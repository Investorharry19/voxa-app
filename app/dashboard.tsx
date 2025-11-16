import MessageItem from "@/components/DashboardMessageCard";
import ToggleTabs from "@/components/DashboardMessageToggle";
import DoubleTapManual from "@/components/headerLogo";
import VoxaGradientButton from "@/components/VoxaGradientButton";
import { Colors } from "@/constants/Colors";
import useFetchMessages from "@/hooks/useFetchMessags";
import useAnonymousMessages from "@/hooks/useSocket";
import { backendUrl } from "@/sever";
import { useGlobal } from "@/utils/globals";
import { VoxaMessage } from "@/utils/myTypes";
import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
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
  const { messages, setMessages, favoriteMessages, setFavoriteMessages } =
    useGlobal();

  const [fetchingMessages, setFetchingMessages] = useState(true);
  const [displayMessages, setDisplayMessages] = useState<VoxaMessage[]>([]);

  // Get username once
  const { username } = useLocalSearchParams();

  const { fetchingMessage: FM, refetchMessages } = useFetchMessages(
    username as string
  );

  console.log("Dashboard mounted with username:", username);

  // Call the socket hook at the top-level of the component
  // Hooks must not be called inside effects or conditionals.
  useAnonymousMessages({
    serverUrl: backendUrl,
  });

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
    await Clipboard.setStringAsync("Copied");
    Toast.show({
      type: "success",
      text1: "Link Copied",
      position: "top",
    });
    setTimeout(() => {
      setCopyText("Copy Link");
    }, 5000);
  };

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
          }}
        >
          <TouchableOpacity onPress={copyLink} activeOpacity={0.8}>
            <Image
              source={require("../assets/images/copy.png")}
              style={styles.headerIcon}
            />
          </TouchableOpacity>

          <Image
            source={require("../assets/images/trash.png")}
            style={styles.headerIcon}
          />
          <Image
            source={require("../assets/images/fox-header.png")}
            style={styles.headerIcon}
          />
        </View>
      </View>
      <ToggleTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {fetchingMessages && displayMessages.length === 0 && (
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
});
