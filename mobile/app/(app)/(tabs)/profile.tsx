import { useEloChart, useMe, useRanking } from "@/api/domain";
import {
  Card,
  EmptyState,
  ErrorState,
  Metric,
  Screen,
  Skeleton,
  Text,
} from "@/components/primitives";
import { formatDate } from "@/i18n";
import { theme } from "@/theme/tokens";
import { StyleSheet, View } from "react-native";

export default function Profile() {
  const me = useMe();
  const ranking = useRanking();
  const eloChart = useEloChart();
  const history = eloChart.data ?? [];
  const topRanking = ranking.data?.items ?? [];

  if (me.isLoading || ranking.isLoading || eloChart.isLoading) {
    return (
      <Screen title="LiftContext Rating">
        <Skeleton />
      </Screen>
    );
  }

  if (me.isError || ranking.isError || eloChart.isError) {
    return (
      <Screen title="LiftContext Rating">
        <ErrorState
          message="Could not load rating data."
          onRetry={() => {
            void me.refetch();
            void ranking.refetch();
            void eloChart.refetch();
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen title="LiftContext Rating">
      <Card>
        <Text variant="subtitle">{me.data?.name ?? "Session"}</Text>
        <Text tone="muted">Roles: {me.data?.roles?.join(", ") ?? "—"}</Text>
        <Text tone="muted">
          Your current LiftContext Rating compares strength progress in context,
          not just raw load.
        </Text>
      </Card>
      <View style={styles.metrics}>
        <Metric label="Current rating" value={me.data?.elo ?? "—"} />
        <Metric label="Ranking entries" value={ranking.data?.total ?? 0} />
      </View>
      <Card>
        <Text variant="subtitle">Rating history</Text>
        {history.length ? (
          history.slice(-6).map((point) => (
            <View key={`${point.createdAt}-${point.newElo}`} style={styles.row}>
              <Text tone="muted">{formatDate(point.createdAt)}</Text>
              <Text>{point.newElo}</Text>
            </View>
          ))
        ) : (
          <EmptyState
            title="No rating history yet"
            body="Finish a workout to create your first LiftContext Rating point."
          />
        )}
      </Card>
      <Card>
        <Text variant="subtitle">Top ranking</Text>
        {topRanking.length ? (
          topRanking.map((athlete, index) => (
            <View key={athlete.id ?? athlete._id} style={styles.row}>
              <Text>{index + 1}. {athlete.name}</Text>
              <Text tone="muted">{athlete.elo ?? "—"}</Text>
            </View>
          ))
        ) : (
          <Text tone="muted">No public ranking entries yet.</Text>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: "row", gap: theme.space.sm },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.space.md,
    paddingVertical: theme.space.xs,
  },
});
