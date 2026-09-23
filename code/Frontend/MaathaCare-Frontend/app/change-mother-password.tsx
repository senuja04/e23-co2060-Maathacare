import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { ChevronLeft, Eye, EyeOff, Key, Lock, ShieldCheck } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { API_BASE_URL } from "../constants/apiConfig";

// --- Matching Mother Premium Palette ---
const COLORS = {
  primary: "#db2777", // Mother Pink
  bg: "#fff5f8", // Mother Light Pink BG
  surface: "#FFFFFF",
  border: "#fbcfe8",
  text: "#1f2937",
  textMuted: "#9ca3af",
  iconBg: "#fff1f2",
};

export default function ChangeMotherPasswordScreen() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const userId = await AsyncStorage.getItem("userId");

      if (!token || !userId) {
        Alert.alert(
          "Error",
          "Authentication token missing. Please log in again.",
        );
        return;
      }

      // Ensure this endpoint matches your backend setup
      await axios.put(
        `${API_BASE_URL}/api/mothers/change-password/${userId}`,
        {
          oldPassword: oldPassword,
          newPassword: newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Alert.alert("Success", "Your password has been successfully updated.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Change Password Error:", error);
      Alert.alert(
        "Update Failed",
        error.response?.data?.message ||
          "Could not update password. Please check your current password and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Sleek Custom Header */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.navBack} onPress={() => router.back()}>
          <ChevronLeft color={COLORS.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Icon Header */}
        <View style={styles.iconHeader}>
          <View style={styles.iconCircle}>
            <ShieldCheck color={COLORS.primary} size={32} />
          </View>
          <Text style={styles.headerTitle}>Update Password</Text>
          <Text style={styles.subText}>
            Secure your account with a strong, new credential.
          </Text>
        </View>

        {/* Card Input Area */}
        <View style={styles.formCard}>
          <InputField
            label="Current Password"
            icon={Lock}
            value={oldPassword}
            onChange={setOldPassword}
          />
          <View style={styles.divider} />
          <InputField
            label="New Password"
            icon={Key}
            value={newPassword}
            onChange={setNewPassword}
          />
          <InputField
            label="Confirm New Password"
            icon={Key}
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleUpdatePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Update Credentials</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Reusable Input Component
const InputField = ({ label, icon: Icon, value, onChange }: any) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Icon color={COLORS.textMuted} size={20} style={{ marginRight: 12 }} />
        <TextInput
          style={styles.input}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor="#9ca3af"
          secureTextEntry={!isPasswordVisible} // Toggle based on state
          value={value}
          onChangeText={onChange}
        />
        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
          {isPasswordVisible ? (
            <EyeOff color={COLORS.textMuted} size={20} />
          ) : (
            <Eye color={COLORS.textMuted} size={20} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: COLORS.surface,
  },
  navBack: { width: 40, height: 40, justifyContent: "center" },
  navTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { padding: 24, paddingBottom: 60 },
  iconHeader: { alignItems: "center", marginBottom: 32, marginTop: 20 },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.iconBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "600",
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 12 },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
