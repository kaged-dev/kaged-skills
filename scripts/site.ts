import type { RegistryEntry } from "./schema.ts";

const AMBER = "#FFB000";
const AMBER_BRIGHT = "#FFCC33";
const AMBER_DIM = "#806000";
const AMBER_FAINT = "#2A2010";
const MAGENTA = "#FF2E63";
const CYAN = "#00E0FF";
const BG_BASE = "#0A0A0B";
const BG_ELEVATED = "#111114";
const BG_OVERLAY = "#16161A";
const BG_INSET = "#08080A";
const BORDER_SUBTLE = "#1F1E1B";
const BORDER_DEFAULT = "#2B2924";
const BORDER_GLOW = "#3D3A33";
const TEXT = "#E8E6E1";
const TEXT_MUTED = "#8A8580";

function sharedStyles(): string {
  return `
    :root {
      --bg-base: ${BG_BASE};
      --bg-elevated: ${BG_ELEVATED};
      --bg-overlay: ${BG_OVERLAY};
      --bg-inset: ${BG_INSET};
      --border-subtle: ${BORDER_SUBTLE};
      --border-default: ${BORDER_DEFAULT};
      --border-glow: ${BORDER_GLOW};
      --amber: ${AMBER};
      --amber-bright: ${AMBER_BRIGHT};
      --amber-dim: ${AMBER_DIM};
      --amber-faint: ${AMBER_FAINT};
      --magenta: ${MAGENTA};
      --cyan: ${CYAN};
      --text: ${TEXT};
      --text-muted: ${TEXT_MUTED};
      --font-display: "Orbitron", sans-serif;
      --font-ui: "Rajdhani", system-ui, sans-serif;
      --font-mono: "JetBrains Mono", monospace;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg-base);
      color: var(--text);
      font-family: var(--font-ui);
      font-size: 16px;
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    a { color: var(--amber-bright); text-decoration: none; }
    a:hover { text-decoration: underline; }
    header {
      border-bottom: 1px solid var(--border-default);
      padding: 1.5rem 1rem;
      background: var(--bg-elevated);
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    .brand {
      display: flex;
      align-items: baseline;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .glyph {
      font-family: var(--font-display);
      color: var(--amber);
      font-size: 1.5rem;
    }
    h1 {
      font-family: var(--font-display);
      font-size: 1.5rem;
      margin: 0;
      color: var(--text);
      font-weight: 700;
      text-transform: lowercase;
      letter-spacing: 0.05em;
    }
    .badge {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--amber);
      background: var(--amber-faint);
      border: 1px solid var(--amber-dim);
      padding: 0.2rem 0.5rem;
      border-radius: 0.25rem;
      text-transform: uppercase;
    }
    .nav-crumb {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 0.5rem;
    }
    .nav-crumb a {
      color: var(--amber-bright);
    }
    main {
      flex: 1;
      padding: 2rem 1rem;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat {
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      border-radius: 0.5rem;
      padding: 1rem;
    }
    .stat-number {
      font-family: var(--font-display);
      font-size: 2rem;
      color: var(--amber);
      margin: 0;
    }
    .stat-label {
      color: var(--text-muted);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .filter-bar {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
    }
    .filter-chip {
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      padding: 0.3rem 0.75rem;
      border-radius: 0.25rem;
      border: 1px solid var(--border-default);
      color: var(--text-muted);
      background: var(--bg-elevated);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .filter-chip:hover, .filter-chip.active {
      color: var(--amber);
      border-color: var(--amber-dim);
      background: var(--amber-faint);
    }
    .search-box {
      width: 100%;
      max-width: 400px;
      padding: 0.6rem 1rem;
      background: var(--bg-inset);
      border: 1px solid var(--border-default);
      border-radius: 0.5rem;
      color: var(--text);
      font-family: var(--font-ui);
      font-size: 0.9375rem;
      margin-bottom: 1.5rem;
    }
    .search-box:focus {
      outline: none;
      border-color: var(--amber-dim);
    }
    .search-box::placeholder {
      color: var(--text-muted);
    }
    h2.section-heading {
      font-family: var(--font-ui);
      font-size: 1.25rem;
      color: var(--amber);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }
    .skill-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }
    .skill-card {
      position: relative;
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      border-radius: 0.5rem;
      padding: 1.25rem;
      color: var(--text);
      transition: border-color 0.15s ease, background 0.15s ease;
    }
    .skill-card:hover {
      border-color: var(--border-glow);
      background: var(--bg-overlay);
    }
    .skill-card .card-link {
      position: absolute;
      inset: 0;
      z-index: 1;
    }
    .skill-card .ns {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      margin-bottom: 0.25rem;
    }
    .skill-card .ns a {
      position: relative;
      z-index: 2;
      color: var(--cyan);
    }
    .skill-card .ns a:hover {
      color: var(--cyan);
    }
    .skill-card .name {
      font-family: var(--font-display);
      font-size: 1.125rem;
      color: var(--text);
      margin-bottom: 0.5rem;
    }
    .skill-card .desc {
      color: var(--text-muted);
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
    }
    .skill-card .tags {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }
    .tag {
      font-family: var(--font-mono);
      font-size: 0.6875rem;
      text-transform: lowercase;
      padding: 0.15rem 0.45rem;
      border-radius: 0.25rem;
      border: 1px solid var(--border-default);
      color: var(--text-muted);
    }
    a.tag {
      position: relative;
      z-index: 2;
      text-decoration: none;
    }
    a.tag:hover {
      color: var(--amber-bright);
      border-color: var(--amber-dim);
      background: var(--amber-faint);
    }
    .tag.category {
      color: var(--magenta);
      border-color: var(--magenta);
      opacity: 0.8;
    }
    .detail-header {
      margin-bottom: 1.5rem;
    }
    .detail-header .ns a {
      color: var(--cyan);
    }
    .detail-header h1 {
      font-size: 2rem;
      color: var(--amber);
      margin: 0.25rem 0;
    }
    .detail-header .desc {
      font-size: 1.0625rem;
      color: var(--text-muted);
      margin-top: 0.5rem;
    }
    .skill-url {
      background: var(--bg-inset);
      border: 1px solid var(--border-default);
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
      margin-bottom: 1.5rem;
      font-family: var(--font-mono);
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .skill-url .label {
      color: var(--amber);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      flex-shrink: 0;
    }
    .skill-url code {
      color: var(--cyan);
      flex: 1;
      overflow-x: auto;
      white-space: nowrap;
    }
    .skill-url .copy-btn {
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 0.75rem;
      padding: 0.3rem 0.75rem;
      border-radius: 0.25rem;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.15s ease;
    }
    .skill-url .copy-btn:hover {
      color: var(--amber);
      border-color: var(--amber-dim);
    }
    .skill-url .copy-btn.copied {
      color: var(--amber);
      border-color: var(--amber-dim);
      background: var(--amber-faint);
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .meta-item {
      background: var(--bg-inset);
      border: 1px solid var(--border-subtle);
      border-radius: 0.5rem;
      padding: 0.75rem;
    }
    .meta-item .label {
      font-family: var(--font-mono);
      font-size: 0.6875rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }
    .meta-item .value {
      font-family: var(--font-mono);
      font-size: 0.875rem;
      color: var(--text);
    }
    .file-list {
      background: var(--bg-inset);
      border: 1px solid var(--border-subtle);
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    .file-list h3 {
      font-family: var(--font-ui);
      font-size: 0.9375rem;
      color: var(--amber);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 0.75rem 0;
    }
    .file-list ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .file-list li {
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      padding: 0.2rem 0;
    }
    .file-list li::before {
      content: "›";
      color: var(--amber-dim);
      margin-right: 0.5rem;
    }
    .file-list li a {
      color: var(--cyan);
    }
    .file-list li a:hover {
      color: var(--amber-bright);
    }
    .readme-section {
      background: var(--bg-inset);
      border: 1px solid var(--border-subtle);
      border-radius: 0.5rem;
      padding: 1.5rem;
      overflow-x: auto;
    }
    .readme-section h3 {
      font-family: var(--font-ui);
      font-size: 0.9375rem;
      color: var(--amber);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 1rem 0;
    }
    .readme-content {
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      color: var(--text);
      white-space: pre-wrap;
      line-height: 1.6;
    }
    .endpoints {
      background: var(--bg-inset);
      border: 1px solid var(--border-default);
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 2rem;
      font-family: var(--font-mono);
      font-size: 0.875rem;
    }
    .endpoints h2 {
      font-family: var(--font-ui);
      font-size: 1rem;
      margin: 0 0 0.75rem 0;
      color: var(--amber);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .endpoints ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .endpoints li {
      margin: 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .endpoints code {
      color: var(--cyan);
      background: var(--bg-base);
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
    }
    .empty-state {
      color: var(--text-muted);
      font-style: italic;
      padding: 2rem;
      text-align: center;
    }
    footer {
      border-top: 1px solid var(--border-default);
      padding: 1.5rem 1rem;
      background: var(--bg-elevated);
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    .manifest-line {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }
    .no-results {
      display: none;
      color: var(--text-muted);
      font-style: italic;
      padding: 2rem;
      text-align: center;
    }
    @media (max-width: 600px) {
      .skill-grid {
        grid-template-columns: 1fr;
      }
      .detail-header h1 {
        font-size: 1.5rem;
      }
    }
  `;
}

function pageHead(title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Rajdhani:wght@400;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>${sharedStyles()}</style>
</head>`;
}

function pageHeader(title: string, badge?: string, crumb?: string): string {
  return `
  <header>
    <div class="container">
      <div class="brand">
        <span class="glyph">影</span>
        <h1>${escapeHtml(title)}</h1>
        ${badge ? `<span class="badge">${escapeHtml(badge)}</span>` : ""}
      </div>
      ${crumb ? `<div class="nav-crumb">${crumb}</div>` : ""}
    </div>
  </header>`;
}

function pageFooter(buildTime: string): string {
  return `
  <footer>
    <div class="container">
      <div>[kaged] skills registry</div>
      <div class="manifest-line">
        built: ${buildTime} · <a href="/registry.json">registry.json</a>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

/** Namespace without @ — safe for URL path segments. */
function nsSlug(ns: string): string {
  return ns.slice(1);
}

export function renderIndex(
  skills: RegistryEntry[],
  buildTime: string,
): string {
  const skillCount = skills.length;
  const namespaces = new Set(skills.map((s) => s.namespace));
  const categories = [...new Set(skills.map((s) => s.category))].sort();

  return `${pageHead("kaged skills — registry")}
<body>
  ${pageHeader("kaged skills", "[REGISTRY]")}
  <main>
    <div class="container">
      <div class="stats">
        <div class="stat">
          <div class="stat-number">${skillCount}</div>
          <div class="stat-label">Skills</div>
        </div>
        <div class="stat">
          <div class="stat-number">${namespaces.size}</div>
          <div class="stat-label">Namespaces</div>
        </div>
        <div class="stat">
          <div class="stat-number">${categories.length}</div>
          <div class="stat-label">Categories</div>
        </div>
      </div>

      <div class="endpoints">
        <h2>Data endpoints</h2>
        <ul>
          <li><code>/registry.json</code> <span>full index of all skills</span></li>
        </ul>
      </div>

      <input type="text" class="search-box" id="search" placeholder="Search skills..." autocomplete="off">

      <div class="filter-bar" id="filters">
        <span class="filter-chip active" data-cat="all">all</span>
        ${categories
          .map((cat) => `<span class="filter-chip" data-cat="${escapeHtml(cat)}">${escapeHtml(cat)}</span>`)
          .join("\n        ")}
      </div>

      <h2 class="section-heading">Skills</h2>
      <div class="skill-grid" id="grid">
        ${skills
          .map((skill) => skillCard(skill))
          .join("\n        ")}
      </div>
      <div class="no-results" id="no-results">No skills match your filter.</div>
    </div>
  </main>
  ${pageFooter(buildTime)}
  <script>
    const grid = document.getElementById("grid");
    const cards = [...grid.querySelectorAll(".skill-card")];
    const search = document.getElementById("search");
    const filters = document.getElementById("filters");
    const noResults = document.getElementById("no-results");
    let activeCat = "all";

    function applyFilters() {
      const q = search.value.toLowerCase().trim();
      let visible = 0;
      cards.forEach((card) => {
        const cat = card.dataset.category || "";
        const text = (card.textContent || "").toLowerCase();
        const catMatch = activeCat === "all" || cat === activeCat;
        const textMatch = q === "" || text.includes(q);
        if (catMatch && textMatch) {
          card.style.display = "";
          visible++;
        } else {
          card.style.display = "none";
        }
      });
      noResults.style.display = visible === 0 ? "block" : "none";
    }

    search.addEventListener("input", applyFilters);
    filters.addEventListener("click", (e) => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      activeCat = chip.dataset.cat;
      filters.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      applyFilters();
    });
  </script>`;
}

function skillCard(skill: RegistryEntry): string {
  const tagsHtml = skill.tags
    .slice(0, 5)
    .map((t) => `<a href="/tags/${encodeURIComponent(t)}/" class="tag">${escapeHtml(t)}</a>`)
    .join("");

  return `<div class="skill-card" data-category="${escapeHtml(skill.category)}">
      <a class="card-link" href="/skills/${skill.slug}/" aria-label="view ${escapeHtml(skill.name)}"></a>
      <div class="ns"><a href="/skills/${nsSlug(skill.namespace)}/">${escapeHtml(skill.namespace)}</a></div>
      <div class="name">${escapeHtml(skill.name)}</div>
      <div class="desc">${escapeHtml(skill.description)}</div>
      <div class="tags">
        <span class="tag category">${escapeHtml(skill.category)}</span>
        ${tagsHtml}
      </div>
    </div>`;
}

export function renderSkillPage(
  skill: RegistryEntry,
  buildTime: string,
): string {
  const skillUrl = `/skills/${skill.slug}/`;
  const crumb = `<a href="/">kaged skills</a> / <a href="/skills/${nsSlug(skill.namespace)}/">${escapeHtml(skill.namespace)}</a> / ${escapeHtml(skill.name)}`;

  const tagsHtml = skill.tags.length > 0
    ? skill.tags.map((t) => `<a href="/tags/${encodeURIComponent(t)}/" class="tag">${escapeHtml(t)}</a>`).join("\n        ")
    : "";

  // manifest.json is always available alongside — show it in the file list
  const allFiles = ["manifest.json", ...skill.files];
  const filesHtml = allFiles
    .map((f) => `<li><a href="${escapeHtml(f)}">${escapeHtml(f)}</a></li>`)
    .join("\n          ");

  return `${pageHead(`${skill.namespace}/${skill.name} — kaged skills`)}
<body>
  ${pageHeader(skill.name, "[SKILL]", crumb)}
  <main>
    <div class="container">
      <div class="detail-header">
        <div class="ns"><a href="/skills/${nsSlug(skill.namespace)}/">${escapeHtml(skill.namespace)}</a></div>
        <h1>${escapeHtml(skill.name)}</h1>
        <div class="desc">${escapeHtml(skill.description)}</div>
      </div>

      <div class="skill-url">
        <span class="label">link</span>
        <code id="skill-url">${escapeHtml(skillUrl)}</code>
        <button class="copy-btn" id="copy-btn" onclick="copySkillUrl()">copy</button>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <div class="label">version</div>
          <div class="value">${escapeHtml(skill.version)}</div>
        </div>
        <div class="meta-item">
          <div class="label">category</div>
          <div class="value">${escapeHtml(skill.category)}</div>
        </div>
        <div class="meta-item">
          <div class="label">kaged</div>
          <div class="value">${escapeHtml(skill.kaged_version)}</div>
        </div>
        <div class="meta-item">
          <div class="label">license</div>
          <div class="value">${escapeHtml(skill.license)}</div>
        </div>
      </div>

      ${skill.tags.length > 0 ? `
      <div class="tags" style="margin-bottom: 1.5rem;">
        ${tagsHtml}
      </div>` : ""}

      <div class="file-list">
        <h3>Files</h3>
        <ul>
          ${filesHtml}
        </ul>
      </div>

      ${skill.readme ? `
      <div class="readme-section">
        <h3>SKILL.md</h3>
        <div class="readme-content">${escapeHtml(skill.readme)}</div>
      </div>` : ""}
    </div>
  </main>
  ${pageFooter(buildTime)}
  <script>
    function copySkillUrl() {
      const btn = document.getElementById("copy-btn");
      navigator.clipboard.writeText(window.location.href).then(() => {
        btn.textContent = "copied!";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = "copy"; btn.classList.remove("copied"); }, 2000);
      });
    }
  </script>`;
}

export function renderNamespacePage(
  ns: string,
  nsSkills: RegistryEntry[],
  buildTime: string,
): string {
  const slug = nsSlug(ns);
  const crumb = `<a href="/">kaged skills</a> / ${escapeHtml(ns)}`;

  return `${pageHead(`${ns} — kaged skills`)}
<body>
  ${pageHeader(ns, "[NAMESPACE]", crumb)}
  <main>
    <div class="container">
      <div class="stats">
        <div class="stat">
          <div class="stat-number">${nsSkills.length}</div>
          <div class="stat-label">${escapeHtml(ns)} Skills</div>
        </div>
      </div>

      <h2 class="section-heading">Skills</h2>
      <div class="skill-grid" id="grid">
        ${nsSkills
          .map((skill) => skillCard(skill))
          .join("\n        ")}
      </div>
    </div>
  </main>
  ${pageFooter(buildTime)}`;
}

export function renderTagPage(
  tag: string,
  tagSkills: RegistryEntry[],
  buildTime: string,
): string {
  const crumb = `<a href="/">kaged skills</a> / <a href="/tags/">tags</a> / ${escapeHtml(tag)}`;

  return `${pageHead(`#${tag} — kaged skills`)}
<body>
  ${pageHeader(`#${tag}`, "[TAG]", crumb)}
  <main>
    <div class="container">
      <div class="stats">
        <div class="stat">
          <div class="stat-number">${tagSkills.length}</div>
          <div class="stat-label">Tagged #${escapeHtml(tag)}</div>
        </div>
      </div>

      <h2 class="section-heading">Skills</h2>
      <div class="skill-grid" id="grid">
        ${tagSkills
          .map((skill) => skillCard(skill))
          .join("\n        ")}
      </div>
    </div>
  </main>
  ${pageFooter(buildTime)}`;
}

function escapeHtml(text: string | null | undefined): string {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
