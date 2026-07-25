import { Text } from "@/components/primitives";
import { brand } from "@/config/brand";
import { theme } from "@/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export type ExerciseResultGroup = {
  readonly exerciseId: string;
  readonly exerciseName: string;
  readonly bodyPart?: string | null;
  readonly sets: {
    readonly id: string;
    readonly series: number;
    readonly reps: number | string;
    readonly weight: number | string;
    readonly unit: string;
  }[];
};

export const AppLogoMark = ({ size = 56 }: { readonly size?: number }) => (
  <View
    style={[
      styles.logoMark,
      { width: size, height: size, borderRadius: size * 0.22 },
    ]}
  >
    <View style={[styles.logoBracket, styles.logoBracketLeft]} />
    <View style={[styles.logoBracket, styles.logoBracketRight]} />
    <View style={styles.logoBar} />
    <View style={[styles.logoPlate, styles.logoPlateLeftOuter]} />
    <View style={[styles.logoPlate, styles.logoPlateLeftInner]} />
    <View style={[styles.logoPlate, styles.logoPlateRightInner]} />
    <View style={[styles.logoPlate, styles.logoPlateRightOuter]} />
    <View style={styles.logoDot} />
  </View>
);

type DateRailItem = {
  readonly date: Date;
  readonly selected?: boolean;
  readonly hasWorkout?: boolean;
};

export const buildDateRail = (anchor = new Date()): DateRailItem[] =>
  [-1, 0, 1].map((offset) => {
    const date = new Date(anchor);
    date.setDate(anchor.getDate() + offset);
    return { date, selected: offset === 0 };
  });

export const TrainingHeader = ({
  eyebrow = brand.appName,
  title = "Welcome",
  name = "Athlete",
}: {
  readonly eyebrow?: string;
  readonly title?: string;
  readonly name?: string;
}) => (
  <View style={styles.header}>
    <AppLogoMark size={44} />
    <Text variant="subtitle" style={styles.brandText}>
      {eyebrow}
    </Text>
    <View style={styles.welcomeBlock}>
      <Text variant="caption" tone="muted">
        {title},
      </Text>
      <Text variant="caption" tone="action" style={styles.userName}>
        {name}
      </Text>
    </View>
  </View>
);

export const DateRail = ({
  dates = buildDateRail(),
  onPrevious,
  onNext,
  onSelectDate,
}: {
  readonly dates?: readonly DateRailItem[];
  readonly onPrevious?: () => void;
  readonly onNext?: () => void;
  readonly onSelectDate?: (date: Date) => void;
}) => {
  const currentMonth =
    dates.find((item) => item.selected)?.date ?? dates[1]?.date ?? new Date();
  return (
    <View
      style={styles.dateRailWrap}
      onTouchStart={(event) => {
        touchStartX = event.nativeEvent.pageX;
      }}
      onTouchEnd={(event) => {
        const distance = event.nativeEvent.pageX - touchStartX;
        if (distance > 40) onPrevious?.();
        if (distance < -40) onNext?.();
      }}
    >
      <Text variant="title" style={styles.monthTitle}>
        {currentMonth.toLocaleDateString("en", {
          month: "long",
          year: "numeric",
        })}
      </Text>
      <View style={styles.dateRail}>
        <RailButton
          name="chevron-back"
          {...(onPrevious ? { onPress: onPrevious } : {})}
        />
        {dates.map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item.date.toISOString()}
            onPress={() => onSelectDate?.(item.date)}
            style={[styles.dateCell, item.selected && styles.dateCellSelected]}
          >
            <Text
              variant="caption"
              tone={item.selected ? "default" : "muted"}
              style={styles.weekday}
            >
              {item.date
                .toLocaleDateString("en", { weekday: "short" })
                .toUpperCase()}
            </Text>
            <Text
              variant="heading2"
              style={item.selected ? styles.selectedDateText : undefined}
            >
              {item.date.getDate()}
            </Text>
            {item.hasWorkout ? <View style={styles.dateDot} /> : null}
          </Pressable>
        ))}
        <RailButton
          name="chevron-forward"
          {...(onNext ? { onPress: onNext } : {})}
        />
      </View>
    </View>
  );
};

let touchStartX = 0;

const RailButton = ({
  name,
  onPress,
}: {
  readonly name: ComponentProps<typeof Ionicons>["name"];
  readonly onPress?: () => void;
}) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={styles.railButton}
  >
    <Ionicons name={name} size={24} color={theme.colors.actionText} />
  </Pressable>
);

export const TrainingSectionTitle = ({
  title,
  gym,
}: { readonly title: string; readonly gym?: string | null }) => (
  <View style={styles.trainingTitle}>
    <Text variant="heading1" tone="action">
      {title}
    </Text>
    <View style={styles.gymRow}>
      <Ionicons name="location" size={18} color={theme.colors.text} />
      <Text>{gym ?? "No gym selected"}</Text>
    </View>
  </View>
);

export const ExerciseResultCard = ({
  title,
  subtitle,
  children,
}: {
  readonly title: string;
  readonly subtitle?: string;
  readonly children: ReactNode;
}) => (
  <View style={styles.exerciseCard}>
    <Text variant="heading1" style={styles.exerciseTitle}>
      {subtitle ? `${title}: ${subtitle}` : title}
    </Text>
    <View style={styles.divider} />
    {children}
  </View>
);

export const ResultRow = ({
  label,
  value,
}: { readonly label: string; readonly value: string }) => (
  <View style={styles.resultRow}>
    <Text>{label}</Text>
    <Text>{value}</Text>
  </View>
);

export const FloatingMenuButton = ({
  onPress,
}: { readonly onPress?: () => void }) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={styles.floatingButton}
  >
    <Ionicons name="menu" size={38} color={theme.colors.actionText} />
  </Pressable>
);

export const groupExerciseResults = <
  T extends {
    readonly _id?: string;
    readonly id?: string;
    readonly exerciseId: string;
    readonly exerciseName: string;
    readonly series: number;
    readonly reps: number | string | null;
    readonly weight: number | string | null;
    readonly unit: string;
  },
>(
  sets: readonly T[],
): ExerciseResultGroup[] => {
  const grouped = new Map<string, ExerciseResultGroup>();

  for (const set of sets) {
    if (set.reps === null || set.weight === null) {
      continue;
    }

    const current = grouped.get(set.exerciseId);
    const row = {
      id: set.id ?? set._id ?? `${set.exerciseId}:${set.series}`,
      series: set.series,
      reps: set.reps,
      weight: set.weight,
      unit: set.unit,
    };

    if (current) {
      current.sets.push(row);
    } else {
      grouped.set(set.exerciseId, {
        exerciseId: set.exerciseId,
        exerciseName: set.exerciseName,
        sets: [row],
      });
    }
  }

  return Array.from(grouped.values());
};

const styles = StyleSheet.create({
  logoMark: {
    backgroundColor: theme.colors.canvas,
    overflow: "hidden",
  },
  logoBracket: {
    position: "absolute",
    top: "20%",
    width: "22%",
    height: "62%",
    borderColor: theme.colors.context,
  },
  logoBracketLeft: {
    left: "14%",
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  logoBracketRight: {
    right: "14%",
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  logoBar: {
    position: "absolute",
    top: "47%",
    left: "27%",
    right: "27%",
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.ink,
  },
  logoPlate: {
    position: "absolute",
    top: "35%",
    width: 5,
    height: "30%",
    borderRadius: 2,
    backgroundColor: theme.colors.ink,
  },
  logoPlateLeftOuter: { left: "25%" },
  logoPlateLeftInner: { left: "36%" },
  logoPlateRightInner: { right: "36%" },
  logoPlateRightOuter: { right: "25%" },
  logoDot: {
    position: "absolute",
    top: "43%",
    left: "44%",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.reference,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.sm,
  },
  brandText: { flex: 1 },
  welcomeBlock: { alignItems: "flex-end", gap: theme.space.xxs },
  userName: { letterSpacing: 1 },
  dateRailWrap: { gap: theme.space.md },
  monthTitle: { textAlign: "center" },
  dateRail: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.space.xs,
  },
  railButton: {
    width: 40,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.action,
  },
  dateCell: {
    flex: 1,
    minWidth: 0,
    minHeight: 86,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.space.xxs,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceMuted,
  },
  dateCellSelected: { backgroundColor: theme.colors.action },
  weekday: { letterSpacing: 1 },
  selectedDateText: { color: theme.colors.actionText },
  dateDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.action,
  },
  trainingTitle: { gap: theme.space.xs },
  gymRow: { flexDirection: "row", alignItems: "center", gap: theme.space.xs },
  exerciseCard: {
    gap: theme.space.sm,
    borderRadius: theme.radii.lg,
    padding: theme.space.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  exerciseTitle: { letterSpacing: -0.5 },
  divider: { height: 1, backgroundColor: theme.colors.border },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  floatingButton: {
    alignSelf: "center",
    width: 86,
    height: 86,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 43,
    backgroundColor: theme.colors.action,
    marginTop: -theme.space.xs,
    marginBottom: theme.space.md,
  },
});
