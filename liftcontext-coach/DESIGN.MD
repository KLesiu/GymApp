# LiftContext Coach Design System

LiftContext Coach shares the **Nordic Coach** visual identity defined in [mobile/DESIGN.MD](../mobile/DESIGN.MD) and adapts it to desktop workflows. The previous teal/yellow palette is superseded by the blue palette in that document. This is the target design specification; updating this file does not mean the UI has already been migrated.

The panel remains English-only under its existing scope. Polish mobile screen labels do not independently authorize full panel localization. The supplied 36-screen atlas describes the trainee mobile app, so desktop layouts still follow this document and the relevant feature issues.

## Reference assets for the implementing agent

The author states that the complete mobile design is available at:

```text
C:\Users\kubax\Desktop\Inżynierka\Inżynierka Design
```

Use the asset list and conflict resolutions in the mobile design specification. This is a local Windows path, not a runtime asset URL. A remote environment requires a supplied copy of the files; do not claim access to a directory that is not mounted.

## Brand and shared tokens

- Product: LiftContext.
- App: LiftContext Coach.
- Description: Coach panel.
- Motto: Compare results in the right context.
- Style: cool light backgrounds, blue cards, dark navy text, saturated blue actions, restrained rounded surfaces and consistent outline icons.

The normative color values, typography and state semantics are maintained in **mobile/DESIGN.MD §3–5**. Use those values rather than keeping a second independent palette here. Primary action: `#0057E8`; canvas: `#F8FBFE`; white surface: `#FFFFFF`; pale blue surface: `#E6F3FF`; main text: `#0B1224`; success: `#047857` on `#DDF6EB`. These are normalized implementation tokens based on raster references, not original source design tokens recovered from PNG.

Use white text on the primary action, dark text on pale blue benchmark cards, and text plus icons for state. Light decorative borders must not be the only visible boundary of a control. Follow the contrast and focus requirements in the shared specification.

Sora is retained for headings and large metrics. Inter is retained for body text, forms, tables and navigation, with a system sans-serif fallback. This is an existing implementation decision rather than a font identification from the supplied screenshots.

## Desktop rules

- Prioritize readable data cards and tables; do not stretch a phone mockup across the desktop.
- Keep shadows minimal; hierarchy comes from spacing, border, surface and typography.
- Every chart has units, a text summary and data consistent with its accompanying table.
- Keyboard focus, labels, error messages and selected states must be visible and understandable.
- Respect reduced motion; small screens use controlled horizontal scrolling or stacked cards.
- Preserve the selected trainee identity across profile, history, measurements, plans, reports and diet.
- Active collaboration is required for authorized trainee data. Ending a relationship removes access and stale cached data according to the API contract.
- Report editors support versioned TEXT/NUMBER/SCALE/CHOICE fields. The three fields on mobile screen 32 are an example, not a fixed template.
- Diet belongs to approved D07 (#35). Public ranking, private notes/goals, photos and other optional modules still require their recorded scope decision.

## Components

The UI layer exposes `LcButton`, `LcInput`, `LcTextarea`, `LcSelect`, `LcCard`, `LcBadge`, `LcDialog`, `LcToast`, `LcEmptyState`, `LcErrorState`, `LcSkeleton`, `LcDataTable`, `LcMetric`, `LcTrend`, `LcBenchmarkCard`, `LcAppShell`, and `LcLogo`. These components do not depend on API DTOs.

Align their visual tokens with Nordic Coach as part of the related panel work (#17–#21 and #35). Preserve desktop-specific layouts, permissions and versioning. Verify loading, empty, error, disabled, saving and success states; attach real screenshots and behavioral evidence to implementation PRs. Final UX/platform acceptance is tracked in #22.
