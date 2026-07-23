import { Button, Card, Screen, Text } from "@/components/primitives";
import { brand } from "@/config/brand";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

export default function Welcome() {
  const { t } = useTranslation();
  return (
    <Screen>
      <Text variant="display">{brand.appName}</Text>
      <Text variant="title">{t("welcomeTitle")}</Text>
      <Text tone="muted">{t("welcomeBody")}</Text>
      <Card>
        <Text variant="subtitle">{t("brandTagline")}</Text>
        <Text tone="muted">
          Technical, spacious training views with same-gym reference points.
        </Text>
      </Card>
      <Button
        label={t("signIn")}
        onPress={() => router.push("/(auth)/sign-in")}
      />
      <Button
        label={t("signUp")}
        variant="secondary"
        onPress={() => router.push("/(auth)/sign-up")}
      />
    </Screen>
  );
}
