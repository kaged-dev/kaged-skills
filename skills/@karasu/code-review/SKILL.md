---
description: "Systematic code review methodology for correctness, security, and style."
---

# code-review

A skill that teaches agents to review code the way a careful engineer does: against the project's own specs and conventions, not personal preference.

## When to use

Activate this skill before submitting a pull request, or when asked to review someone else's changes. It ensures the agent:

1. Reads the spec before reading the diff.
2. Checks for the eight correctness categories in the checklist.
3. Runs the test suite and confirms all tests pass.
4. Verifies documentation stays in sync with the change.

## What it does

- Reads `checklist.md` from this skill directory.
- Applies each checklist item to the diff under review.
- Produces a structured review comment with sections for blocking issues, suggestions, and questions.
- Never approves a change with failing tests or missing spec updates.

## Files

- `SKILL.md` — this file (activation instructions).
- `checklist.md` — the eight-category review checklist.
