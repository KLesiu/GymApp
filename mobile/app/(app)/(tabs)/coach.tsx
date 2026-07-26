import {
  useAcceptCoachInvitation,
  useCoachInvitations,
  useCurrentCoach,
  useDetachCoach,
  useMe,
  useRejectCoachInvitation,
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
  const invitations = useCoachInvitations();
  const reports = useReports();
  const detach = useDetachCoach();
  const acceptInvitation = useAcceptCoachInvitation();
  const rejectInvitation = useRejectCoachInvitation();
  const submit = useSubmitReport();
  const coach = currentCoach.data?.trainer ?? null;
  const pendingInvitations = invitations.data ?? [];
  const pending =
    reports.data?.filter((report) => report.status === "PENDING") ?? [];

  useFocusEffect(
    useCallback(() => {
      void currentCoach.refetch();
      void invitations.refetch();
      void reports.refetch();
    }, [currentCoach, invitations, reports]),
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
      <Card>
        <Text variant="subtitle">Your connection code</Text>
        <Text>{me.data?.connectionCode ?? "Unavailable"}</Text>
        <Text tone="muted">Share this code with a trainer to receive an invitation.</Text>
      </Card>
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
        <>
          {pendingInvitations.length ? (
            pendingInvitations.map((invitation) => (
              <Card key={invitation.id}>
                <Text variant="subtitle">Coach invitation</Text>
                <Text>{invitation.trainer.name}</Text>
                {invitation.trainer.email ? <Text tone="muted">{invitation.trainer.email}</Text> : null}
                <Button
                  label={acceptInvitation.isPending ? "Accepting..." : "Accept"}
                  disabled={acceptInvitation.isPending || rejectInvitation.isPending}
                  onPress={() => acceptInvitation.mutate(invitation.id)}
                />
                <Button
                  label={rejectInvitation.isPending ? "Rejecting..." : "Reject"}
                  variant="secondary"
                  disabled={acceptInvitation.isPending || rejectInvitation.isPending}
                  onPress={() => rejectInvitation.mutate(invitation.id)}
                />
              </Card>
            ))
          ) : (
            <EmptyState
              title="No coach yet"
              body="Coach invitations and notifications will appear here when a coach invites you."
            />
          )}
        </>
      )}
    </Screen>
  );
}
