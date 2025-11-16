import React, { useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

export default function ToggleTabs({ activeTab, setActiveTab }: any) {
  const tabWidth = width * 0.485 - 25;
  const sliderPosition = useSharedValue(
    activeTab === "messages" ? 0 : tabWidth
  );

  useEffect(() => {
    sliderPosition.value = withSpring(activeTab === "messages" ? 0 : tabWidth, {
      stiffness: 400,
      damping: 30,
    });
  }, [activeTab]);

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderPosition.value }],
  }));

  return (
    <View style={styles.toggleContainer}>
      <Animated.View style={[styles.slider, sliderStyle, { marginLeft: 6 }]} />

      <TouchableOpacity
        style={[styles.button, activeTab === "messages" && styles.activeButton]}
        onPress={() => {
          setActiveTab("messages");
        }}
      >
        <Text
          style={[styles.text, activeTab === "messages" && styles.textActive]}
        >
          Messages
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          activeTab === "favorites" && styles.activeButton,
          {},
        ]}
        onPress={() => {
          setActiveTab("favorites");
        }}
      >
        <Text
          style={[styles.text, activeTab === "favorites" && styles.textActive]}
        >
          Favorites
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: "row",
    width: "90%",
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f7f7f7",
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 40,
  },
  slider: {
    position: "absolute",
    width: "47%",
    height: "80%",
    backgroundColor: "#fff",
    borderRadius: 25,
    zIndex: 0,
    marginVertical: "auto",
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  activeButton: {
    // optional: you can style text color if needed
    // backgroundColor: "white",
  },
  text: {
    fontFamily: "Bold",
    color: "#838383",
  },
  textActive: {
    color: "#000",
  },
});
