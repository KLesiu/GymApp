# Reference Audit

Reference repository: `https://github.com/KLesiu/LGYM-APP-PAGE`, commit `917711fea3192c0d07624518544a03acd8777815`.

This repository was used only to understand trainer workflow shape. No source code, DOM structure, styles, copy, assets, DTOs, or legacy integrations were copied.

## Preserve

- Dedicated trainer workspace with nested management routes.
- Trainee list to active relationship detail handoff.
- Route-driven trainee detail tabs.
- Plan/day workspace concept.
- Report template, assignment, submission, and feedback lifecycle.
- Recurring report rule pause/resume lifecycle.
- Exercise library as a first-class coach area.

## Adapt

- Use LiftContext Coach naming and English copy.
- Use current OpenAPI endpoints and generated types only.
- Use table/card management screens with loading, empty, error, and destructive confirmation states.

## Omit

- Legacy branding, visual design, assets, and route names.
- Admin/user management flows.
- Old Google OAuth, realtime, upload, Firebase, and cloud integrations.
- Old backend DTOs and generated API modules.
