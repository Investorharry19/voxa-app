import VoxaGradientButton from "@/components/VoxaGradientButton";
import { Colors } from "@/constants/Colors";
import { AccountApiRequest } from "@/utils/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import AntDesign from "@expo/vector-icons/AntDesign";
import { useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

type FormData = {
  username: string;
  password: string;
};

const Home = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [makingRequest, setMakingRequest] = useState(false);

  const { expiredToken } = useLocalSearchParams();
  useEffect(() => {
    if (expiredToken) {
      AsyncStorage.removeItem("voxaToken");
      Toast.show({
        type: "error",
        text1: "Session expired. Please login again",
        position: "bottom",
      });
    }
  }, [expiredToken]);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log("Form submitted:", data);
    setMakingRequest(true);
    try {
      const res: { token: string } = await AccountApiRequest.login(data);
      console.log(res);
      Toast.show({
        type: "success",
        text1: "Login Successful",
      });
      console.log(res);

      await AsyncStorage.setItem("voxaToken", res.token);
      console.log(data.username);
      router.push({
        pathname: "/dashboard",
        params: {
          username: data.username,
        },
      });
    } catch (err: any) {
      const status = err.response?.status;
      // const message = err.response?.data?.message || err.message;
      console.log(status);
      if (status == 461) {
        Toast.show({
          type: "error",
          text1: "A user with this username already exist",
          position: "top",
        });
      } else if (status == 404) {
        Toast.show({
          type: "error",
          text1: "Invalid username or password",
          position: "top",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Something went wrong. try again",
          position: "top",
        });
      }
    } finally {
      setMakingRequest(false);
    }
  };

  const password = watch("password");

  return (
    <>
      <SafeAreaView style={styles.screen}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // adjust if needed
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: "center",
            }}
            keyboardShouldPersistTaps="handled"
          >
            <Image
              source={require("../assets/images/logo.png")}
              style={{ width: 100, height: 100, resizeMode: "contain" }}
            />
            <Text style={styles.heading}>Welcome Back</Text>
            <Text style={styles.subheading}>
              Sign-in to your account to continue
            </Text>
            <View style={styles.form}>
              {/* Username */}
              <Text style={styles.label}>Username</Text>
              <View>
                <Controller
                  name="username"
                  control={control}
                  rules={{
                    required: "Username is required",
                    minLength: {
                      value: 6,
                      message: "Username must be at least 6 characters",
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="Username"
                      value={value}
                      onChangeText={onChange}
                      style={[styles.input]}
                      textAlignVertical="center"
                      numberOfLines={1}
                      multiline={false}
                    />
                  )}
                />
                {errors.username && (
                  <Text style={styles.errorText}>
                    {errors.username.message}
                  </Text>
                )}
              </View>
              {/* Password */}

              <View>
                <Text style={styles.label}>Password</Text>

                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      placeholder="Password"
                      secureTextEntry
                      value={value}
                      onChangeText={onChange}
                      style={[styles.input]}
                    />
                  )}
                />
                {errors.password && (
                  <Text style={styles.errorText}>
                    {errors.password.message}
                  </Text>
                )}
              </View>

              {/* Submit Button */}
              <VoxaGradientButton onPress={handleSubmit(onSubmit)}>
                {makingRequest === false ? (
                  <Text style={{ fontFamily: "Bold", color: "white" }}>
                    Sign In
                  </Text>
                ) : (
                  <ActivityIndicator size="large" color={Colors.white} />
                )}
              </VoxaGradientButton>
              <View
                style={{
                  marginTop: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontFamily: "Regular", fontSize: 14 }}>
                  You are new here?{" "}
                </Text>
                <Text
                  onPress={() => router.push("/register")}
                  style={{
                    fontFamily: "Regular",
                    fontSize: 14,
                    color: Colors.orange,
                  }}
                >
                  Sign Up
                </Text>
              </View>
            </View>
            <View
              style={{
                marginTop: "auto",
                flexDirection: "row",
                alignItems: "center",
                // width: "100%",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Text
                style={{
                  fontFamily: "Regular",
                  fontSize: 12,
                  color: Colors.grayOne,
                }}
              >
                By using Voxa, you agree to our{" "}
              </Text>
              <Text
                onPress={() =>
                  Linking.openURL(
                    "https://www.notion.so/Terms-of-Service-1e2f975cf41a805bbec4c42147b9edc7"
                  )
                }
                style={{
                  fontFamily: "Regular",
                  fontSize: 12,
                }}
              >
                Terms of Service
              </Text>
              <Text
                style={{
                  fontFamily: "Regular",
                  fontSize: 12,
                  color: Colors.grayOne,
                }}
              >
                And{" "}
              </Text>
              <Text
                onPress={() =>
                  Linking.openURL(
                    "https://www.notion.so/Terms-of-Service-1e2f975cf41a805bbec4c42147b9edc7"
                  )
                }
                style={{
                  fontFamily: "Regular",
                  fontSize: 12,
                }}
              >
                Privacy Policy
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        collapsable={false}
      >
        <View style={styles.backdrop}>
          <View
            style={{
              backgroundColor: "#9ae1ac",
              height: 70,
              width: 70,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 100,
              marginBottom: 10,
            }}
          >
            <AntDesign name="check" size={45} color="#02b52f" />
          </View>
          <Text style={{ fontFamily: "Regular", fontSize: 30 }}>Success</Text>
          <Text
            style={{
              fontFamily: "Regular",
              fontSize: 12,
              textAlign: "center",
              maxWidth: "80%",
            }}
          >
            Your account has been created successfully, continue to login
          </Text>
          <VoxaGradientButton onPress={() => router.push("/login")}>
            <Text
              style={{
                fontFamily: "Regular",
                fontSize: 14,
                textAlign: "center",
                color: "white",
              }}
            >
              Procees to Login
            </Text>
          </VoxaGradientButton>
        </View>
      </Modal>
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
  },
  heading: {
    fontFamily: "Bold",
    fontSize: 28,
  },
  subheading: {
    fontFamily: "Regular",
    fontSize: 11,
    marginTop: 1,
    textAlign: "center",
    color: Colors.grayOne,
  },
  form: {
    marginTop: 20,
    width: "100%",
    gap: 10,
  },
  label: {
    fontFamily: "Regular",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "Regular",
    height: 45,
    overflow: "hidden",
    color: "#000",
  },

  errorText: {
    color: "red",
    fontSize: 10,
    fontFamily: "Regular",
  },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  backdrop: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  modalText: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "500",
  },
});
