import {
  useEloChart,
  useMe,
  useMeasurementTrends,
  useRanking,
  useWorkouts,
} from "@/api/domain";
import { ChartCard, Metric, Screen, Text } from "@/components/primitives";
import { TrainingHeader } from "@/components/workout-layout";

export default function Progress() {
  const me = useMe();
  const elo = useEloChart();
  const ranking = useRanking();
  const workouts = useWorkouts();
  const trend = useMeasurementTrends();
  return (
    <Screen>
      <TrainingHeader title="Progress" name={me.data?.name ?? "Athlete"} />
      <Metric label="Current Elo" value={elo.data?.at(-1)?.newElo ?? "—"} />
      <Metric label="Ranking entries" value={ranking.data?.total ?? "—"} />
      <ChartCard
        title="Elo history"
        summary={`${elo.data?.length ?? 0} data points available as text.`}
      />
      <ChartCard
        title="Body trend"
        summary={`${trend.data?.length ?? 0} measurements in selected trend.`}
      />
      <Text tone="muted">
        Workout history: {workouts.data?.length ?? 0} finalized sessions.
      </Text>
    </Screen>
  );
}
