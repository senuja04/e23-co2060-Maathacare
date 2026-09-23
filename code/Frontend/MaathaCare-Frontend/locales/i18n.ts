import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import si from "./si.json";
import ta from "./ta.json";

export type AppLanguage = "en" | "si" | "ta";

export const APP_LANGUAGE_STORAGE_KEY = "appLanguage";
export const SUPPORTED_LANGUAGES: AppLanguage[] = ["en", "si", "ta"];

const resources = {
  en: { translation: en },
  si: { translation: si },
  ta: { translation: ta },
};

void i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  supportedLngs: SUPPORTED_LANGUAGES,
  nonExplicitSupportedLngs: true,
  returnNull: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

const normalizeLanguage = (value: string | null): AppLanguage | null => {
  if (!value) return null;

  const normalized = value.split("-")[0] as AppLanguage;
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : null;
};

export const restoreAppLanguage = async (): Promise<AppLanguage> => {
  try {
    const storedLanguage = normalizeLanguage(
      await AsyncStorage.getItem(APP_LANGUAGE_STORAGE_KEY),
    );

    if (storedLanguage) {
      await i18n.changeLanguage(storedLanguage);
      return storedLanguage;
    }
  } catch (error) {
    console.warn("Could not restore the selected app language:", error);
  }

  return "en";
};

export const changeAppLanguage = async (
  language: AppLanguage,
): Promise<void> => {
  if (!SUPPORTED_LANGUAGES.includes(language)) return;

  await i18n.changeLanguage(language);
  await AsyncStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language);
};

void restoreAppLanguage();

export default i18n;
