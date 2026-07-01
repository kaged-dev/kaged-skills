# kaged-skills

> Public registry of [kaged](https://kaged.dev) skills. Publishes `https://skills.kaged.dev`.

A skill is a reusable instruction set that an agent loads on demand. This repo is the canonical, git-based registry where operators discover and import skills. It is a sibling to the [kaged monorepo](https://github.com/kaged-dev/monorepo) — different lifecycle (community-contributed vs. code commits), separate CI.

## What this repo does

1. Holds skill directories under `skills/@<namespace>/<skill-name>/`.
2. Each skill has a `manifest.json` (Zod-validated) and a `SKILL.md`.
3. CI validates every PR: manifest schema, file existence, frontmatter, directory naming.
4. On merge to `main`, CI rebuilds `registry.json` + the static site and deploys to `skills.kaged.dev`.

## Skill structure

```
skills/@<namespace>/<skill-name>/
├── manifest.json          # required — schema-validated metadata
├── SKILL.md               # required — frontmatter + instructions
├── checklist.md           # optional — supporting resource
└── examples/              # optional — example files
    └── good-pr.md
```

### manifest.json

```json
{
  "name": "code-review",
  "namespace": "@karasu",
  "version": "1.0.0",
  "description": "Systematic code review methodology for correctness, security, and style.",
  "category": "code-quality",
  "tags": ["review", "security", "best-practices"],
  "files": ["SKILL.md", "checklist.md"],
  "kaged_version": ">=0.4.0",
  "license": "MIT"
}
```

- **`files`** is an explicit allowlist. Files in the directory but NOT in `manifest.json` are not published.
- **`kaged_version`** is a semver constraint checked at import time.
- **`version`** enables update detection.

### SKILL.md frontmatter

```markdown
---
description: "Systematic code review methodology for correctness, security, and style."
---
```

The `description` must be present and ≤280 characters.

## Namespacing

Skills are namespaced by submitter identity: `@<namespace>/<skill-name>`.

- Namespace = a GitHub username, org, or team.
- CI enforces that the PR author matches the namespace (GitHub-side enforcement via branch protection; the validator checks directory naming consistency).
- The `@` prefix visually distinguishes registry skills from local-only skills.

## Contributing a skill

1. Fork this repo.
2. Create `skills/@<your-namespace>/<skill-name>/` with `manifest.json` and `SKILL.md`.
3. Run `bun run validate` locally to catch errors before pushing.
4. Open a PR. CI validates.
5. Merge → CI rebuilds and deploys.

## CI validation checklist

Every PR must pass:

- `manifest.json` parses and matches the Zod schema.
- Directory path matches `@<namespace>/<name>` from the manifest.
- All files listed in `manifest.json` exist.
- `SKILL.md` exists and has frontmatter with `description` ≤280 chars.
- No path traversal or unsafe file paths.
- No duplicate skill IDs.

## Development

Requires [Bun](https://bun.sh) >= 1.3.9.

```bash
bun install
bun run validate    # validate all skills
bun run build       # build registry.json + static site into dist/
bun run typecheck   # typecheck scripts
```

## Registry endpoint

Once published, `https://skills.kaged.dev/registry.json` returns:

```json
{
  "schema_version": "1.0",
  "built_at": "2025-01-01T00:00:00.000Z",
  "skills": [
    {
      "id": "@karasu/code-review",
      "name": "code-review",
      "namespace": "@karasu",
      "version": "1.0.0",
      ...
    }
  ]
}
```

The daemon's registry import flow fetches this endpoint, lets the operator browse skills in the UI, and downloads individual skill files into `.kaged/skills/<name>/`.

## Cloudflare Pages setup

The CI workflow deploys `./dist` to the `skills` branch of the Cloudflare Pages project `kaged`. Add these secrets to `kaged-dev/kaged-skills`:

- `CLOUDFLARE_API_TOKEN` — token with `Cloudflare Pages:Edit` for the project.
- `CLOUDFLARE_ACCOUNT_ID` — the account ID that owns the project.

## License

MIT. See [LICENCE.md](LICENCE.md).
