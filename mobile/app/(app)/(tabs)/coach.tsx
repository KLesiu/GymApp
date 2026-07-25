import {
  useCurrentCoach,
  useDetachCoach,
  useMe,
  useReports,
  useSubmitReport,
} from "@/api/domain";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Screen,
  Skeleton,
  Text,
} from "@/components/primitives";
import { TrainingHeader } from "@/components/workout-layout";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function Coach() {
  const me = useMe();
  const currentCoach = useCurrentCoach();
  const reports = useReports();
  const detach = useDetachCoach();
  const submit = useSubmitReport();
  const coach = currentCoach.data?.trainer ?? null;
  const pending =
    reports.data?.filter((report) => report.status === "PENDING") ?? [];

  useFocusEffect(
    useCallback(() => {
      void currentCoach.refetch();
      void reports.refetch();
    }, [currentCoach, reports]),
  );

  if (currentCoach.isLoading) {
    return (
      <Screen>
        <TrainingHeader title="Coach" name={me.data?.name ?? "Athlete"} />
        <Skeleton />
      </Screen>
    );
  }

  if (currentCoach.isError) {
    return (
      <Screen>
        <TrainingHeader title="Coach" name={me.data?.name ?? "Athlete"} />
        <ErrorState
          message="Could not load coach relationship."
          onRetry={() => void currentCoach.refetch()}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <TrainingHeader title="Coach" name={me.data?.name ?? "Athlete"} />
      {coach ? (
        <>
          <Card>
            <Text variant="subtitle">Your coach</Text>
            <Text>{coach.name}</Text>
            {coach.email ? <Text tone="muted">{coach.email}</Text> : null}
          </Card>
          {pending.length ? (
            pending.map((report) => (
              <Card key={report.id}>
                <Text variant="subtitle">Report due</Text>
                <Text tone="muted">
                  {report.note ?? "Answer the frozen template fields."}
                </Text>
                <Button
                  label="Submit quick check-in"
                  onPress={() =>
                    submit.mutate({
                      assignmentId: report.id,
                      answers: { mood: 4 },
                    })
                  }
                />
              </Card>
            ))
          ) : (
            <EmptyState
              title="No coach notifications"
              body="New check-ins and coach requests will appear here."
            />
          )}
          <Button
            label={detach.isPending ? "Detaching..." : "Detach coach"}
            variant="secondary"
            disabled={detach.isPending}
            onPress={() => detach.mutate()}
          />
        </>
      ) : (
        <EmptyState
          title="No coach yet"
          body="Coach invitations and notifications will appear here when a coach invites you."
        />
      )}
    </Screen>
  );
}
