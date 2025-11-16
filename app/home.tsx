import { Colors } from "@/constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ImageBackground,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const home = () => {
  const router = useRouter();
  return (
    <ImageBackground
      style={{
        flex: 1,
        paddingVertical: 50,
        paddingHorizontal: 30,
        justifyContent: "space-between",
      }}
      source={require("../assets/images/home-bg.png")}
    >
      <View
        style={{
          height: 50,
          borderColor: "#eaeaea",
          borderWidth: 1,
          borderRadius: 50,
          backgroundColor: "#ffffff2c",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 10,
        }}
      >
        <Image
          source={require("../assets/images/logo.png")}
          style={{ width: 80, objectFit: "scale-down" }}
        />
        <TouchableOpacity
          style={{
            backgroundColor: "#fff3ec",
            flexDirection: "row",
            borderRadius: 30,
            paddingHorizontal: 10,
            height: 30,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => router.push("/login")}
        >
          <Text
            style={{ fontFamily: "Regular", marginRight: 10, fontSize: 12 }}
          >
            Sign In
          </Text>
          <AntDesign name="arrowright" size={14} color="black" />
        </TouchableOpacity>
      </View>
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            borderColor: "#ffe4c8",
            borderWidth: 1,
            width: 70,
            fontFamily: "Regular",
            textAlign: "center",
            backgroundColor: "#fff3ec",
            borderRadius: 100,
            paddingVertical: 2,
          }}
        >
          Beta
        </Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            maxWidth: 350,
            justifyContent: "center",
            gap: 0,
          }}
        >
          <Text style={{ fontSize: 30, fontFamily: "Bold" }}>Speak</Text>
          <Text
            style={{ fontSize: 30, fontFamily: "Bold", color: Colors.orange }}
          >
            Anonymously,
          </Text>
          <Text style={{ fontSize: 30, fontFamily: "Bold" }}>Connect </Text>
          <Text style={{ fontSize: 30, fontFamily: "Bold" }}>Honestly</Text>
        </View>
        <Text
          style={{
            fontSize: 12,
            fontFamily: "Regular",
            textAlign: "center",
            marginTop: 10,
          }}
        >
          Anonymous voice & text messaging with built-in voice masking.
        </Text>
        <Pressable
          onPress={() => router.push("/register")}
          style={styles.pressable}
        >
          <LinearGradient
            colors={["#ff6d24", "#e54d00", "#db4900"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </LinearGradient>
        </Pressable>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
        <Text
          onPress={() =>
            Linking.openURL(
              "https://www.notion.so/Privacy-Policy-1e2f975cf41a80f8bab6c9adb8e61076"
            )
          }
          style={{ fontSize: 12, fontFamily: "Regular" }}
        >
          Privacy Policy
        </Text>
        <Text
          onPress={() =>
            Linking.openURL(
              "https://www.notion.so/Terms-of-Service-1e2f975cf41a805bbec4c42147b9edc7"
            )
          }
          style={{ fontSize: 12, fontFamily: "Regular" }}
        >
          Terms of Service
        </Text>
      </View>
    </ImageBackground>
  );
};

export default home;

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 64, // ensure ripple doesn't bleed outside
    overflow: "hidden",
    marginTop: 30,
  },
  button: {
    borderWidth: 0.5,
    borderColor: "#ff6d24", // simulate var(--primary-orange)
    height: 48,
    paddingHorizontal: 26, // ~1.625rem
    borderRadius: 64,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "#fff", // simulate var(--white)
    fontSize: 14, // simulate var(--fs-14px)
    fontWeight: "500", // simulate var(--fw-medium)
    fontFamily: "Regular",
  },
});
