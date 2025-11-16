import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const { height } = Dimensions.get("window");

export default function ShareModal({ visible, onClose, children }: any) {
  const [animation] = useState(new Animated.Value(height));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.poly(5)),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: animation }],
          },
        ]}
      >
        <View style={styles.modalContent}>
          <View style={styles.dragHandle} />
          {children}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
    paddingBottom: 10,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 30,
    width: "95%",
  },
  dragHandle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#ccc",
    marginBottom: 10,
  },
  closeBtn: {
    marginTop: 20,
    alignItems: "center",
  },
  closeText: {
    color: "#007AFF", // iOS blue
    fontSize: 18,
    fontWeight: "600",
  },
});
