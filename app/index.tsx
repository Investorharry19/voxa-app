import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function index() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      moveUser();
    }, 1000);
  }, []);

  const moveUser = async () => {
    const token = await AsyncStorage.getItem("voxaToken");

    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };
  return <View style={{ backgroundColor: "", flex: 1 }}></View>;
}
