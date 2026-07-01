---
description: "Step-by-step deployment runbook for cutting releases without improvising."
---

# deploy-runbook

A skill that turns the release procedure into a checklist the agent follows step by step. Prevents partial releases and skipped steps.

## When to use

Activate when the operator says "release", "cut a release", "publish", or similar. The skill enforces the fixed procedure.

## What it does

1. Bumps the version in `package.json` (the only place the version lives).
2. Writes the per-version changelog at `releases/vX.Y.Z.md`.
3. Runs the release script (`prepare_release.sh` or equivalent).
4. Confirms the tag was created.
5. Stops before pushing — the operator pushes the tag explicitly.

## Rules

- Never improvise a partial release. If any step fails, stop and report.
- Never commit binaries.
- The changelog must cover the full operator-facing delta since the previous tag, not just the latest commit.
- Pre-existing failures in unrelated packages must be fixed, not skipped.
