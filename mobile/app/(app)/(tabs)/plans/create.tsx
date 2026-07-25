import { ApiError } from "@/api/client";
import { useCreatePlan } from "@/api/domain";
import { Button, Card, Screen, Text, TextField } from "@/components/primitives";
import { router } from "expo-router";
import { useState } from "react";

export default function CreatePlan() {
  const createPlan = useCreatePlan();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const canCreate = name.trim().length > 0 && !createPlan.isPending;

  const submit = () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    if (!trimmedName) {
      setMessage("Enter a plan name first.");
      return;
    }

    createPlan.mutate(
      {
        name: trimmedName,
        ...(trimmedDescription ? { description: trimmedDescription } : {}),
      },
      {
        onSuccess: () => router.replace("/(app)/(tabs)/plans"),
        onError: (error) => {
          setMessage(
            error instanceof ApiError ? error.code : "Could not create plan.",
          );
        },
      },
    );
  };

  return (
    <Screen title="Create plan">
      <Card>
        <Text variant="subtitle">Training plan</Text>
        <Text tone="muted">
          Create the plan first. You will add training days inside it next.
        </Text>
        <TextField label="Plan name" value={name} onChangeText={setName} />
        <TextField
          label="Description"
          value={description}
          onChangeText={setDescription}
        />
      </Card>

      {message ? <Text tone="danger">{message}</Text> : null}
      <Button
        label={createPlan.isPending ? "Creating..." : "Create plan"}
        disabled={!canCreate}
        onPress={submit}
      />
      <Button label="Cancel" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
