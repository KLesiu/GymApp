import {
  useCreateMeasurement,
  useMeasurementTrends,
  useMeasurements,
} from "@/api/domain";
import {
  Button,
  Card,
  ChartCard,
  Screen,
  Text,
  TextField,
} from "@/components/primitives";
import { formatDate, formatNumber } from "@/i18n";
import { useState } from "react";

export default function Measurements() {
  const [value, setValue] = useState("");
  const list = useMeasurements("WEIGHT");
  const trend = useMeasurementTrends("WEIGHT");
  const create = useCreateMeasurement();

  return (
    <Screen title="Body tracker">
      <Card>
        <Text variant="subtitle">Latest weight</Text>
        <TextField
          label="Value kg"
          value={value}
          onChangeText={setValue}
          keyboardType="numeric"
        />
        <Button
          label="Add measurement"
          onPress={() =>
            create.mutate({
              bodyPart: "WEIGHT",
              unit: "KG",
              value: Number(value),
              takenAt: new Date().toISOString(),
            })
          }
        />
      </Card>
      <ChartCard
        title="Weight trend"
        summary={`${trend.data?.length ?? 0} chronological points with text fallback.`}
      />
      {list.data?.map((measurement) => (
        <Card key={measurement._id}>
          <Text>
            {formatNumber(Number(measurement.value))} {measurement.unit}
          </Text>
          <Text tone="muted">{formatDate(measurement.takenAt)}</Text>
        </Card>
      ))}
    </Screen>
  );
}
