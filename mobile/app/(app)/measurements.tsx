import {
  useCreateMeasurement,
  useMeasurementTrends,
  useMeasurements,
} from "@/api/domain";
import {
  Button,
  Card,
  EmptyState,
  IconButton,
  Screen,
  Text,
  TextField,
} from "@/components/primitives";
import { formatDate, formatNumber } from "@/i18n";
import { theme } from "@/theme/tokens";
import { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";

export default function Measurements() {
  const [value, setValue] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const list = useMeasurements("WEIGHT");
  const trend = useMeasurementTrends("WEIGHT");
  const create = useCreateMeasurement();
  const parsedValue = Number(value.replace(",", "."));
  const canSave = Number.isFinite(parsedValue) && parsedValue > 0;

  const closeCreate = () => {
    setIsCreateOpen(false);
  };

  const createMeasurement = () => {
    create.mutate(
      {
        bodyPart: "WEIGHT",
        unit: "KG",
        value: parsedValue,
        takenAt: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          setValue("");
          setIsCreateOpen(false);
        },
      },
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text variant="title">Body tracker</Text>
          <Text tone="muted">
            {trend.data?.length ?? 0} chronological weight points
          </Text>
        </View>
        <IconButton
          name="add"
          label="Add measurement"
          onPress={() => setIsCreateOpen(true)}
        />
      </View>

      {list.data?.length ? (
        list.data.map((measurement) => (
          <Card key={measurement._id}>
            <Text variant="subtitle">
              {formatNumber(Number(measurement.value))} {measurement.unit}
            </Text>
            <Text tone="muted">{formatDate(measurement.takenAt)}</Text>
          </Card>
        ))
      ) : (
        <EmptyState
          title="No measurements yet"
          body="Add your first weight measurement with the plus button."
        />
      )}

      <Modal transparent visible={isCreateOpen} animationType="fade">
        <View style={styles.backdrop}>
          <Card style={styles.modalCard}>
            <Text variant="subtitle">Latest weight</Text>
            <TextField
              label="Value kg"
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
            />
            <Button
              label={create.isPending ? "Adding..." : "Add measurement"}
              disabled={create.isPending || !canSave}
              onPress={createMeasurement}
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
