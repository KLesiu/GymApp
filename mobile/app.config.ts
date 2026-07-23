import { brand } from "./src/config/brand.ts";

export default {
  expo: {
    name: brand.appName,
    slug: brand.slug,
    scheme: brand.urlScheme,
    version: "0.1.0",
    orientation: "portrait",
    userInterfaceStyle: "light",
    icon: "./assets/brand/icon.png",
    splash: {
      image: "./assets/brand/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#FAFAF7",
    },
    ios: {
      bundleIdentifier: brand.iosBundleIdentifier,
      supportsTablet: true,
    },
    android: {
      package: brand.androidPackage,
      jsEngine: "jsc",
      adaptiveIcon: {
        foregroundImage: "./assets/brand/adaptive-icon.png",
        backgroundColor: "#FAFAF7",
      },
    },
    web: { favicon: "./assets/brand/favicon.png" },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
    },
    plugins: [
      "expo-router",
      ["expo-secure-store", { configureAndroidBackup: true }],
    ],
    experiments: { typedRoutes: true },
  },
};
