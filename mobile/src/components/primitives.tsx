import { theme } from "@/theme/tokens";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text as RNText,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Tone = "default" | "muted" | "danger" | "action" | "success" | "trend";
const toneColor = (tone: Tone) =>
  ({
    default: theme.colors.text,
    muted: theme.colors.textMuted,
    danger: theme.colors.danger,
    action: theme.colors.action,
    success: theme.colors.success,
    trend: theme.colors.trend,
  })[tone];

export const Screen = ({
  children,
  scroll = true,
  title,
  style,
  backgroundColor,
}: {
  children: ReactNode;
  scroll?: boolean;
  title?: string;
  style?: object | undefined;
  backgroundColor?: string;
}) => {
  const body = (
    <View style={[styles.screenBody, style]}>
      {title ? <Text variant="title">{title}</Text> : null}
      {children}
    </View>
  );
  return (
    <SafeAreaView
      style={[styles.safe, backgroundColor ? { backgroundColor } : undefined]}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          style={backgroundColor ? { backgroundColor } : undefined}
        >
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
};
export const Text = ({
  children,
  variant = "body",
  tone = "default",
  style,
}: {
  children: ReactNode;
  variant?: keyof typeof theme.typography;
  tone?: Tone;
  style?: object | undefined;
}) => (
  <RNText
    style={[theme.typography[variant], { color: toneColor(tone) }, style]}
  >
    {children}
  </RNText>
);
export const AppText = Text;
export const Button = ({
  label,
  onPress,
  disabled,
  variant = "primary",
}: {
  label: string;
  onPress?: (() => void) | undefined;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.button,
      variant === "primary"
        ? styles.primary
        : variant === "secondary"
          ? styles.secondary
          : variant === "danger"
            ? styles.danger
            : styles.ghost,
      disabled && styles.disabled,
      pressed && !disabled && styles.pressed,
    ]}
  >
    <Text
      style={
        variant === "primary"
          ? styles.primaryText
          : variant === "danger"
            ? styles.dangerText
            : undefined
      }
    >
      {label}
    </Text>
  </Pressable>
);
export const IconButton = ({
  name,
  label,
  onPress,
  disabled,
}: {
  name: ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress?: (() => void) | undefined;
  disabled?: boolean;
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={label}
    disabled={disabled}
    onPress={onPress}
    style={[styles.icon, disabled && styles.disabled]}
  >
    <Ionicons name={name} size={22} color={theme.colors.text} />
  </Pressable>
);
export const TextField = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  style,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  style?: object | undefined;
}) => (
  <View style={[styles.field, style]}>
    <Text variant="caption" tone="muted">
      {label}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      placeholderTextColor={theme.colors.textMuted}
      style={styles.input}
    />
  </View>
);
export const Card = ({
  children,
  style,
}: { children: ReactNode; style?: object | undefined }) => (
  <View style={[styles.card, style]}>{children}</View>
);
export const Sheet = Card;
export const Dialog = ({
  visible,
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.backdrop}>
      <Card>
        <Text variant="subtitle">{title}</Text>
        <Text tone="muted">{body}</Text>
        <Button label={confirmLabel} variant="danger" onPress={onConfirm} />
        <Button label="Cancel" variant="ghost" onPress={onCancel} />
      </Card>
    </View>
  </Modal>
);
export const EmptyState = ({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: (() => void) | undefined;
}) => (
  <Card>
    <Text variant="subtitle">{title}</Text>
    <Text tone="muted">{body}</Text>
    {actionLabel ? (
      <Button label={actionLabel} variant="secondary" onPress={onAction} />
    ) : null}
  </Card>
);
export const ErrorState = ({
  message,
  onRetry,
}: { message: string; onRetry?: (() => void) | undefined }) => (
  <Card>
    <Text variant="subtitle" tone="danger">
      Something needs attention
    </Text>
    <Text tone="muted">{message}</Text>
    {onRetry ? (
      <Button label="Try again" variant="secondary" onPress={onRetry} />
    ) : null}
  </Card>
);
export const Skeleton = () => (
  <View style={styles.skeleton}>
    <ActivityIndicator color={theme.colors.action} />
  </View>
);
export const Metric = ({
  label,
  value,
  delta,
}: { label: string; value: string | number; delta?: string | undefined }) => (
  <Card style={styles.metric}>
    <Text variant="caption" tone="muted">
      {label}
    </Text>
    <Text variant="metric">{value}</Text>
    {delta ? (
      <Text
        variant="caption"
        tone={delta.startsWith("-") ? "trend" : "success"}
      >
        {delta}
      </Text>
    ) : null}
  </Card>
);
export const BenchmarkCard = ({
  gymName,
  previousDate,
  weight,
  reps,
  series,
  onUseValue,
}: {
  gymName?: string | undefined;
  previousDate?: string | undefined;
  weight?: number | undefined;
  reps?: number | undefined;
  series?: number | undefined;
  onUseValue?: (() => void) | undefined;
}) => {
  const hasReference = weight !== undefined && reps !== undefined;
  return (
    <Card style={styles.benchmarkCard}>
      <View style={styles.benchmarkHeader}>
        <View style={styles.referenceDot} />
        <Text variant="label">Reference point</Text>
      </View>
      {hasReference ? (
        <>
          <Text variant="caption" tone="muted">
            {gymName ?? "This gym"} · {previousDate ?? "previous session"}
          </Text>
          <Text variant="metricLarge">
            {weight} kg × {reps}
          </Text>
          <Text variant="caption" tone="muted">
            Series {series ?? 1}
          </Text>
          {onUseValue ? (
            <Button
              label="Use value"
              variant="secondary"
              onPress={onUseValue}
            />
          ) : null}
        </>
      ) : (
        <Text tone="muted">You do not have a result for this gym yet.</Text>
      )}
    </Card>
  );
};
export const ChartCard = ({
  title,
  summary,
}: { title: string; summary: string }) => (
  <Card>
    <Text variant="subtitle">{title}</Text>
    <View style={styles.chart}>
      <Text tone="muted">Chart ready</Text>
    </View>
    <Text variant="caption" tone="muted">
      {summary}
    </Text>
  </Card>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1 },
  screenBody: {
    flex: 1,
    gap: theme.space.section,
    padding: theme.space.screen,
  },
  button: {
    minHeight: theme.control.height,
    minWidth: theme.control.minHitTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.pill,
    paddingHorizontal: theme.space.xl,
  },
  primary: { backgroundColor: theme.colors.action },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ghost: { backgroundColor: "transparent" },
  danger: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  primaryText: { color: theme.colors.actionText },
  dangerText: { color: theme.colors.danger },
  disabled: { opacity: 0.5 },
  pressed: { transform: [{ scale: 0.98 }] },
  icon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.surface,
  },
  field: { gap: theme.space.xs },
  input: {
    minHeight: theme.control.height,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.space.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    fontSize: 16,
  },
  card: {
    gap: theme.space.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: theme.space.md,
    backgroundColor: theme.colors.surface,
  },
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: theme.space.xl,
    backgroundColor: "rgba(29,34,37,0.35)",
  },
  skeleton: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfaceMuted,
  },
  metric: { flex: 1 },
  chart: {
    minHeight: 130,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.background,
  },
  benchmarkCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.reference,
  },
  benchmarkHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.space.xs,
  },
  referenceDot: {
    width: 12,
    height: 12,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.reference,
  },
});
