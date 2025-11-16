import { Colors } from "@/constants/Colors";
import React, { useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import VoxaGradientButton from "./VoxaGradientButton";

const { width } = Dimensions.get("window");

export default function BottomModalForm({ activeTab, setActiveTab }: any) {
  const tabWidth = width * 0.485 - 38;
  const sliderPosition = useSharedValue(
    activeTab === "username" ? 0 : tabWidth
  );

  useEffect(() => {
    sliderPosition.value = withSpring(activeTab === "username" ? 0 : tabWidth, {
      stiffness: 400,
      damping: 30,
    });
  }, [activeTab]);

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderPosition.value }],
  }));

  return (
    <>
      <View style={styles.toggleContainer}>
        <Animated.View
          style={[styles.slider, sliderStyle, { marginLeft: 6 }]}
        />

        <TouchableOpacity
          style={[
            styles.button,
            activeTab === "username" && styles.activeButton,
          ]}
          onPress={() => {
            setActiveTab("username");
          }}
        >
          <Text
            style={[styles.text, activeTab === "username" && styles.textActive]}
          >
            Username
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            activeTab === "url" && styles.activeButton,
            {},
          ]}
          onPress={() => {
            setActiveTab("url");
          }}
        >
          <Text style={[styles.text, activeTab === "url" && styles.textActive]}>
            User Link
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        nativeID="modal-form"
        textAlignVertical="center"
        numberOfLines={1}
        multiline={false}
        style={styles.textField}
        placeholder={
          activeTab == "username"
            ? "Username e.g hendrix"
            : "www.voxa.buzz/send-message/hendrix"
        }
        placeholderTextColor={"#4d4d4dff"}
      />
      <VoxaGradientButton
        style={{ width: "90%", alignSelf: "center", marginTop: 20 }}
        children={
          <>
            <Text style={{ fontFamily: "Bold", color: "white" }}>
              Send Message
            </Text>
          </>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  textField: {
    marginTop: 20,
    borderColor: Colors.grayOne,
    borderWidth: 2,
    borderRadius: 10,
    color: "black",
    fontSize: 12,
    width: "90%",
    fontFamily: "Regular",
    paddingLeft: 10,
    alignSelf: "center",
  },
  toggleContainer: {
    flexDirection: "row",
    width: "90%",
    height: 50,
    borderRadius: 25,
    backgroundColor: `${Colors.orange + 40}`,
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 40,
    boxShadow: "12px",
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
