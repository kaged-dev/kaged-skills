# Code Review Checklist

## 1. Correctness

- [ ] Does the code do what the spec says it should?
- [ ] Are edge cases handled (empty input, null, overflow)?
- [ ] Are error paths covered?

## 2. Security

- [ ] No untrusted input reaches a sink without validation.
- [ ] No secrets in code or logs.
- [ ] Auth checks present where required.

## 3. Tests

- [ ] New tests exist for new behavior.
- [ ] Existing tests still pass.
- [ ] Test names describe the behaviour, not the implementation.

## 4. Types

- [ ] No `as any`, `@ts-ignore`, or equivalent escape hatches.
- [ ] Strict types where the project mandates them.

## 5. Documentation

- [ ] Public API changes have updated docs.
- [ ] Spec amended if behavior changed (doc-first rule).
- [ ] STATUS.md updated if package status changed.

## 6. Performance

- [ ] No obvious O(n²) in hot paths.
- [ ] No unnecessary allocations in tight loops.

## 7. Dependencies

- [ ] No new dependencies without justification.
- [ ] Bun built-ins preferred per project convention.

## 8. Style

- [ ] Matches existing code patterns in the file/module.
- [ ] Naming is consistent with the codebase.
