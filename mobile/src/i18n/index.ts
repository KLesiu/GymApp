import { brand } from "@/config/brand";
import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";

const i18next = createInstance();

export const resources = {
  en: {
    translation: {
      welcomeTitle: "Train calmly, decide better",
      welcomeBody: `${brand.name} organizes workouts, measurements, and coach collaboration without noise.`,
      brandTagline: brand.tagline,
      signIn: "Sign in",
      signUp: "Create account",
      workout: "Workout",
      history: "History",
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
      lng: "en",
      fallbackLng: "en",
      interpolation: { escapeValue: false },
    });
  return i18next;
};
export const formatDate = (date: string | Date, locale = "en") =>
  new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
    new Date(date),
  );
export const formatDateTime = (date: string | Date, locale = "en") =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
export const formatNumber = (value: number, locale = "en") =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
