import { Colors } from "@/constants/Colors";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity } from "react-native";

// Toggle Component
interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
  activeColor = Colors.orange,
  inactiveColor = "#E5E5EA",
  thumbColor = "#FFFFFF",
}) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  const config = { width: 51, height: 31, thumb: 27, padding: 2 };

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      bounciness: 8,
    }).start();
  }, [value]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  const thumbPosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [config.padding, config.width - config.thumb - config.padding],
  });

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Animated.View
        style={[
          toggleStyles.track,
          {
            width: config.width,
            height: config.height,
            backgroundColor,
            borderRadius: config.height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            toggleStyles.thumb,
            {
              width: config.thumb,
              height: config.thumb,
              backgroundColor: thumbColor,
              borderRadius: config.thumb / 2,
              transform: [{ translateX: thumbPosition }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const toggleStyles = StyleSheet.create({
  track: {
    justifyContent: "center",
  },
  thumb: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default Toggle;
