import { useMe } from "@/api/domain";
import { Card, Screen, Text } from "@/components/primitives";

export default function Profile() {
  const me = useMe();
  return (
    <Screen title="Profile">
      <Card>
        <Text variant="subtitle">{me.data?.name ?? "Session"}</Text>
        <Text tone="muted">Roles: {me.data?.roles?.join(", ") ?? "—"}</Text>
        <Text tone="muted">Elo: {me.data?.elo ?? "—"}</Text>
      </Card>
    </Screen>
  );
}
