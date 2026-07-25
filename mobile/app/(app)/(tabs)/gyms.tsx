import {
  type Gym,
  useCreateGym,
  useDeleteGym,
  useGyms,
  useUpdateGym,
} from "@/api/domain";
import {
  Button,
  Card,
  Dialog,
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
  const update = useUpdateGym();
  const remove = useDeleteGym();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [deletingGym, setDeletingGym] = useState<Gym | null>(null);
  const activeGyms = gyms.data?.filter((gym) => !gym.deletedAt) ?? [];
  const canSave = name.trim().length > 0 && address.trim().length > 0;
  const modalOpen = isCreateOpen || editingGym !== null;
  const saving = create.isPending || update.isPending;

  const closeCreate = () => {
    setIsCreateOpen(false);
    setEditingGym(null);
    setName("");
    setAddress("");
  };

  const openCreate = () => {
    setEditingGym(null);
    setName("");
    setAddress("");
    setIsCreateOpen(true);
  };

  const openEdit = (gym: Gym) => {
    setIsCreateOpen(false);
    setEditingGym(gym);
    setName(gym.name);
    setAddress(gym.address);
  };

  const saveGym = () => {
    const body = { name: name.trim(), address: address.trim() };
    const options = { onSuccess: closeCreate };

    if (editingGym) {
      update.mutate({ gymId: editingGym._id, body }, options);
      return;
    }

    create.mutate(body, options);
  };

  const deleteGym = () => {
    if (!deletingGym) return;
    remove.mutate(deletingGym._id, { onSuccess: () => setDeletingGym(null) });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="title">Gyms</Text>
          <Text tone="muted">
            {activeGyms.length === 1
              ? "1 active location"
              : `${activeGyms.length} active locations`}
          </Text>
        </View>
        <IconButton name="add" label="Create gym" onPress={openCreate} />
      </View>

      {activeGyms.length ? (
        activeGyms.map((gym) => (
          <Card key={gym._id}>
            <Text variant="subtitle">{gym.name}</Text>
            <Text tone="muted">{gym.address}</Text>
            <Text variant="caption" tone="action">
              Benchmarks are scoped to this location.
            </Text>
            <View style={styles.actionRow}>
              <Button
                label="Edit"
                variant="secondary"
                onPress={() => openEdit(gym)}
              />
              <Button
                label="Delete"
                variant="danger"
                onPress={() => setDeletingGym(gym)}
              />
            </View>
          </Card>
        ))
      ) : (
        <EmptyState
          title="No active gyms"
          body="Add the place where this workout context happens with the plus button."
        />
      )}

      <Modal transparent visible={modalOpen} animationType="fade">
        <View style={styles.backdrop}>
          <Card style={styles.modalCard}>
            <Text variant="subtitle">
              {editingGym ? "Edit location" : "New location"}
            </Text>
            <TextField label="Name" value={name} onChangeText={setName} />
            <TextField
              label="Address"
              value={address}
              onChangeText={setAddress}
            />
            <Button
              label={
                saving ? "Saving..." : editingGym ? "Save changes" : "Save gym"
              }
              disabled={saving || !canSave}
              onPress={saveGym}
            />
            <Button label="Cancel" variant="ghost" onPress={closeCreate} />
          </Card>
        </View>
      </Modal>
      <Dialog
        visible={deletingGym !== null}
        title="Delete gym?"
        body={
          deletingGym
            ? `Remove ${deletingGym.name} from your active gyms?`
            : "Remove this gym?"
        }
        confirmLabel={remove.isPending ? "Deleting..." : "Delete"}
        onConfirm={deleteGym}
        onCancel={() => setDeletingGym(null)}
      />
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
  actionRow: { flexDirection: "row", gap: theme.space.sm },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: theme.space.screen,
    backgroundColor: "rgba(29,34,37,0.35)",
  },
  modalCard: { maxHeight: "90%" },
});
