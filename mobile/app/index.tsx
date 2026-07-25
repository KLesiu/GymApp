import { useAuthStore } from "@/state/auth-store";
import { Redirect } from "expo-router";

export default function Index() {
  const token = useAuthStore((state) => state.token);
  const roles = useAuthStore((state) => state.roles);
  const trainerOnly = roles.length === 1 && roles[0] === "TRAINER";

  return (
    <Redirect
      href={
        token
          ? trainerOnly
            ? "/(app)/(tabs)/trainer-only"
            : "/(app)/(tabs)/workout"
          : "/(auth)/welcome"
      }
    />
  );
}
