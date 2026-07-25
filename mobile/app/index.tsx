import { useAuthStore } from "@/state/auth-store";
import { Redirect } from "expo-router";

export default function Index() {
  return (
    <Redirect
      href={
        useAuthStore((state) => state.token)
          ? "/(app)/(tabs)/workout"
          : "/(auth)/welcome"
      }
    />
  );
}
