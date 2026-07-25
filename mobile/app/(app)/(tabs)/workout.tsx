import { useMe } from "@/api/domain";
import { Button, Card, Screen, Text } from "@/components/primitives";
import { TrainingHeader } from "@/components/workout-layout";
import { router } from "expo-router";
import { StyleSheet } from "react-native";

export default function WorkoutTab() {
  const me = useMe();

  return (
    <Screen style={styles.screen}>
      <TrainingHeader title="Workout" name={me.data?.name ?? "Athlete"} />
      <Card style={styles.startCard}>
        <Text variant="title">Start a workout</Text>
        <Text tone="muted">
          {me.data?.name
            ? `${me.data.name}, choose your gym first, then select the training day you want to run.`
            : "Choose your gym first, then select the training day you want to run."}
        </Text>
        <Button
          label="Start"
          onPress={() => router.push("/(app)/(tabs)/workout-setup")}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: "space-between",
  },
  startCard: {
    alignItems: "center",
  },
});
