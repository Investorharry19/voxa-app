import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Feather"; // or AntDesign, MaterialIcons, etc.

export const toastConfig = {
  success: ({ text1 }: any) => (
    <View style={styles.toastContainer}>
      <View style={[styles.iconCircle, { backgroundColor: "#52c41a" }]}>
        <Icon name="check" size={12} color="#fff" />
      </View>
      <Text style={styles.toastText}>{text1}</Text>
    </View>
  ),

  error: ({ text1 }: any) => (
    <View style={styles.toastContainer}>
      <View style={[styles.iconCircle, { backgroundColor: "#ff4d4f" }]}>
        <Icon name="x" size={12} color="#fff" />
      </View>
      <Text style={styles.toastText}>{text1}</Text>
    </View>
  ),

  info: ({ text1 }: any) => (
    <View style={styles.toastContainer}>
      <View style={[styles.iconCircle, { backgroundColor: "#1890ff" }]}>
        <Icon name="info" size={12} color="#fff" />
      </View>
      <Text style={styles.toastText}>{text1}</Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 20,
    zIndex: 100000,
  },
  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  toastText: {
    fontSize: 12,
    color: "#1f1f1f",
    fontWeight: "500",
    fontFamily: "Regular",
  },
});
