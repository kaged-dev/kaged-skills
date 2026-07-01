import fs from "node:fs/promises";
import path from "node:path";
import { SkillManifestSchema, type RegistryEntry } from "./schema.ts";

const ROOT = import.meta.dir;
const SKILLS_DIR = path.join(ROOT, "..", "skills");

interface ValidationError {
  dir: string;
  message: string;
}

async function isDirectory(p: string): Promise<boolean> {
  try {
    const stat = await fs.stat(p);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(p: string): Promise<boolean> {
  try {
    const stat = await fs.stat(p);
    return stat.isFile();
  } catch {
    return false;
  }
}

/**
 * Validate a single skill directory. Returns an array of error messages
 * (empty if valid). Also returns the parsed manifest on success.
 */
async function validateSkill(
  skillDir: string,
): Promise<{ errors: string[]; entry: RegistryEntry | null }> {
  const errors: string[] = [];
  const manifestPath = path.join(skillDir, "manifest.json");
  const relDir = path.relative(path.join(ROOT, ".."), skillDir);

  // 1. manifest.json must exist
  if (!(await fileExists(manifestPath))) {
    return { errors: ["manifest.json not found"], entry: null };
  }

  // 2. manifest.json must be valid JSON
  let raw: unknown;
  try {
    const text = await fs.readFile(manifestPath, "utf-8");
    raw = JSON.parse(text);
  } catch {
    return { errors: ["manifest.json is not valid JSON"], entry: null };
  }

  // 3. manifest must match schema
  const result = SkillManifestSchema.safeParse(raw);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(
        `manifest.json: ${issue.path.join(".")}: ${issue.message}`,
      );
    }
    return { errors, entry: null };
  }
  const manifest = result.data;

  // 4. Directory structure: skills/@<namespace>/<name>/
  const parts = skillDir.replace(/\\/g, "/").split("/");
  const dirName = parts[parts.length - 1] ?? "";
  const namespaceDir = parts[parts.length - 2] ?? "";
  const expectedNs = `@${manifest.namespace.slice(1)}`;

  if (namespaceDir !== expectedNs) {
    errors.push(
      `directory namespace "${namespaceDir}" does not match manifest namespace "${manifest.namespace}"`,
    );
  }
  if (dirName !== manifest.name) {
    errors.push(
      `directory name "${dirName}" does not match manifest name "${manifest.name}"`,
    );
  }

  // 5. Every file in manifest.files must exist
  for (const file of manifest.files) {
    if (path.isAbsolute(file) || file.includes("..")) {
      errors.push(
        `files: "${file}" must be a relative path without ".."`,
      );
      continue;
    }
    const filePath = path.join(skillDir, file);
    if (!(await fileExists(filePath))) {
      errors.push(`files: "${file}" does not exist`);
    }
  }

  // 6. At least one .md file must be in files (SKILL.md convention)
  const mdFiles = manifest.files.filter((f) => f.endsWith(".md"));
  if (mdFiles.length === 0) {
    errors.push("files: must include at least one .md file (SKILL.md)");
  }

  // 7. SKILL.md is required
  if (!manifest.files.includes("SKILL.md")) {
    errors.push("files: must include SKILL.md");
  }
  if (!(await fileExists(path.join(skillDir, "SKILL.md")))) {
    errors.push("SKILL.md not found");
  }

  // 8. Read SKILL.md and validate frontmatter description
  if (await fileExists(path.join(skillDir, "SKILL.md"))) {
    const skillContent = await fs.readFile(
      path.join(skillDir, "SKILL.md"),
      "utf-8",
    );
    const fm = extractFrontmatter(skillContent);
    if (!fm.description) {
      errors.push("SKILL.md: frontmatter must include 'description'");
    }
    if (fm.description && fm.description.length > 280) {
      errors.push(
        `SKILL.md: frontmatter description must be ≤280 chars (got ${fm.description.length})`,
      );
    }
  }

  if (errors.length > 0) return { errors, entry: null };

  // Build the registry entry
  const id = `${manifest.namespace}/${manifest.name}`;
  const slug = `${manifest.namespace.slice(1)}/${manifest.name}`;
  const readme = await readReadme(skillDir, manifest.files);

  return {
    errors: [],
    entry: {
      ...manifest,
      id,
      slug,
      dir: relDir,
      readme,
    },
  };
}

async function readReadme(
  skillDir: string,
  files: string[],
): Promise<string | null> {
  const readmeFile =
    files.find((f) => f.toLowerCase() === "readme.md") ??
    files.find((f) => f === "SKILL.md");
  if (!readmeFile) return null;
  try {
    return await fs.readFile(path.join(skillDir, readmeFile), "utf-8");
  } catch {
    return null;
  }
}

interface Frontmatter {
  description?: string;
}

function extractFrontmatter(content: string): Frontmatter {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const body = match[1] ?? "";
  const result: Frontmatter = {};
  for (const line of body.split("\n")) {
    const m = line.match(/^description:\s*(.+)$/);
    if (m) result.description = (m[1] ?? "").trim();
  }
  return result;
}

/**
 * Discover all skill directories under skills/@<namespace>/<name>/.
 * Returns absolute paths.
 */
async function discoverSkills(): Promise<string[]> {
  const result: string[] = [];
  let namespaceDirs: import("node:fs").Dirent[];

  try {
    namespaceDirs = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  for (const nsEntry of namespaceDirs) {
    if (!nsEntry.isDirectory() || !nsEntry.name.startsWith("@")) continue;
    const nsPath = path.join(SKILLS_DIR, nsEntry.name);
    let skillDirs: import("node:fs").Dirent[];
    try {
      skillDirs = await fs.readdir(nsPath, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const skillEntry of skillDirs) {
      if (!skillEntry.isDirectory()) continue;
      result.push(path.join(nsPath, skillEntry.name));
    }
  }

  return result;
}

/** Public: validate and collect all skills. Throws on first error set. */
export async function collectSkills(): Promise<RegistryEntry[]> {
  const skillDirs = await discoverSkills();
  const entries: RegistryEntry[] = [];
  const allErrors: ValidationError[] = [];
  const seenIds = new Set<string>();

  for (const skillDir of skillDirs) {
    const { errors, entry } = await validateSkill(skillDir);
    if (errors.length > 0) {
      allErrors.push(...errors.map((message) => ({ dir: skillDir, message })));
    }
    if (entry) {
      if (seenIds.has(entry.id)) {
        allErrors.push({
          dir: skillDir,
          message: `duplicate skill id "${entry.id}"`,
        });
      } else {
        seenIds.add(entry.id);
        entries.push(entry);
      }
    }
  }

  if (allErrors.length > 0) {
    console.error("Validation failed:\n");
    for (const err of allErrors) {
      console.error(`  ${path.relative(path.join(ROOT, ".."), err.dir)}: ${err.message}`);
    }
    console.error(`\n${allErrors.length} error(s) across ${skillDirs.length} skill(s).`);
    process.exit(1);
  }

  return entries;
}

// ── CLI entry point ────────────────────────────────────────────────────
if (import.meta.main) {
  const entries = await collectSkills();
  console.log(`✓ ${entries.length} skill(s) validated`);
  for (const entry of entries) {
    console.log(`  ${entry.id} v${entry.version}`);
  }
}
