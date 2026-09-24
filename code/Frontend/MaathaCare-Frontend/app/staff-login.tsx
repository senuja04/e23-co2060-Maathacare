import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { API_BASE_URL } from "../constants/apiConfig";

export default function StaffLogin() {
  const router = useRouter();
  const { t } = useTranslation();

  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!staffId || !password) {
      setErrorMessage("Please enter both your Staff ID and Password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const backendUrl = `${API_BASE_URL}/api/users/staff/login`;
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, password }),
      });

      if (!response.ok) {
        setErrorMessage("Invalid Staff ID or Password.");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userRole", data.role);
      router.replace("/phm/phm_dashboard");
    } catch (error) {
      setErrorMessage("Network Error: Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Header Navigation */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text style={styles.backText}>
                {t("backToGateway") || "← Back to Gateway"}
              </Text>
            </TouchableOpacity>

            {/* Positioned at Top Right Corner */}
            <View style={styles.languageSwitcherWrapper}>
              <LanguageSwitcher color="#3A75C4" />
            </View>
          </View>

          {/* Center Shield Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark-outline" size={54} color="#3A75C4" />
          </View>

          {/* Title Header */}
          <Text style={styles.title}>{t("staffPortal") || "Staff Portal"}</Text>
          <Text style={styles.subtitle}>
            {t("secureAccess") || "Secure access for Medical Personnel"}
          </Text>

          {/* Error Message Box */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Staff ID Input */}
            <Text style={styles.label}>{t("staffId") || "Staff ID"}</Text>
            <View style={styles.inputCard}>
              <Ionicons
                name="card-outline"
                size={20}
                color="#6B8CB3"
                style={styles.inputIconLeft}
              />
              <TextInput
                style={styles.input}
                placeholder={t("placeholderStaffId") || "e.g., PHM-100"}
                placeholderTextColor="#9EB2CE"
                value={staffId}
                onChangeText={setStaffId}
                autoCapitalize="characters"
              />
            </View>

            {/* Password Input with Eye Icon Toggle */}
            <Text style={styles.label}>{t("password") || "Password"}</Text>
            <View style={styles.inputCard}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#6B8CB3"
                style={styles.inputIconLeft}
              />
              <TextInput
                style={styles.input}
                placeholder={t("staffplaceholderPassword") || "••••••••"}
                placeholderTextColor="#9EB2CE"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#4A7BB0"
                />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>
                  {t("loginToDashboard") || "Login to Dashboard"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer Disclaimer */}
            <Text style={styles.disclaimerText}>
              For authorized personnel only. By logging in, you agree to the terms of use.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBF3FB", // Light blue background theme
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  topBar: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 16,
    position: "relative",
  },
  backButton: {
    paddingVertical: 6,
    zIndex: 1,
  },
  backText: {
    color: "#2C5282",
    fontSize: 15,
    fontWeight: "600",
  },
  languageSwitcherWrapper: {
    position: "absolute",
    right: -20,
    top: -20,
    zIndex: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#DCEBFB",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1B365D",
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#4A6B94",
    marginBottom: 30,
    textAlign: "center",
  },
  errorBox: {
    width: "100%",
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#B91C1C",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
  },
  formContainer: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 8,
    marginLeft: 2,
  },
  inputCard: {
    width: "100%",
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 20,
    shadowColor: "#1B365D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIconLeft: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1E293B",
  },
  loginButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#3182CE",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#3182CE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  disclaimerText: {
    marginTop: 24,
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
  },
});