import fs from "node:fs/promises";
import path from "node:path";
import { collectSkills } from "./validate.ts";
import type { RegistryEntry } from "./schema.ts";
import {
  renderIndex,
  renderSkillPage,
  renderNamespacePage,
  renderTagPage,
} from "./site.ts";

const ROOT = import.meta.dir;
const OUT_DIR = path.join(ROOT, "..", "dist");

/** Source directory on disk for a skill (skills/@ns/name). */
function srcDir(skill: RegistryEntry): string {
  return path.join(ROOT, "..", skill.dir);
}

async function main() {
  // Validate all skills (exits on error)
  const skills = await collectSkills();

  // Clean output
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  const buildTime = new Date().toISOString();

  // ── registry.json — canonical index consumed by the daemon ───────────
  // No `files` array: the daemon fetches manifest.json from the skill URL
  // when installing. Keeps the index small.
  const registry = {
    schema_version: "1.0",
    built_at: buildTime,
    skills: skills.map((s) => ({
      id: s.id,
      url: `/skills/${s.slug}/`,
      name: s.name,
      namespace: s.namespace,
      version: s.version,
      description: s.description,
      category: s.category,
      tags: s.tags,
      kaged_version: s.kaged_version,
      license: s.license,
    })),
  };
  await Bun.write(
    path.join(OUT_DIR, "registry.json"),
    JSON.stringify(registry, null, 2),
  );

  // ── Browse page (also serves as 404) ────────────────────────────────
  const indexHtml = renderIndex(skills, buildTime);
  await Bun.write(path.join(OUT_DIR, "index.html"), indexHtml);
  await Bun.write(path.join(OUT_DIR, "404.html"), indexHtml);

  // ── Skill detail pages + copy skill files ───────────────────────────
  for (const skill of skills) {
    const outSkillDir = path.join(OUT_DIR, "skills", skill.slug);
    await fs.mkdir(outSkillDir, { recursive: true });

    // Copy manifest.json + every file listed in the manifest so the skill
    // can be installed directly from the site (same URL as the view page).
    const filesToCopy = ["manifest.json", ...skill.files];
    for (const file of filesToCopy) {
      const src = path.join(srcDir(skill), file);
      const dest = path.join(outSkillDir, file);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.copyFile(src, dest);
    }

    const html = renderSkillPage(skill, buildTime);
    await Bun.write(path.join(outSkillDir, "index.html"), html);
  }

  // ── Namespace index pages ───────────────────────────────────────────
  const byNamespace = new Map<string, RegistryEntry[]>();
  for (const skill of skills) {
    const list = byNamespace.get(skill.namespace) ?? [];
    list.push(skill);
    byNamespace.set(skill.namespace, list);
  }
  for (const [ns, nsSkills] of byNamespace) {
    const nsDir = path.join(OUT_DIR, "skills", ns.slice(1));
    await fs.mkdir(nsDir, { recursive: true });
    const html = renderNamespacePage(ns, nsSkills, buildTime);
    await Bun.write(path.join(nsDir, "index.html"), html);
  }

  // ── Tag pages ───────────────────────────────────────────────────────
  const byTag = new Map<string, RegistryEntry[]>();
  for (const skill of skills) {
    for (const tag of skill.tags) {
      const list = byTag.get(tag) ?? [];
      list.push(skill);
      byTag.set(tag, list);
    }
  }
  for (const [tag, tagSkills] of byTag) {
    const tagDir = path.join(OUT_DIR, "tags", tag);
    await fs.mkdir(tagDir, { recursive: true });
    const html = renderTagPage(tag, tagSkills, buildTime);
    await Bun.write(path.join(tagDir, "index.html"), html);
  }

  // ── Summary ─────────────────────────────────────────────────────────
  const pages =
    skills.length + byNamespace.size + byTag.size + 2; // +browse +404
  console.log(`built ${path.relative(ROOT, OUT_DIR)}:`);
  console.log(`  skills:      ${skills.length}`);
  console.log(`  namespaces:  ${byNamespace.size}`);
  console.log(`  tags:        ${byTag.size}`);
  console.log(
    `  pages:       ${pages} (browse + ${skills.length} skill + ${byNamespace.size} namespace + ${byTag.size} tag + 404)`,
  );
  console.log(`  built:       ${buildTime}`);
}

await main();
