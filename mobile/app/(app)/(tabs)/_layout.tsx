import { theme } from "@/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

export default function TabsLayout() {
  const { t } = useTranslation();
  const options = (title: string, icon: keyof typeof Ionicons.glyphMap) => ({
    title,
    tabBarIcon: ({ color }: { color: string }) => (
      <Ionicons name={icon} color={color} size={22} />
    ),
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.contextDark,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={options(t("today"), "sunny-outline")}
      />
      <Tabs.Screen
        name="workout"
        options={options(t("workout"), "barbell-outline")}
      />
      <Tabs.Screen
        name="progress"
        options={options(t("progress"), "analytics-outline")}
      />
      <Tabs.Screen
        name="coach"
        options={options(t("coach"), "people-outline")}
      />
      <Tabs.Screen name="more" options={options(t("more"), "grid-outline")} />
    </Tabs>
  );
}
