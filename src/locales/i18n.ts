import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "./en.json";
import fr from "./fr.json";

const LANGUAGE_STORAGE_KEY = "@app_language";

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
};

// Get device locale and extract language code (e.g., "en-US" -> "en")
const getDeviceLanguage = () => {
  const locale = Localization.getLocales()[0];
  const languageCode = locale?.languageCode || "en";

  // Check if we support this language, otherwise fallback to English
  return resources[languageCode as keyof typeof resources]
    ? languageCode
    : "en";
};

// Initialize i18n with async storage detection
const initI18n = async () => {
  let savedLanguage = null;

  try {
    savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.log("Error loading saved language:", error);
  }

  const initialLanguage = savedLanguage || getDeviceLanguage();

  await i18n.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources,
    lng: initialLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });
};

// Save language preference when it changes
i18n.on("languageChanged", async (lng) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  } catch (error) {
    console.log("Error saving language:", error);
  }
});

// Initialize immediately
initI18n();

export default i18n;
