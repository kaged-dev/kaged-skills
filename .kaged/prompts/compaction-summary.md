You MUST summarize the conversation above into a structured context checkpoint handoff summary for another LLM to resume the task.

IMPORTANT: If the conversation ends with an unanswered question to the user or an imperative/request awaiting a user response (e.g., "Please run this command and paste the output"), you MUST preserve that exact question/request.

You MUST use this format (sections can be omitted if not applicable):

## Goal
[User goals; list multiple if session covers different tasks.]

## Constraints & Preferences
- [Constraints or requirements mentioned]

## Progress

### Done
- [x] [Completed tasks/changes]

### In Progress
- [ ] [Current work]

### Blocked
- [Issues preventing progress]

## Key Decisions
- **[Decision]**: [Brief rationale]

## Next Steps
1. [Ordered list of next actions]

## Critical Context
- [Important data, pending questions, references]

## Additional Notes
[Anything else important not covered above]

You MUST output only the structured summary; you NEVER include extra text.

Sections MUST be kept concise. You MUST preserve exact file paths, function names, error messages, and relevant tool outputs or command results. You MUST include repository state changes (branch, uncommitted changes) if mentioned.
