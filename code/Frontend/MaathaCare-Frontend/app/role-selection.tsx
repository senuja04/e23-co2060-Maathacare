import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { ArrowRight, ShieldCheck } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function GatewayScreen() {
  const router = useRouter();
  const [isCheckingUser, setIsCheckingUser] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const checkLoginStatus = async () => {
        try {
          // 1. Reset to loading state whenever we focus this screen
          setIsCheckingUser(true);

          const userToken = await AsyncStorage.getItem("userToken");
          const userRole = await AsyncStorage.getItem("userRole");

          console.log(
            "Gateway Check - Token exists:",
            !!userToken,
            "Role:",
            userRole,
          );

          // 🛡️ THE SAFETY GUARD: If no token, STOP immediately and show UI
          if (!userToken) {
            setIsCheckingUser(false);
            return;
          }

          // 2. If token exists, redirect based on role
          if (userRole === "MOTHER") {
            router.replace("/(tabs)");
          } else if (userRole === "PHM") {
            router.replace("/phm/phm_dashboard");
          } else if (userRole === "ADMIN") {
            // router.replace("/admin/admin_hub");
          } else {
            // Fallback if role is corrupted or missing
            setIsCheckingUser(false);
          }
        } catch (error) {
          console.error("Error checking login status:", error);
          setIsCheckingUser(false);
        }
      };

      checkLoginStatus();
    }, []),
  );

  // --- LOADING STATE ---
  if (isCheckingUser) {
    return (
      <View style={[styles.background, styles.loadingCenter]}>
        <ActivityIndicator size="large" color="#D962A0" />
        <Text style={styles.loadingText}>Loading MaathaCare...</Text>
      </View>
    );
  }

  // --- BEAUTIFUL UI STATE ---
  return (
    <LinearGradient
      // Creates the soft pink top fading into the light blue bottom
      colors={["#FFF0F8", "#FFFFFF", "#F0F8FF"]}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* --- TOP BRANDING (Using your logo image) --- */}
          <View style={styles.header}>
            <Image
              source={require("../assets/images/logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* --- WELCOME TEXT --- */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome! ♡</Text>
            <Text style={styles.welcomeText}>
              We're here to support you{"\n"}through every step of your journey.
            </Text>
          </View>

          {/* --- HERO ILLUSTRATION (Using Center image) --- */}
          <View style={styles.heroContainer}>
            <Image
              source={require("../assets/images/center.jpeg")}
              style={styles.heroImage}
              resizeMode="contain"
            />
          </View>

          {/* --- ROLE CARDS --- */}

          {/* 1. Mother Card */}
          <View style={[styles.card, styles.motherCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.avatarPlaceholderPink}>
                <Image
                  source={require("../assets/images/mother.jpeg")}
                  style={styles.cardIcon}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.motherTitle}>I'm a Mother</Text>
            </View>

            <Text style={styles.cardDescription}>
              Track your pregnancy, appointments, health, and baby growth.
            </Text>
            <Text style={styles.cardSubText}>(Login or register for care)</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.motherButton}
              onPress={() => router.push("/mother-login")}
            >
              <ArrowRight color="#FFF" size={24} />
            </TouchableOpacity>
          </View>

          {/* 2. Health Staff Card */}
          <View style={[styles.card, styles.staffCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.avatarPlaceholderBlue}>
                <Image
                  source={require("../assets/images/PHM.jpeg")}
                  style={styles.cardIcon}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.staffTitle}>I'm Health Staff</Text>
            </View>

            <Text style={styles.cardDescription}>
              Manage patients, appointments, reports, and provide quality care.
            </Text>
            <Text style={styles.cardSubText}>(Secure PHM & Admin Portal)</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.staffButton}
              onPress={() => router.push("/staff-login")}
            >
              <ArrowRight color="#FFF" size={24} />
            </TouchableOpacity>
          </View>

          {/* --- FOOTER --- */}
          <View style={styles.footer}>
            <ShieldCheck
              color="#988FA8"
              size={24}
              style={{ marginRight: 10 }}
            />
            <Text style={styles.footerText}>
              Your health. Our priority.{"\n"}Together for a safer motherhood.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // --- Loading Styles ---
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF9FD",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#D962A0",
    fontWeight: "600",
  },

  // --- UI Styles ---
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  logoImage: {
    width: 250,
    height: 120,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#665A7A",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: "#665B77",
    textAlign: "center",
    lineHeight: 20,
  },
  heroContainer: {
    width: width * 0.9,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    alignItems: "center",
  },
  motherCard: {
    backgroundColor: "#FFF5F8",
    borderColor: "#FADADD",
  },
  staffCard: {
    backgroundColor: "#F4F9FF",
    borderColor: "#D2E5F9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarPlaceholderPink: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFE4EC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  avatarPlaceholderBlue: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E4F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    overflow: "hidden",
  },
  cardIcon: {
    width: "100%",
    height: "100%",
  },
  motherTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#D962A0",
  },
  staffTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0056b3",
  },
  cardDescription: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  cardSubText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
    marginBottom: 20,
  },
  motherButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#F472B6",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  staffButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#0056b3",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#665B77",
    lineHeight: 18,
  },
});
