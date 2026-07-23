import { Button, ErrorState, Screen, TextField } from "@/components/primitives";
import { useAuthStore } from "@/state/auth-store";
import { router } from "expo-router";
import { useState } from "react";

export default function SignUp() {
  const signUp = useAuthStore((state) => state.signUp);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    try {
      await signUp(name, email, password);
      router.replace("/(app)/(tabs)/today");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "REGISTER_FAILED");
    }
  };

  return (
    <Screen title="Create account">
      <TextField label="Username" value={name} onChangeText={setName} />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <ErrorState message={error} /> : null}
      <Button label="Create account" onPress={submit} />
    </Screen>
  );
}
