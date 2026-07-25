# QA checklist

- App starts without legacy brand residue.
- Register, login, restore session, and logout work.
- 401 clears session; 403 shows permission state without clearing token.
- Gym CRUD uses active gyms and preserves archived context in history.
- Create custom exercise and plan.
- Start workout draft, edit set values, show saved/error/finalizing states.
- Same-gym benchmark appears; different-gym benchmark does not.
- Finalization retries reuse one stable Idempotency-Key.
- Elo, history, ranking, and dashboard queries refresh after finalization.
- Measurement creation and trend text fallback work.
- Coach/report screens refresh on focus and can be extended without realtime dependencies.
- English-only strings and date/number formatting verified.
- Loading, empty, error, and retry states present on core screens.
- Android export and Expo Doctor pass.
