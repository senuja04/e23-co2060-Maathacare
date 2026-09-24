import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";

import LanguageSwitcher from "../components/LanguageSwitcher";
import { API_BASE_URL } from "../constants/apiConfig";

export default function MotherLoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUserLogin = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("userToken");
        if (savedToken) {
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Error checking vault:", error);
      }
    };

    checkUserLogin();
  }, []);

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      Alert.alert("Error", "Please enter both phone number and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
        phoneNumber: phoneNumber,
        password: password,
      });

      const { token, role } = response.data;

      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userRole", role);

      const claims = jwtDecode<{ sub?: string; userId?: string }>(token);
      await AsyncStorage.setItem(
        "userId",
        claims.userId || claims.sub || phoneNumber.trim()
      );

      router.replace("/(tabs)");
    } catch (error) {
      const err = error as any;
      Alert.alert(
        "Login Failed",
        err.response?.data || "Check your connection and credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Right Language Switcher Fixed Container */}
      <View style={styles.topBar}>
        <LanguageSwitcher color="#D87093" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Central Header Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require("../assets/images/motherlogin.jpeg")}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Titles */}
          <Text style={styles.title}>MaathaCare</Text>
          <Text style={styles.subtitle}>Pregnancy Support System</Text>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Phone Input */}
            <Text style={styles.label}>{t("phoneNumber") || "Phone Number"}</Text>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder={t("placeholderPhone") || "e.g. 0771234567"}
                placeholderTextColor="#A0A0A0"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input with Eye Icon Toggle */}
            <Text style={styles.label}>{t("password") || "Password"}</Text>
            <View style={styles.passwordCard}>
              <TextInput
                style={styles.inputInside}
                placeholder={t("Enter your Password") || "Enter your password"}
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#A0A0A0"
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Logging in..." : t("login") || "Login"}
              </Text>
            </TouchableOpacity>

            {/* Sign Up Section */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                {t("Don't Have an Account?") || "Don't have an account?"}{" "}
                <Text
                  style={styles.registerLink}
                  onPress={() => router.push("/register")}
                >
                  {t("signUp") || "Sign Up"}
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topBar: {
    position: "absolute",
    top: Platform.OS === "ios" ? 10 : 20,
    right: 10,
    zIndex: 99,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },
  illustrationContainer: {
    width: 250,
    height: 230,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#DB859E",
    letterSpacing: -0.5,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#888888",
    marginBottom: 30,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
    marginLeft: 2,
  },
  inputCard: {
    width: "100%",
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FAD3E1",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#E09AB1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  passwordCard: {
    width: "100%",
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FAD3E1",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#E09AB1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    fontSize: 15,
    color: "#333333",
    width: "100%",
  },
  inputInside: {
    flex: 1,
    fontSize: 15,
    color: "#333333",
    height: "100%",
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    width: "100%",
    height: 52,
    backgroundColor: "#ECA4B8",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#DB859E",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  registerContainer: {
    marginTop: 22,
    alignItems: "center",
  },
  registerText: {
    color: "#4A4A4A",
    fontSize: 15,
  },
  registerLink: {
    color: "#DB859E",
    fontWeight: "700",
  },
});