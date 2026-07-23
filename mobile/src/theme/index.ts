import { colors } from "./colors";
import { radii } from "./radii";
import { spacing } from "./spacing";
import { typography } from "./typography";

export { colors, radii, spacing, typography };

export const theme = {
  colors: {
    ...colors,
    background: colors.canvas,
    text: colors.ink,
    action: colors.contextDark,
    actionText: colors.surface,
    trend: colors.reference,
  },
  space: spacing,
  radii,
  typography,
  control: { height: 52, minHitTarget: 44 },
} as const;
