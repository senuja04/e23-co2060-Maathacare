import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function SplashScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const slideUpAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/role-selection");
    }, 3200);

    return () => clearTimeout(timer);
  }, [fadeAnim, router, scaleAnim, slideUpAnim]);

  return (
    <LinearGradient
      colors={["#FFF0F8", "#FFFFFF", "#F0F8FF"]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideUpAnim },
            ],
          },
        ]}
      >
        <View style={styles.glowRing} />

        <Image
          source={require("../assets/images/logo.png")}
          style={styles.mainImage}
          resizeMode="contain"
        />

        <Text style={styles.appName}>MaathaCare</Text>

        <View style={styles.divider} />

        <Text style={styles.tagline}>
          Together for a safer motherhood
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  glowRing: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#FFF0F8",
    opacity: 0.6,
    zIndex: -1,
  },
  mainImage: {
    width: width * 0.55,
    height: width * 0.55,
    marginBottom: 20,
  },
  appName: {
    fontSize: 38,
    fontWeight: "900",
    color: "#665A7A",
    letterSpacing: 2,
    textShadowColor: "rgba(217, 98, 160, 0.15)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: "#F472B6",
    borderRadius: 2,
    marginVertical: 15,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "600",
    color: "#988FA8",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});