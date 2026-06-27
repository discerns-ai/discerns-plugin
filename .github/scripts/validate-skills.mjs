#!/usr/bin/env node
// Lightweight, dependency-free checks that complement `claude plugin validate`:
//  - every plugin JSON file parses
//  - every skills/<name>/SKILL.md has well-formed frontmatter with name + description
// (`claude plugin validate .` validates the marketplace manifest but not skill
//  frontmatter when run at a marketplace root, which is our layout.)
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const errors = [];

// 1. JSON files must parse.
for (const f of [".claude-plugin/plugin.json", ".claude-plugin/marketplace.json", ".mcp.json"]) {
  if (!existsSync(f)) { errors.push(`${f}: missing`); continue; }
  try { JSON.parse(readFileSync(f, "utf8")); }
  catch (e) { errors.push(`${f}: invalid JSON — ${e.message}`); }
}

// 2. Each skill needs valid frontmatter with name + description.
const skillsDir = "skills";
if (!existsSync(skillsDir)) {
  errors.push("skills/: directory not found");
} else {
  const dirs = readdirSync(skillsDir).filter((e) => statSync(join(skillsDir, e)).isDirectory());
  if (dirs.length === 0) errors.push("skills/: no skill directories found");
  for (const name of dirs) {
    const file = join(skillsDir, name, "SKILL.md");
    if (!existsSync(file)) { errors.push(`${file}: missing`); continue; }
    const text = readFileSync(file, "utf8");
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) { errors.push(`${file}: missing or malformed frontmatter (expected --- ... ---)`); continue; }
    const fm = m[1];
    if (/\t/.test(fm)) errors.push(`${file}: frontmatter contains a tab character (invalid YAML)`);
    if (!/^name:\s*\S/m.test(fm)) errors.push(`${file}: frontmatter missing "name"`);
    if (!/^description:\s*\S/m.test(fm)) errors.push(`${file}: frontmatter missing "description"`);
  }
}

if (errors.length) {
  console.error("✖ Plugin checks failed:");
  for (const e of errors) console.error("  - " + e);
  process.exit(1);
}
console.log("✓ JSON valid and all skills have proper frontmatter.");
