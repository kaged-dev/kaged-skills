import { z } from "zod";

/**
 * manifest.json schema for a single skill.
 *
 * This is the contract CI validates on every PR and the build script uses to
 * generate registry.json. Changing it is a breaking change for existing skills.
 */
export const SkillManifestSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, "lowercase kebab-case only"),

  namespace: z
    .string()
    .min(1)
    .max(64)
    .regex(/^@[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, "must start with @, lowercase kebab-case"),

  version: z
    .string()
    .min(1)
    .regex(/^\d+\.\d+\.\d+$/, "must be semver X.Y.Z"),

  description: z.string().min(1).max(280),

  category: z.string().min(1).max(48),

  tags: z.array(z.string().min(1).max(32)).max(20).default([]),

  files: z
    .array(z.string().min(1))
    .min(1, "at least one file must be listed")
    .max(200),

  kaged_version: z
    .string()
    .min(1)
    .regex(/^[><=]+\s*\d+\.\d+\.\d+$/, "semver constraint like '>=0.4.0'"),

  license: z
    .string()
    .min(1)
    .max(64)
    .default("MIT"),
});

export type SkillManifest = z.infer<typeof SkillManifestSchema>;

/**
 * Full validated entry — the manifest plus derived metadata computed by the
 * build script. This is the shape that goes into registry.json.
 */
export interface RegistryEntry extends SkillManifest {
  /** "@namespace/name" — unique identifier across the registry. */
  id: string;
  /** "namespace/name" without the @ — safe for URL path segments. */
  slug: string;
  /** Path relative to repo root, e.g. "skills/@karasu/code-review". */
  dir: string;
  /** Raw README/SKILL.md content, read from files[0] if it's a .md. */
  readme: string | null;
}

/** Known categories for the browse filter. Extend freely. */
export const KNOWN_CATEGORIES = [
  "code-quality",
  "devops",
  "documentation",
  "testing",
  "security",
  "workflow",
  "debugging",
  "refactoring",
] as const;
