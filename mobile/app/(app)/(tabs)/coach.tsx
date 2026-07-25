import {
  useConnectCoach,
  useDetachCoach,
  useMe,
  useReports,
  useSubmitReport,
} from "@/api/domain";
import {
  Button,
  Card,
  EmptyState,
  Screen,
  Text,
  TextField,
} from "@/components/primitives";
import { TrainingHeader } from "@/components/workout-layout";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

export default function Coach() {
  const [code, setCode] = useState("");
  const me = useMe();
  const reports = useReports();
  const connect = useConnectCoach();
  const detach = useDetachCoach();
  const submit = useSubmitReport();
  const pending =
    reports.data?.filter((report) => report.status === "PENDING") ?? [];

  useFocusEffect(
    useCallback(() => {
      void reports.refetch();
    }, [reports.refetch]),
  );

  return (
    <Screen>
      <TrainingHeader title="Coach" name={me.data?.name ?? "Athlete"} />
      <Card>
        <Text variant="subtitle">Connection</Text>
        <Text tone="muted">
          The current API exposes relationship endpoints by trainee identifier;
          this calm code-entry UI is isolated for future invitation-code
          support.
        </Text>
        <TextField label="Coach code" value={code} onChangeText={setCode} />
        <Button label="Connect" onPress={() => connect.mutate(code)} />
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
                submit.mutate({ assignmentId: report.id, answers: { mood: 4 } })
              }
            />
          </Card>
        ))
      ) : (
        <EmptyState
          title="No coach reports"
          body="Assigned reports refresh on focus and pull-to-refresh can be added without realtime dependencies."
        />
      )}
      <Button
        label="Detach coach"
        variant="secondary"
        onPress={() => detach.mutate()}
      />
    </Screen>
  );
}
