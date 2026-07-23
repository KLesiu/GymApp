import {
  useEloChart,
  useMeasurements,
  useReports,
  useWorkouts,
} from "@/api/domain";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Metric,
  Screen,
  Skeleton,
  Text,
} from "@/components/primitives";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

export default function Today() {
  const { t } = useTranslation();
  const workouts = useWorkouts();
  const elo = useEloChart();
  const measurements = useMeasurements();
  const reports = useReports();
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12
      ? "Good morning"
      : hour < 18
        ? "Good afternoon"
        : "Good evening";
  }, []);

  useFocusEffect(
    useCallback(() => {
      void reports.refetch();
    }, [reports.refetch]),
  );

  if (workouts.isLoading)
    return (
      <Screen>
        <Skeleton />
      </Screen>
    );
  if (workouts.isError)
    return (
      <Screen>
        <ErrorState
          message="Could not load the dashboard."
          onRetry={() => void workouts.refetch()}
        />
      </Screen>
    );
  const lastWorkout = workouts.data?.[0];

  return (
    <Screen>
      <Text variant="display">{greeting}</Text>
      <Text tone="muted">
        Your next training decision should be obvious, not loud.
      </Text>
      <Button
        label={t("startWorkout")}
        onPress={() => router.push("/(app)/workout/setup")}
      />
      <Card>
        <Text variant="subtitle">Current context</Text>
        <Text tone="muted">
          Last workout:{" "}
          {lastWorkout?.completedAt
            ? new Date(lastWorkout.completedAt).toLocaleDateString()
            : "No finished workouts yet"}
        </Text>
      </Card>
      <Metric label="Elo" value={elo.data?.at(-1)?.newElo ?? "—"} />
      <Metric
        label="Latest measurement"
        value={measurements.data?.[0]?.value ?? "—"}
        delta={
          measurements.data?.[0]?.delta
            ? String(measurements.data[0].delta)
            : undefined
        }
      />
      {reports.data?.some((report) => report.status === "PENDING") ? (
        <Card>
          <Text variant="subtitle">Pending coach report</Text>
          <Text tone="muted">A report is waiting for your input.</Text>
        </Card>
      ) : (
        <EmptyState
          title="No reports waiting"
          body="Coach requests will appear here after refresh or focus."
        />
      )}
    </Screen>
  );
}
