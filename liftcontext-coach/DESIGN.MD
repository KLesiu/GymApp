# LiftContext Coach Design System

LiftContext Coach uses the shared LiftContext identity from Mobile and extends it for desktop analytics. The UI is English-only, technical, light, and data-first.

## Brand

- Product: LiftContext
- App: LiftContext Coach
- Description: Coach panel
- Motto: Compare results in the right context.

## Colors

```ts
export const colors = {
  canvas: '#FAFAF7', surface: '#FFFFFF', surfaceMuted: '#F1F3F2', ink: '#1D2225', textMuted: '#667176', border: '#D9DEDC', context: '#15988F', contextDark: '#0F6F69', reference: '#FFC928', success: '#248A5B', warning: '#B77900', danger: '#D64343', info: '#2563EB',
} as const
```

Use white text only on `contextDark`, never on `reference`. State is always communicated with text in addition to color.

## Typography

Sora is used for headings and large metrics. Inter is used for body text, forms, tables, and navigation, with system sans-serif fallback.

## Desktop rules

- Prioritize dense but readable data cards and tables.
- Keep shadows minimal; hierarchy comes from spacing, border, and surface.
- Every chart has a text summary.
- Keyboard focus must be visible.
- Respect `prefers-reduced-motion`.
- Small screens use controlled horizontal scroll or stacked cards.

## Components

The UI layer exposes `LcButton`, `LcInput`, `LcTextarea`, `LcSelect`, `LcCard`, `LcBadge`, `LcDialog`, `LcToast`, `LcEmptyState`, `LcErrorState`, `LcSkeleton`, `LcDataTable`, `LcMetric`, `LcTrend`, `LcBenchmarkCard`, `LcAppShell`, and `LcLogo`. These components do not depend on API DTOs.
