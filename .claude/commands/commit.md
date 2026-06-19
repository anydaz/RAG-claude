Generate a semantic commit message for the staged changes and commit after confirmation.

## Steps

1. Run `git diff --staged` to inspect what is staged.
2. Run `git log --oneline -5` to check the recent commit style in this repo.
3. If nothing is staged, tell the user and stop.
4. Analyse the diff and pick the right **type** from this list:

   | Type       | When to use                                              |
   |------------|----------------------------------------------------------|
   | `feat`     | New feature or capability                                |
   | `fix`      | Bug fix                                                  |
   | `docs`     | Documentation only                                       |
   | `style`    | Formatting, whitespace — no logic change                 |
   | `refactor` | Code restructure with no feature or bug change           |
   | `test`     | Adding or updating tests                                 |
   | `chore`    | Build scripts, dependencies, config, tooling             |
   | `perf`     | Performance improvement                                  |

5. Determine an optional **scope** — the module, folder, or area changed (e.g. `backend`, `ui`, `agent`, `auth`). Omit if the change is truly cross-cutting.

6. Write a **subject** line: imperative mood, ≤72 chars, no trailing period.

7. If the diff warrants it, write a short **body** (one blank line after the subject) explaining *why*, not *what*.

8. Format:
   ```
   type(scope): subject

   Optional body — why this change was made.
   ```

9. Present the proposed message to the user clearly and ask: **"Commit with this message? (yes / edit / cancel)"**

10. Based on the response:
    - **yes** — run `git commit -m "<message>"` exactly as proposed.
    - **edit** — ask the user for the revised message, then commit with that.
    - **cancel** — do nothing, tell the user no commit was made.
