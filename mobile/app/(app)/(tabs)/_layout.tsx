import { useAuthStore } from "@/state/auth-store";
import { theme } from "@/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs, usePathname } from "expo-router";
import { useTranslation } from "react-i18next";

export default function TabsLayout() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const roles = useAuthStore((state) => state.roles);
  const trainerOnly = roles.length === 1 && roles[0] === "TRAINER";
  const options = (title: string, icon: keyof typeof Ionicons.glyphMap) => ({
    title,
    tabBarIcon: ({ color }: { color: string }) => (
      <Ionicons name={icon} color={color} size={22} />
    ),
  });
  const screenOptions = {
    headerShown: false,
    tabBarActiveTintColor: theme.colors.contextDark,
    tabBarInactiveTintColor: theme.colors.textMuted,
    tabBarStyle: {
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.border,
    },
  };

  if (trainerOnly && !pathname.includes("/trainer-only")) {
    return <Redirect href="/(app)/(tabs)/trainer-only" />;
  }

  if (trainerOnly) {
    return (
      <Tabs initialRouteName="trainer-only" screenOptions={screenOptions}>
        <Tabs.Screen
          name="trainer-only"
          options={options("Trainer", "briefcase-outline")}
        />
        <Tabs.Screen name="workout" options={{ href: null }} />
        <Tabs.Screen name="history" options={{ href: null }} />
        <Tabs.Screen name="coach" options={{ href: null }} />
        <Tabs.Screen name="more" options={{ href: null }} />
      </Tabs>
    );
  }

  return (
    <Tabs initialRouteName="workout" screenOptions={screenOptions}>
      <Tabs.Screen
        name="workout"
        options={options(t("workout"), "barbell-outline")}
      />
      <Tabs.Screen
        name="history"
        options={options(t("history"), "time-outline")}
      />
      <Tabs.Screen
        name="coach"
        options={options(t("coach"), "people-outline")}
      />
      <Tabs.Screen name="more" options={options(t("more"), "grid-outline")} />
      <Tabs.Screen name="plans" options={{ href: null }} />
      <Tabs.Screen name="plans/create" options={{ href: null }} />
      <Tabs.Screen name="exercises" options={{ href: null }} />
      <Tabs.Screen name="gyms" options={{ href: null }} />
      <Tabs.Screen name="measurements" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="trainer-only" options={{ href: null }} />
      <Tabs.Screen name="workout-setup" options={{ href: null }} />
      <Tabs.Screen
        name="workout-session/[workoutId]"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="workout-summary/[workoutId]"
        options={{ href: null }}
      />
    </Tabs>
  );
}
