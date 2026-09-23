import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // 🟢 Updated to safe-area-context
import LanguageSwitcher from "../components/LanguageSwitcher";
import { API_BASE_URL } from "../constants/apiConfig";

// 🟢 Helper to decode JWT without extra libraries
const decodeToken = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export default function StaffLogin() {
  const router = useRouter();
  const { t } = useTranslation();

  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
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
      
      // 🟢 Extract userId from the token payload (the 'sub' field)
      const decoded = decodeToken(data.token);
      const userId = decoded?.sub || ""; 

      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userRole", data.role);
      await AsyncStorage.setItem("userId", userId.toString()); // 🟢 Now uses extracted ID

      router.replace("/phm/phm_dashboard");
    } catch (error) {
      setErrorMessage("Network Error: Could not connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LanguageSwitcher color="#0056b3" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.innerContainer}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>{t('backToGateway')}</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{t('staffPortal')}</Text>
          <Text style={styles.subtitle}>{t('secureAccess')}</Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Text style={styles.label}>{t('staffId')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('placeholderStaffId')}
            value={staffId}
            onChangeText={setStaffId}
            autoCapitalize="none"
          />

          <Text style={styles.label}>{t('password')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('staffplaceholderPassword')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>{t('loginToDashboard')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  innerContainer: { flex: 1, padding: 25, justifyContent: "center" },
  backButton: { position: "absolute", top: 60, left: 20, zIndex: 10 },
  backText: { color: "#0056b3", fontSize: 16, fontWeight: "600" },
  header: { marginBottom: 40 },
  title: { fontSize: 36, fontWeight: "bold", color: "#0056b3", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#6c757d" },
  errorBox: { backgroundColor: "#FFD2D2", padding: 12, borderRadius: 8, marginBottom: 20 },
  errorText: { color: "#D8000C", textAlign: "center", fontWeight: "bold" },
  form: { width: "100%" },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: "#ffffff", padding: 15, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: "#E0E0E0", marginBottom: 20 },
  loginButton: { backgroundColor: "#0056b3", paddingVertical: 18, borderRadius: 12, alignItems: "center" },
  loginButtonText: { color: "#ffffff", fontSize: 18, fontWeight: "bold" },
});