# AGENTS.md — kaged-skills

> **Read this before doing anything.** This is a standalone repo, not part of
> the kaged monorepo. It has its own conventions, its own CI, and its own
> deploy target. Pattern-matching against the monorepo will lead you astray.

---

## Project Overview

**kaged-skills** is the public, git-based registry of kaged skills. It
publishes `skills.kaged.dev` — a static site where operators browse,
search, and discover skills to import into their kaged projects. The
registry is a sibling to `kaged-dev/kaged-models` (which does the same
thing for model catalogs). Skills are community-contributed via pull
requests; CI validates every PR against a Zod schema and rebuilds the
site on merge to `main`.

The repo dogfoods kaged: `.kaged/project.yaml` describes this project as
a kaged-managed project. Treat that config as live, not an example.

---

## Repository Structure

```
kaged-skills/
├── scripts/                TypeScript toolchain (validate, build, render)
│   ├── schema.ts           Zod schema for manifest.json (the contract)
│   ├── validate.ts         CI entry: validates all skills, exits on error
│   ├── build.ts            Reads manifests → registry.json + static HTML
│   └── site.ts             Kaged-branded HTML renderer (browse + detail)
├── skills/                 The skill content (what gets published)
│   └── @<namespace>/       One dir per namespace (submitter identity)
│       └── <skill-name>/   One dir per skill
│           ├── manifest.json   Required metadata (schema-validated)
│           ├── SKILL.md        Required frontmatter + instructions
│           └── ...             Optional supporting files
├── .github/workflows/
│   └── ci.yml              Validate on PR, build+deploy on push to main
├── .kaged/                 This repo's own kaged project config
├── dist/                   Generated output (gitignored, built in CI)
├── package.json            Bun workspace, scripts, dependencies
├── tsconfig.json           Strict TS config (ESM, .ts extensions, noEmit)
├── LICENCE.md              MIT
└── README.md               Public-facing readme
```

- **`scripts/`** — the toolchain. Four files. Everything the build does is
  visible here; there is no hidden config or codegen step.
- **`skills/`** — the content. This is what operators see on the site and
  what the daemon fetches via `registry.json`. Every skill is a directory
  under `@<namespace>/<skill-name>/`.
- **`.github/workflows/ci.yml`** — the only CI pipeline. Two jobs:
  `validate` (runs on every PR + push) and `publish` (runs only on push
  to `main`, deploys to Cloudflare Pages).

---

## Build & Development Commands

All Bun. No npm, yarn, pnpm, npx.

```bash
bun install                # install dependencies (zod, types)

bun run validate           # validate all skills (schema, files, frontmatter)
bun run build              # build registry.json + static site into dist/
bun run typecheck          # tsc --noEmit (typecheck scripts/ only)
```

There is no test runner. `bun run validate` **is** the test — if it
exits 0, every skill in the registry is structurally valid. If it exits
1, the error messages tell you which skill and what failed.

### Deploy

Deploys are automatic. Push to `main` → CI runs `bun run build` → deploys
`dist/` to Cloudflare Pages:

```bash
bunx wrangler pages deploy ./dist --project-name kaged --branch skills
```

This targets the `skills` branch of the `kaged` Cloudflare Pages project
(same project as `kaged-models`, different branch). The live URL is
`https://skills.kaged.pages.dev` (and `skills.kaged.dev` via custom domain).

Never run the deploy locally. CI owns it.

---

## Code Style & Conventions

### TypeScript

- **ESM only** (`"type": "module"`).
- `.ts` imports use explicit `.ts` extensions (`allowImportingTsExtensions`).
- **Strict TS**, no escape hatches: `strict`, `noUncheckedIndexedAccess`,
  `noImplicitOverride`, `verbatimModuleSyntax`. Do not suppress errors with
  `as any` or `@ts-ignore`. Fix the type.
- `tsconfig.json` includes only `scripts/**/*.ts`. Skill content is not
  typechecked — it's Markdown and JSON, validated by the Zod schema at
  runtime.

### JavaScript / runtime

- **No Node-isms.** The scripts use `Bun.write()`, `import.meta.dir`,
  `bun:sqlite` patterns where needed. Do not add `express`, `fs-extra`,
  or other Node-centric packages.
- No production JS. TypeScript only in `scripts/`.

### Skill content conventions

- **Naming:** lowercase kebab-case only (`code-review`, not
  `CodeReview` or `code_review`).
- **Namespacing:** `@<namespace>/<skill-name>`. Namespace = GitHub
  username, org, or team. The `@` prefix is mandatory.
- **Frontmatter:** SKILL.md must start with exactly this:
  ```yaml
  ---
  description: "One-line description, ≤280 chars."
  ---
  ```
  No other frontmatter fields. All metadata lives in `manifest.json`.
- **manifest.json `files` array:** explicit allowlist. Files in the
  directory but NOT in `manifest.json` are not published. This lets
  contributors keep scratch files without leaking them.

### Commit messages

```
Karasu <karasu@kaged.dev>
```

- Author is **Karasu**, not personal names or agent names.
- Commit subject: imperative mood, ≤72 chars.
- For bulk imports: `"Process @<namespace>: N skills from <source>"`.
- For schema/build changes: describe what changed and why.

---

## Architecture Notes

```
                    ┌─────────────────────────────────┐
                    │          skills/@ns/*/           │
                    │     manifest.json + SKILL.md     │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │       scripts/validate.ts        │
                    │  Zod schema + file checks +      │
                    │  frontmatter + naming + dupes    │
                    └──────────────┬──────────────────┘
                                   │ (RegistryEntry[])
                    ┌──────────────▼──────────────────┐
                    │        scripts/build.ts          │
                    │  registry.json + site HTML       │
                    └──────┬───────────────┬──────────┘
                           │               │
                 ┌─────────▼─────┐  ┌──────▼──────────┐
                 │  registry.json │  │  dist/*.html     │
                 │  (daemon API)  │  │  (browse + detail)│
                 └───────────────┘  └─────────────────┘
```

**Data flow:**

1. **`schema.ts`** defines `SkillManifestSchema` — a Zod object that
   validates every field in `manifest.json`. This is the single source of
   truth for what a valid skill looks like. Changing it is a breaking
   change.

2. **`validate.ts`** walks `skills/@*/*/`, parses each `manifest.json`
   through the schema, then runs additional checks (file existence,
   directory naming matches manifest, SKILL.md frontmatter, no path
   traversal, no duplicate IDs). On success it returns
   `RegistryEntry[]`. On failure it exits 1 with per-skill error messages.

3. **`build.ts`** calls `collectSkills()` (from validate.ts), then:
   - Writes `dist/registry.json` — the canonical index the daemon fetches.
   - Calls `renderIndex()` → `dist/index.html` (browse page with search +
     category filter, client-side JS).
   - Calls `renderSkillPage()` per skill → `dist/skills/<slug>/index.html`.

4. **`site.ts`** is a pure HTML string generator. No framework, no JSX,
   no client-side routing. The browse page has inline `<script>` for
   search/filter. Detail pages are fully static. Uses the kaged brand
   palette (amber-on-dark, Orbitron/Rajdhani/JetBrains Mono fonts).

**`registry.json` shape:**

```json
{
  "schema_version": "1.0",
  "built_at": "ISO-8601",
  "skills": [
    {
      "id": "@karasu/code-review",
      "name": "code-review",
      "namespace": "@karasu",
      "version": "1.0.0",
      "description": "...",
      "category": "code-quality",
      "tags": ["review", "security"],
      "files": ["SKILL.md", "checklist.md"],
      "kaged_version": ">=0.4.0",
      "license": "MIT"
    }
  ]
}
```

---

## Testing Strategy

There is no test framework (`bun:test`, Jest, Vitest — none of them).

**Validation IS the test suite.** The `bun run validate` script checks:

1. `manifest.json` exists and parses as JSON.
2. `manifest.json` matches the Zod schema (name, namespace, version,
   description ≤280 chars, category, tags, files, kaged_version, license).
3. Every file listed in `manifest.json` exists on disk.
4. Directory path matches `@<namespace>/<name>` from the manifest.
5. `SKILL.md` exists and has frontmatter with `description` ≤280 chars.
6. No path traversal (`..` or absolute paths in `files`).
7. No duplicate skill IDs across the registry.

If all checks pass, `bun run build` exercises the full rendering pipeline
as an integration test — any error in `site.ts` or `build.ts` will surface
as a non-zero exit.

**CI runs both** (`validate` + `typecheck`) on every PR. The `publish` job
adds `build` before deploying. There is no separate test job.

---

## Security & Compliance

### Secrets

- **Cloudflare credentials** (`CLOUDFLARE_API_TOKEN`,
  `CLOUDFLARE_ACCOUNT_ID`) are GitHub Actions secrets, never in the repo.
  The `.env` file is gitignored.
- **No secrets in skill content.** Skills are Markdown + JSON + reference
  files. If a skill contains API keys, tokens, or credentials, that's a
  validation failure (and should be caught at PR review).

### Path traversal

`validate.ts` rejects any file path in `manifest.json` that contains `..`
or is absolute. This prevents a malicious skill from listing files outside
its own directory.

### License

MIT for the repo toolchain (`LICENCE.md`). Individual skills declare their
own license in `manifest.json`. Most external skills use Apache-2.0 or MIT.
The `@anthropics` skills use a mix of Apache-2.0 and Anthropic's custom
license.

### No signing / verification

> TODO: Skill signing (GPG/cosign) is deferred to Phase 3 per the parent
> issue (#43). The registry is currently trust-on-PR-review.

---

## Agent Guardrails

### Files never to touch

- **`scripts/schema.ts`** — changing the Zod schema is a breaking change
  for every existing skill. Amend only with explicit operator approval
  and a full re-validation pass.
- **`tsconfig.json`** — strict settings are intentional. Do not relax them.
- **`.github/workflows/ci.yml`** — CI is the gate. Do not bypass or weaken
  validation steps.
- **`LICENCE.md`** — MIT, owned by Karasu/kaged.dev.
- **`.kaged/`** — this repo's own kaged project config. Live config, not
  examples.

### Required reviews

- **New namespace:** requires operator approval. Namespaces map to GitHub
  identities; only the PR author's namespace should be accepted.
- **Schema changes:** `scripts/schema.ts` changes require re-running
  `bun run validate` against all skills. Any breakage must be fixed in
  the same PR.
- **Bulk imports (>10 skills):** run `bun run validate` locally before
  pushing. CI will catch errors, but local validation is faster for
  iterating on large imports.

### Boundaries

- Do not add dependencies casually. The only runtime dep is `zod`.
  Dev deps are `@types/bun`, `@types/node`, `typescript`.
- Do not add a test framework. The validation script is the test.
- Do not add linting. TypeScript strict mode + Zod validation is the
  quality gate.
- Do not commit `dist/`. It's gitignored and built fresh in CI.
- Do not commit `node_modules/`. It's gitignored.
- Do not run `wrangler pages deploy` locally. CI owns deploys.

### Bulk skill processing

When processing a directory dump into the registry, follow the methodology
documented in issue #45. Key rules:

1. Every skill must be a flat `@<namespace>/<skill-name>/` directory.
2. Strip all repo scaffolding (`.github/`, `docs/`, `scripts/`, `LICENSE`,
   `README.md`, `package.json`, etc.) — only skill content remains.
3. Normalize frontmatter to `description:` only.
4. Generate `manifest.json` for each skill.
5. Delete agent targeting configs (`agents/openai.yml`, etc.).
6. `bun run validate` must pass before committing.

---

## Extensibility Hooks

### Adding a new skill

```bash
mkdir -p skills/@<namespace>/<skill-name>
# Write SKILL.md with frontmatter
# Write manifest.json
# Add supporting files
bun run validate   # must pass
bun run build      # must build clean
```

### Adding a new namespace

Create `skills/@<namespace>/` and add at least one skill. The validator
discovers namespaces automatically (any `@`-prefixed directory under
`skills/`).

### Adding a new category

Categories are freeform strings in `manifest.json` (≤48 chars). The
browse page generates filter chips from whatever categories exist. No
registration step — just use it. The `KNOWN_CATEGORIES` array in
`schema.ts` is advisory, not enforced.

### Environment variables

- `CLOUDFLARE_API_TOKEN` — CI secret for Pages deploy.
- `CLOUDFLARE_ACCOUNT_ID` — CI secret for Pages deploy.

No runtime environment variables. The scripts are deterministic given
the `skills/` directory contents.

---

## Further Reading

- [README.md](README.md) — public-facing project readme.
- Issue #43 — the parent issue tracking the registry build (sub-phases A–E).
- Issue #45 — bulk skill import methodology (the processing playbook).
- `scripts/schema.ts` — the manifest.json Zod schema (read this to
  understand what a valid skill looks like).
- The kaged monorepo — the main project. This repo is a sibling, not a
  subpackage. The monorepo's daemon consumes `registry.json` from this
  repo's deployed site.
