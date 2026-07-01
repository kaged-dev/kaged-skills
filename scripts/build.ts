import fs from "node:fs/promises";
import path from "node:path";
import { collectSkills } from "./validate.ts";
import { renderIndex, renderSkillPage } from "./site.ts";

const ROOT = import.meta.dir;
const OUT_DIR = path.join(ROOT, "..", "dist");

async function main() {
  // Validate all skills (exits on error)
  const skills = await collectSkills();

  // Clean output
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  const buildTime = new Date().toISOString();

  // Write registry.json — the canonical index consumed by the daemon
  const registry = {
    schema_version: "1.0",
    built_at: buildTime,
    skills: skills.map((s) => ({
      id: s.id,
      name: s.name,
      namespace: s.namespace,
      version: s.version,
      description: s.description,
      category: s.category,
      tags: s.tags,
      files: s.files,
      kaged_version: s.kaged_version,
      license: s.license,
    })),
  };
  await Bun.write(
    path.join(OUT_DIR, "registry.json"),
    JSON.stringify(registry, null, 2),
  );

  // Render browse page
  const indexHtml = renderIndex(skills, buildTime);
  await Bun.write(path.join(OUT_DIR, "index.html"), indexHtml);
  await Bun.write(path.join(OUT_DIR, "404.html"), indexHtml);

  // Render detail pages
  for (const skill of skills) {
    const skillDir = path.join(OUT_DIR, "skills", skill.slug);
    await fs.mkdir(skillDir, { recursive: true });
    const html = renderSkillPage(skill, buildTime);
    await Bun.write(path.join(skillDir, "index.html"), html);
  }

  console.log(`built ${path.relative(ROOT, OUT_DIR)}:`);
  console.log(`  skills:  ${skills.length}`);
  console.log(`  pages:   ${skills.length + 2} (browse + ${skills.length} detail + 404)`);
  console.log(`  built:   ${buildTime}`);
}

await main();
