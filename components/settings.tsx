import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useGlobal } from "@/utils/globals";

import { AccountApiRequest } from "@/utils/axios";
import Toast from "react-native-toast-message";
import Toggle from "./toggle";
import VoxaGradientButton from "./VoxaGradientButton";

// Settings Modal Component
interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onLogout,
}) => {
  const { allowPushNOtification, setAllowPushNOtification } = useGlobal();

  async function togglePushNotification() {
    try {
      setAllowPushNOtification(!allowPushNOtification);

      await AccountApiRequest.togglePushStatus();

      Toast.show({
        type: "success",
        text1: "Push status updated",
        position: "top",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Somthing went wrong!",
        position: "top",
      });
      setAllowPushNOtification(!allowPushNOtification);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Push Notifications Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive updates and alerts
                </Text>
              </View>
              <Toggle
                value={allowPushNOtification}
                onValueChange={() => togglePushNotification()}
              />
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Logout Button */}
            <VoxaGradientButton onPress={onLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </VoxaGradientButton>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    fontFamily: "Regular",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 20,
    color: "#666",
    fontWeight: "400",
    fontFamily: "Regular",
  },
  content: {
    padding: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 4,
    fontFamily: "Regular",
  },
  settingDescription: {
    fontSize: 13,
    color: "#666",
    fontFamily: "Regular",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 20,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Regular",
  },
});

export default SettingsModal;
