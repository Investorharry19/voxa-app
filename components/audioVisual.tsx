import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
// import { Play, Pause, Backward, Forward } from "iconsax-reactjs"; // use your RN-compatible icons

interface AudioPlayerProps {
  audioFile: string;
}

export default function AudioPlayer({ audioFile }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  const barCount = 40;
  // Base heights and random seeds are stored in refs so they persist
  // across renders and remain stable for the animator.
  const baseHeightsRef = useRef<number[] | null>(null);
  const seedsRef = useRef<number[] | null>(null);
  if (!baseHeightsRef.current) {
    baseHeightsRef.current = Array.from(
      { length: barCount },
      () => Math.random() * 40 + 10
    );
  }
  if (!seedsRef.current) {
    seedsRef.current = Array.from(
      { length: barCount },
      () => Math.random() * Math.PI * 2
    );
  }
  const barHeights = baseHeightsRef.current;
  const seeds = seedsRef.current;

  const progress = useSharedValue(0);
  const time = useSharedValue(0);

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioFile },
        { shouldPlay: false }
      );
      soundRef.current = sound;

      const status = await sound.getStatusAsync();
      setDuration(((status as any).durationMillis || 0) / 1000);

      sound.setOnPlaybackStatusUpdate((status) => {
        const s = status as any;
        if (s.isLoaded) {
          const pos = s.positionMillis || 0;
          setCurrentTime(pos / 1000);
          time.value = pos; // used by the visualizer for lively animation
          progress.value = withTiming(
            (s.positionMillis || 0) / (s.durationMillis || 1),
            { duration: 120 }
          );
          setIsPlaying(!!s.isPlaying);

          // If playback just finished, mark as not playing so user can replay
          if (s.didJustFinish) {
            setIsPlaying(false);
            // ensure progress reaches 100% and time is at duration
            if (s.durationMillis) {
              time.value = s.durationMillis;
              progress.value = withTiming(1, { duration: 120 });
              setCurrentTime((s.durationMillis || 0) / 1000);
            }
          }
        }
      });
    };

    loadSound();

    return () => {
      soundRef.current?.unloadAsync();
    };
  }, [audioFile]);

  const handlePlayPause = async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    const s = status as any;
    if (!s.isLoaded) return;
    // If playback reached the end, reset position before playing again
    const pos = s.positionMillis || 0;
    const dur = s.durationMillis || 0;
    if (s.isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      if (dur > 0 && pos >= dur - 50) {
        // small threshold to detect 'at end'
        await soundRef.current.setPositionAsync(0);
      }
      await soundRef.current.playAsync();
    }
  };

  const handleBackward = async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    const s = status as any;
    const newPosition = Math.max((s.positionMillis || 0) - 5000, 0);
    await soundRef.current.setPositionAsync(newPosition);
  };

  const handleForward = async () => {
    if (!soundRef.current) return;
    const status = await soundRef.current.getStatusAsync();
    const s = status as any;
    const newPosition = Math.min(
      (s.positionMillis || 0) + 5000,
      s.durationMillis || 0
    );
    await soundRef.current.setPositionAsync(newPosition);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.waveform}>
        {barHeights.map((baseH, index) => {
          const animatedStyle = useAnimatedStyle(() => {
            // Use playback time to generate a smooth waveform per bar.
            const t = time.value / 1000; // seconds
            const freq = 2 + index * 0.06; // slightly different frequency per bar
            const wave = 0.5 + 0.5 * Math.sin(t * freq + (seeds[index] || 0));
            const dynamicHeight = baseH * (0.35 + 0.65 * wave);
            const active = progress.value >= index / barCount;
            return {
              height: dynamicHeight,
              backgroundColor: active ? "#F67B00" : "#CBCBCB",
              transform: [{ translateY: (60 - dynamicHeight) / 2 }],
            };
          });
          return (
            <Animated.View key={index} style={[styles.bar, animatedStyle]} />
          );
        })}
      </View>

      <View style={styles.timeContainer}>
        <Text style={{ fontFamily: "Regular", fontSize: 12 }}>
          {formatTime(currentTime)}
        </Text>
        <Text style={{ fontFamily: "Regular", fontSize: 12 }}>
          {formatTime(duration)}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          gap: 30,
          marginTop: 60,
          alignSelf: "center",
        }}
      >
        <TouchableOpacity onPress={handleBackward}>
          <Animated.Image
            style={[
              {
                height: 35,
                width: 35,
              },
            ]}
            source={require("../assets/images/backward.png")}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause}>
          {!isPlaying ? (
            <Animated.Image
              style={[
                {
                  height: 35,
                  width: 35,
                },
              ]}
              source={require("../assets/images/play.png")}
            />
          ) : (
            <Animated.Image
              style={[
                {
                  height: 35,
                  width: 35,
                },
              ]}
              source={require("../assets/images/pause.png")}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleForward}>
          <Animated.Image
            style={[
              {
                height: 35,
                width: 35,
              },
            ]}
            source={require("../assets/images/forward.png")}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  waveform: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    height: 60,
    marginBottom: 10,
  },
  bar: { width: 4, borderRadius: 2 },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  ctrlBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F2F2F2",
    borderRadius: 6,
  },
  ctrlText: {
    color: "#F67B00",
    fontWeight: "600",
  },
});
