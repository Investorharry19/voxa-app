import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet } from "react-native";

type VoxaGradientButtonProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: object;
  disable?: boolean;
};

const VoxaGradientButton = ({
  children,
  onPress,
  disable = false,
  style = {},
}: VoxaGradientButtonProps) => {
  return (
    <Pressable onPress={onPress} style={styles.pressable} disabled={disable}>
      <LinearGradient
        colors={["#ff6d24", "#e54d00", "#db4900"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.button, style]}
      >
        {children}
      </LinearGradient>
    </Pressable>
  );
};

export default VoxaGradientButton;

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 64, // ensure ripple doesn't bleed outside
    overflow: "hidden",
    // marginTop: 30,
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
