import { Colors } from "@/constants/Colors";
import { Image, Text, View } from "react-native";

export default function Offline() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.white,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={require("../assets/images/offline.png")}
        style={{
          objectFit: "contain",
          height: 200,
          width: 200,
          marginBottom: 10,
        }}
      />
      <Text style={{ fontFamily: "Bold", fontSize: 20, textAlign: "center" }}>
        No Internet Connection Found...
      </Text>
    </View>
  );
}
