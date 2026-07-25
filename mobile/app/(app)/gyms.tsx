import { useCreateGym, useGyms } from "@/api/domain";
import {
  Button,
  Card,
  EmptyState,
  IconButton,
  Screen,
  Text,
  TextField,
} from "@/components/primitives";
import { theme } from "@/theme/tokens";
import { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";

export default function Gyms() {
  const gyms = useGyms();
  const create = useCreateGym();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const activeGyms = gyms.data?.filter((gym) => !gym.deletedAt) ?? [];
  const canSave = name.trim().length > 0 && address.trim().length > 0;

  const closeCreate = () => {
    setIsCreateOpen(false);
  };

  const createGym = () => {
    create.mutate(
      { name: name.trim(), address: address.trim() },
      {
        onSuccess: () => {
          setName("");
          setAddress("");
          setIsCreateOpen(false);
        },
      },
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="title">Gyms</Text>
          <Text tone="muted">
            {activeGyms.length === 1 ? "1 active location" : `${activeGyms.length} active locations`}
          </Text>
        </View>
        <IconButton name="add" label="Create gym" onPress={() => setIsCreateOpen(true)} />
      </View>

      {activeGyms.length ? (
        activeGyms.map((gym) => (
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
          body="Add the place where this workout context happens with the plus button."
        />
      )}

      <Modal transparent visible={isCreateOpen} animationType="fade">
        <View style={styles.backdrop}>
          <Card style={styles.modalCard}>
            <Text variant="subtitle">New location</Text>
            <TextField label="Name" value={name} onChangeText={setName} />
            <TextField label="Address" value={address} onChangeText={setAddress} />
            <Button
              label={create.isPending ? "Saving..." : "Save gym"}
              disabled={create.isPending || !canSave}
              onPress={createGym}
            />
            <Button label="Cancel" variant="ghost" onPress={closeCreate} />
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space.md,
  },
  headerText: { flex: 1, gap: theme.space.xs },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: theme.space.screen,
    backgroundColor: "rgba(29,34,37,0.35)",
  },
  modalCard: { maxHeight: "90%" },
});
