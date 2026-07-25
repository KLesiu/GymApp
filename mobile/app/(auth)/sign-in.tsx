import { Button, ErrorState, Screen, TextField } from "@/components/primitives";
import { useAuthStore } from "@/state/auth-store";
import { router } from "expo-router";
import { useState } from "react";

export default function SignIn() {
  const signIn = useAuthStore((state) => state.signIn);
  const [name, setName] = useState("seed-trainee");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    try {
      await signIn(name, password);
      const roles = useAuthStore.getState().roles;
      router.replace(
        roles.length === 1 && roles[0] === "TRAINER"
          ? "/(app)/trainer-only"
          : "/(app)/(tabs)/workout",
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "LOGIN_FAILED");
    }
  };

  return (
    <Screen title="Sign in">
      <TextField label="Username" value={name} onChangeText={setName} />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <ErrorState message={error} /> : null}
      <Button label="Sign in" onPress={submit} />
    </Screen>
  );
}
