import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { jwtDecode } from "jwt-decode";
import { Platform } from "react-native";

import { API_BASE_URL } from "../constants/apiConfig";

type JwtPayload = {
  userId?: string;
  sub?: string;
};

/*
 * Controls how notifications are displayed while the app is open.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Requests notification permission, generates the Expo push token,
 * and saves the token to the Spring Boot backend.
 */
export async function registerAndSyncPushToken(): Promise<string | null> {
  try {
    console.log("Starting push notification registration...");

    /*
     * An Android emulator can work only when its system image
     * includes Google Play services.
     */
    if (!Device.isDevice) {
      console.warn(
        "Running on an emulator. Make sure the emulator uses a Google Play system image.",
      );
    }

    /*
     * Android notifications require a notification channel.
     */
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default Notifications",
        description: "General MaathaCare notifications",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#D962A0",
        sound: "default",
        enableVibrate: true,
        showBadge: true,
      });

      console.log("Android notification channel created.");
    }

    /*
     * Check the existing notification permission.
     */
    const currentPermissions =
      await Notifications.getPermissionsAsync();

    let finalPermissionStatus = currentPermissions.status;

    /*
     * Request permission when it has not already been granted.
     */
    if (finalPermissionStatus !== "granted") {
      const requestedPermissions =
        await Notifications.requestPermissionsAsync();

      finalPermissionStatus = requestedPermissions.status;
    }

    if (finalPermissionStatus !== "granted") {
      console.warn("Notification permission was not granted.");
      return null;
    }

    console.log("Notification permission granted.");

    /*
     * Read the EAS project ID from the Expo configuration.
     *
     * This avoids using the old hardcoded project ID that existed
     * before the GitHub merge.
     */
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      throw new Error(
        "EAS project ID is missing from the Expo configuration.",
      );
    }

    console.log("Using EAS project ID:", projectId);

    /*
     * Generate the Expo push token for the current installation.
     */
    const tokenResponse =
      await Notifications.getExpoPushTokenAsync({
        projectId,
      });

    const expoPushToken = tokenResponse.data;

    if (!expoPushToken) {
      throw new Error("Expo did not return a push token.");
    }

    console.log("Generated Expo push token:", expoPushToken);

    /*
     * Read the currently logged-in user's JWT.
     */
    const userToken =
      await AsyncStorage.getItem("userToken");

    if (!userToken) {
      throw new Error(
        "User authentication token is missing. Please log in again.",
      );
    }

    /*
     * Extract the user ID from the JWT.
     */
    const decodedToken = jwtDecode<JwtPayload>(userToken);

    const realUserId =
      decodedToken.userId ?? decodedToken.sub;

    if (!realUserId) {
      throw new Error(
        "The user ID is missing from the authentication token.",
      );
    }

    console.log("Synchronizing token for user:", realUserId);

    /*
     * Update mother_profiles.push_token in Spring Boot.
     *
     * Expected backend endpoint:
     * PUT /api/mothers/{userId}/push-token
     *
     * Expected request body:
     * {
     *   "pushToken": "ExponentPushToken[...]"
     * }
     */
    const response = await axios.put(
      `${API_BASE_URL}/api/users/${realUserId}/push-token`,
      {
        pushToken: expoPushToken,
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );

    console.log(
      "Push token synced successfully:",
      response.data,
    );

    return expoPushToken;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Push token backend request failed:",
        {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
          url: error.config?.url,
        },
      );
    } else if (error instanceof Error) {
      console.error(
        "Push notification registration failed:",
        error.message,
      );
    } else {
      console.error(
        "Unknown push notification registration error:",
        error,
      );
    }

    return null;
  }
}