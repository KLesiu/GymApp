import { useCreateGym, useGyms } from "@/api/domain";
import {
  Button,
  Card,
  EmptyState,
  Screen,
  Text,
  TextField,
} from "@/components/primitives";
import { useState } from "react";

export default function Gyms() {
  const gyms = useGyms();
  const create = useCreateGym();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  return (
    <Screen title="Gyms">
      <Card>
        <Text variant="subtitle">New location</Text>
        <TextField label="Name" value={name} onChangeText={setName} />
        <TextField label="Address" value={address} onChangeText={setAddress} />
        <Button
          label="Save gym"
          onPress={() => create.mutate({ name, address })}
        />
      </Card>
      {gyms.data?.length ? (
        gyms.data
          .filter((gym) => !gym.deletedAt)
          .map((gym) => (
            <Card key={gym._id}>
              <Text variant="subtitle">{gym.name}</Text>
              <Text tone="muted">{gym.address}</Text>
              <Text variant="caption" tone="action">
                Benchmarks are scoped to this location.
              </Text>
            </Card>
          ))
      ) : (
        <EmptyState
          title="No active gyms"
          body="Add the place where this workout context happens."
        />
      )}
    </Screen>
  );
}
