# LiftContext migration

## Identifier changes

| Old value | New value |
| --- | --- |
| `PulsePath` | `LiftContext` |
| `performance-journal-mobile` | `liftcontext-mobile` |
| `pulsepath-mobile` | `liftcontext-mobile` |
| `pulsepath` | `liftcontext` |
| `dev.placeholder.pulsepath` | `pl.jakubleskiewicz.liftcontext` |
| `pulsepath-session` | `liftcontext-session` |

Changing the SecureStore persistence key intentionally signs users out in this academic build. No production session migration is required because the app has not been released under the previous identifier.

## Manual repository step

The active workspace was not renamed while it was open. Rename the project folder manually after closing tools that hold file handles:

```bash
mv GymApp liftcontext-mobile
```

Do not rename the GitHub remote repository without explicit owner approval.
