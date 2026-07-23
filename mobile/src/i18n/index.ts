import { brand } from "@/config/brand";
import * as Localization from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

export const resources = {
  pl: {
    translation: {
      welcomeTitle: "Trenuj spokojniej, decyduj lepiej",
      welcomeBody: `${brand.name} porządkuje treningi, pomiary i współpracę z trenerem bez hałasu.`,
      brandTagline: brand.tagline,
      signIn: "Zaloguj",
      signUp: "Utwórz konto",
      today: "Dzisiaj",
      workout: "Trening",
      progress: "Postęp",
      coach: "Współpraca",
      more: "Więcej",
      startWorkout: "Rozpocznij trening",
      previousSession: "Poprzednia sesja",
      sameGymOnly: "Benchmark dotyczy aktualnej siłowni",
    },
  },
  en: {
    translation: {
      welcomeTitle: "Train calmly, decide better",
      welcomeBody: `${brand.name} organizes workouts, measurements, and coach collaboration without noise.`,
      brandTagline: brand.taglineEn,
      signIn: "Sign in",
      signUp: "Create account",
      today: "Today",
      workout: "Workout",
      progress: "Progress",
      coach: "Coach",
      more: "More",
      startWorkout: "Start workout",
      previousSession: "Previous session",
      sameGymOnly: "Benchmark belongs to the current gym",
    },
  },
} as const;

export const initI18n = () => {
  if (!i18next.isInitialized)
    void i18next.use(initReactI18next).init({
      resources,
      lng: Localization.getLocales()[0]?.languageCode === "pl" ? "pl" : "en",
      fallbackLng: "en",
      interpolation: { escapeValue: false },
    });
  return i18next;
};
export const formatDate = (date: string | Date, locale = i18next.language) =>
  new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(date),
  );
export const formatNumber = (value: number, locale = i18next.language) =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
