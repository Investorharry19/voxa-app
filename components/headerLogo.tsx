import React, { useRef, useState } from "react";
import { Image, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { BottomSheetModal } from "./bottomModal";
import BottomModalForm from "./bottomModalForm";

export default function DoubleTapManual() {
  const lastTap = useRef<any>(null);
  const DOUBLE_TAP_DELAY = 300; // milliseconds
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("username");

  const handleDoubleTap = () => {
    setVisible(true);
  };

  const handleTap = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < DOUBLE_TAP_DELAY) {
      handleDoubleTap();
    }
    lastTap.current = now;
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={handleTap}>
        <Image
          source={require("../assets/images/logo-small.png")}
          style={{ width: 45, height: 45 }}
        />
      </TouchableWithoutFeedback>

      <BottomSheetModal
        visible={visible}
        onClose={() => setVisible(false)}
        children={
          <BottomModalForm activeTab={activeTab} setActiveTab={setActiveTab} />
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "skyblue",
  },
});
