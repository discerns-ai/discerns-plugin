# Discerns Claude Code Plugin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the official Discerns Claude Code plugin — a single repo that is both the plugin and its own marketplace, bundling a remote OAuth MCP connection plus five auto-invoking skills over the Discerns digital brain.

**Architecture:** The repo root is the plugin (`.claude-plugin/plugin.json`) and the marketplace (`.claude-plugin/marketplace.json`, `source: "./"`). `.mcp.json` declares the hosted Discerns server over HTTP; Claude Code runs OAuth/PKCE per user. Five skills under `skills/` reference the brain's tools by base name and auto-invoke on natural prompts.

**Tech Stack:** Markdown (SKILL.md) + JSON (manifest, marketplace, mcp). No build, no automated tests. Verification = JSON validity + `claude plugin validate .` + a manual load/OAuth test in a real Claude Code client. Separate cleanup in the `mcp-server` repo (Bun/TypeScript, verified with `bunx tsc --noEmit`).

## Global Constraints

- Plugin name is exactly `discerns`; skills invoke as `/discerns:<name>`.
- Production MCP endpoint: `https://mcp.discerns.ai/mcp` (transport `http`; OAuth handled by the client). **No tokens, secrets, or headers in the repo.**
- Skills reference MCP tools by **base name** (`search_knowledge`, `recall_entity`, …), never an `mcp__discerns__…` prefix — keeps them connection-agnostic.
- Components live at the **plugin root** (`skills/`, `.mcp.json`); only `plugin.json`/`marketplace.json` go in `.claude-plugin/`.
- Skill descriptions are trigger-first ("Use when…"); bodies are short, numbered, imperative. No walls of text.
- Write-dependent skills **degrade gracefully** on read-only tokens (explain the dashboard upgrade path; never hard-fail).
- Voice shapes wording, never facts. Keep provenance on claims; separate known / inferred / missing.
- `version` is `0.1.0`; because it is set, it must be bumped on every release for users to receive updates.
- All work happens on branch `feat/discerns-plugin-v1` (already created, holds the spec). The `mcp-server` cleanup is a **separate repo**, branched from `master`.

---

## File Structure

Created in `discerns-plugin` (this repo):
- `.claude-plugin/plugin.json` — plugin manifest (metadata only; components auto-discovered).
- `.claude-plugin/marketplace.json` — single-plugin self-hosted marketplace, `source: "./"`.
- `.mcp.json` — remote HTTP Discerns server named `discerns`.
- `skills/content/SKILL.md` — create artifacts in the user's voice (read-mostly).
- `skills/knowledge/SKILL.md` — grounded Q&A + add knowledge.
- `skills/people/SKILL.md` — relationship memory (recall + capture).
- `skills/gaps/SKILL.md` — learning-backlog interview.
- `skills/voice/SKILL.md` — manage voice/style profiles.
- `README.md` — install, per-skill usage, auth/permission notes, dev/test, versioning.
- `LICENSE` — MIT.
- `.gitignore` — OS/editor noise.

Modified in `mcp-server` (separate repo, Task 7):
- Delete `skills/discerns-*` (7 dirs); replace `skills/README.md` with a pointer. Loader (`src/features/prompts/facade.ts`) and base instructions (`src/skill.md`) untouched.

---

## Task 1: Plugin manifest, marketplace, and MCP connection

**Files:**
- Create: `.claude-plugin/plugin.json`
- Create: `.claude-plugin/marketplace.json`
- Create: `.mcp.json`
- Create: `LICENSE`
- Create: `.gitignore`

**Interfaces:**
- Produces: marketplace name `discerns`, plugin name `discerns`, MCP server key `discerns` (→ tools also reachable as `mcp__discerns__<tool>`; skills use base names).

- [ ] **Step 1: Create `.claude-plugin/plugin.json`**

```json
{
  "name": "discerns",
  "version": "0.1.0",
  "description": "Turn your Discerns digital brain into auto-invoking Claude skills: write in your voice, manage relationships, capture and recall knowledge, and grow your brain.",
  "author": { "name": "Discerns", "url": "https://discerns.ai" },
  "homepage": "https://github.com/discerns-ai/discerns-plugin",
  "repository": "https://github.com/discerns-ai/discerns-plugin",
  "license": "MIT",
  "keywords": ["discerns", "digital-brain", "knowledge", "crm", "content", "voice", "mcp"]
}
```

- [ ] **Step 2: Create `.claude-plugin/marketplace.json`**

```json
{
  "name": "discerns",
  "owner": { "name": "Discerns", "email": "info@discerns.ai" },
  "description": "The official Discerns plugin: connect your digital brain and use it through auto-invoking skills.",
  "plugins": [
    {
      "name": "discerns",
      "source": "./",
      "description": "Write in your voice, manage relationships, capture and recall knowledge, and grow your brain — powered by your Discerns digital brain.",
      "homepage": "https://github.com/discerns-ai/discerns-plugin",
      "license": "MIT",
      "keywords": ["discerns", "digital-brain", "knowledge", "crm", "content", "voice", "mcp"]
    }
  ]
}
```

- [ ] **Step 3: Create `.mcp.json`**

```json
{
  "mcpServers": {
    "discerns": {
      "type": "http",
      "url": "https://mcp.discerns.ai/mcp"
    }
  }
}
```

- [ ] **Step 4: Create `LICENSE` (MIT)**

```text
MIT License

Copyright (c) 2026 Discerns

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 5: Create `.gitignore`**

```text
.DS_Store
Thumbs.db
*.log
node_modules/
```

- [ ] **Step 6: Verify JSON validity**

Run (Git Bash):
```bash
for f in .claude-plugin/plugin.json .claude-plugin/marketplace.json .mcp.json; do
  node -e "JSON.parse(require('fs').readFileSync('$f','utf8')); console.log('OK $f')" || echo "FAIL $f"
done
```
Expected: `OK` for all three.

- [ ] **Step 7: Validate the marketplace/manifest (in a Claude Code terminal)**

Run: `claude plugin validate .`
Expected: passes (no schema errors). Warnings about kebab-case or descriptions are acceptable. If `claude` is unavailable in the execution environment, defer this to the Task 6 acceptance checklist.

- [ ] **Step 8: Commit**

```bash
git -C "C:/Users/specy/Desktop/progetti/discerns/discerns-plugin" add .claude-plugin/plugin.json .claude-plugin/marketplace.json .mcp.json LICENSE .gitignore
git -C "C:/Users/specy/Desktop/progetti/discerns/discerns-plugin" commit -m "feat(plugin): manifest, marketplace, and remote MCP connection"
```

---

## Task 2: The five skills

**Files:**
- Create: `skills/content/SKILL.md`
- Create: `skills/knowledge/SKILL.md`
- Create: `skills/people/SKILL.md`
- Create: `skills/gaps/SKILL.md`
- Create: `skills/voice/SKILL.md`

**Interfaces:**
- Consumes: MCP tools from the `discerns` server (base names): `search_knowledge`, `add_knowledge`, `recall_entity`, `search_entities`, `create_entity`, `update_entity`, `log_interaction`, `delete_interaction`, `forget_entity`, `recall_style`, `search_styles`, `create_style`, `update_style`, `get_random_knowledge_gap`, `search_knowledge_gaps`, `ignore_knowledge_gap`, `get_avatar_summary`.
- Produces: five auto-invoking skills namespaced `/discerns:<name>`.

- [ ] **Step 1: Create `skills/content/SKILL.md`**

```markdown
---
name: content
description: Draft content in the user's own voice, grounded in their Discerns digital brain. Use when the user asks to write or draft a post, email, memo, brief, one-pager, announcement, or outline that should sound like them and reflect what they actually know.
---

# Create in your voice

Produce work artifacts grounded in the user's Discerns knowledge base and written in their voice. Sourced claims stay traceable; inferred copy stays honest; voice shapes wording, never facts.

## 1. Scope the artifact
Capture only what the draft needs (pick sensible defaults if the user is brief): type (post, email, memo, brief, one-pager, outline), audience, desired outcome, angle/thesis, length. These are artifact details, not brain memory — never store them as knowledge or as a gap.

## 2. Gather facts (grounding)
Decompose the artifact into 3–7 source questions. For each, call `search_knowledge` with a concrete `goal`, 2–3 paraphrases, and a fitting strategy: `hybrid` by default, `text` for exact terms, `semantic` for concept mismatch, `agentic` only for genuine cross-document synthesis. Keep the source title on every claim you carry forward. Collapse duplicates but never strip provenance.

## 3. Gather voice
Call `recall_style` for the relevant context (e.g. "email", "linkedin"). If none fits, recall the reserved `default` style for the avatar's base voice. Apply tone, phrasing, and structure — not new facts.

## 4. Know the audience (when named)
If the artifact targets a specific person or organization, call `recall_entity` to ground references in real relationship facts before drafting.

## 5. Draft
- Use supported claims only; mark any inference clearly (e.g. "[assumption]").
- Flag missing facts the draft needs instead of inventing them.
- Match the recalled voice.
Return the draft, then a short "Sources & gaps" note: claims used (with titles), assumptions made, and facts still needed.

## Invariants
- Voice ≠ facts. Never let style invent content.
- Separate known (retrieved), inferred (your synthesis), and missing (not in the brain).
- Don't start drafting before you have enough grounding or a clear caveat.
```

- [ ] **Step 2: Create `skills/knowledge/SKILL.md`**

```markdown
---
name: knowledge
description: Answer questions strictly from the user's Discerns knowledge base with provenance, and capture new facts into it. Use for "what do we/I know about X?", "answer this from my knowledge", "is X in my brain?", or "remember/add this fact" when the fact is general knowledge (not about a specific person/org, and not an open question).
---

# Ask & add knowledge

The knowledge base holds the user's facts and expertise. Retrieve before answering; capture only reusable knowledge.

## Asking (read)
1. Call `search_knowledge` with a concrete `goal`, 2–3 paraphrases, and a fitting strategy (`hybrid` default; `text` exact; `semantic` concept; `agentic` only for cross-document synthesis).
2. Answer only from retrieved claims, each with its source title. Keep known vs inferred separate.
3. If nothing relevant returns, say plainly "that's not in your brain" — do not fabricate. Offer to capture it now (add) or file it as a gap to learn later (the gaps skill / `add_knowledge_gap`).

## Adding (write)
1. Confirm the item is reusable knowledge — a fact, definition, position, or process. Facts about a specific person/org belong in the people skill; one-off task details belong nowhere global.
2. Recall first (`search_knowledge`) to avoid duplicating an existing entry.
3. Call `add_knowledge` with the fact stated cleanly.

## Invariants
- "Not found" is a valid, useful answer.
- Never invent facts or provenance.
- Person/org facts → people skill. Open questions only the user can answer → gaps skill.

## Read-only accounts
If `add_knowledge` is unavailable, the token is read-only. Asking still works; tell the user they can enable writing by upgrading their API token in the Discerns dashboard.
```

- [ ] **Step 3: Create `skills/people/SKILL.md`**

```markdown
---
name: people
description: Recall and maintain the user's Discerns relationship memory — people, organizations, projects, products, and events. Use for "who is X?", "prep me for my meeting/email with X", "remember that <person> is …", "log that I met/spoke with X", or updating someone's role, contact info, or history.
---

# Relationship memory

Entity memory is the social and organizational context of the brain: who people and companies are, how they connect, and what has happened over time. Reach for it (before the knowledge base) whenever the subject is a specific person, org, account, project, product, or event.

## Recall first — always
Before answering about someone, and before ANY write, call `recall_entity { query }` (exact slug, name, email, phone, handle, or short phrase) for the one best match, or `search_entities` to browse/filter candidates. Verify with identifiers (email, domain, handle) for common names; if unsure between candidates, ask which one.

## Answer
Answer from identifiers, relations, inverse relations (incoming links), description, and recent interactions. If not found, say so rather than guessing.

## Capture (write)
- New entity: only after recall/search finds no real match. Choose a lowercase-hyphenated `slug`; set `name`, `type` (PERSON, ORGANIZATION, PRODUCT, LOCATION, EVENT, PROJECT, OTHER), `description`, `identifiers`, `relations`. Review the returned `similarEntities` for accidental duplicates.
- Update: `update_entity` changes only the fields you pass. `identifiers` and `relations` are FULL-REPLACE — recall, append to the existing set, send the complete list. Omit a field to leave it unchanged.
- Interaction: `log_interaction { slug, name, summary, happenedAt? }` for a dated event (meeting, call, decision, commitment). A single meeting note is an interaction, not knowledge-base content.

## Careful / irreversible
- `forget_entity` permanently deletes the entity and its identifiers, relations, and interactions — name the entity and confirm before calling.
- `delete_interaction` needs the exact numeric `interactionId` from a recall — never guess it.

## Invariants
- Recall before any write. Full-replace identifiers/relations. Don't store meeting prep as global knowledge.

## Read-only accounts
If create/update/log tools are unavailable, the token is read-only. Recall still works; tell the user they can enable writing by upgrading their API token in the Discerns dashboard.
```

- [ ] **Step 4: Create `skills/gaps/SKILL.md`**

```markdown
---
name: gaps
description: Review and fill the user's Discerns learning backlog (knowledge gaps). Use for "what should I teach my brain?", "interview me", "what's my brain missing?", or "review/clean up my gaps".
---

# Grow your brain

Gaps are the open questions only the user can answer — the brain's learning backlog. This skill turns them into captured knowledge through a short interview.

## Surface gaps
- `get_random_knowledge_gap` for a quick "what should I teach next?" prompt, or
- `search_knowledge_gaps { query }` to focus on a topic the user names.

## Interview
Ask the user the gap's question in plain language, ONE question at a time. Keep it conversational; don't dump a list. Use their answer as the source.

## Capture answers
Call `add_knowledge` with the answer as a clean, reusable fact. Do NOT mark the gap "answered" — the platform closes a gap automatically after it processes the new knowledge.

## Dismiss out-of-scope gaps
If a gap is irrelevant or wrong, call `ignore_knowledge_gap` — but only after the user explicitly confirms. Ignoring is not a way to "answer" a gap.

## Invariants
- Never treat a gap as answered via ingestion; ingest and let the platform close it.
- `ignore_knowledge_gap` requires explicit user confirmation.
- One question at a time.

## Read-only accounts
If `add_knowledge` / `ignore_knowledge_gap` are unavailable, the token is read-only. You can still review gaps; tell the user they can enable writing by upgrading their API token in the Discerns dashboard.
```

- [ ] **Step 5: Create `skills/voice/SKILL.md`**

```markdown
---
name: voice
description: Define and manage how the user's Discerns avatar writes and speaks per context. Use for "set up how I sound", "update my writing style", "create a voice for emails/LinkedIn", or "manage my voice profiles". To write content in an existing voice, use the content skill instead.
---

# Define your voice

Styles capture how the user writes per context (email, post, chat, …). They shape wording and tone — never facts. The reserved slug `default` is the avatar's base speaking style.

## Recall first
Call `search_styles` to list existing styles, or `recall_style { query }` for one. Recall `default` to see the base voice. Always recall before updating so you extend rather than overwrite blindly.

## The base voice (`default`)
- `recall_style "default"` returns the avatar's base speaking style (may be empty on first setup).
- `update_style "default"` replaces it and returns the previous and current values — show the user what changed and confirm material rewrites.
- `create_style` / `forget_style` refuse the `default` slug; it can only be updated.

## Named styles
For a specific context, `create_style` with a clear slug (e.g. `email`, `linkedin`, `support-reply`), a title, a short summary, and the style guidance. Use `update_style` to refine; pass only the fields you want to change.

## Write good style guidance
Describe tone, sentence length, formality, vocabulary, do/don't patterns, and a short example — concrete, not abstract. Keep it about wording, not subject-matter facts.

## Invariants
- Style is wording, not facts.
- Respect the reserved `default` slug (update-only).

## Read-only accounts
If create/update tools are unavailable, the token is read-only. You can still review styles; tell the user they can enable writing by upgrading their API token in the Discerns dashboard.
```

- [ ] **Step 6: Verify skill frontmatter**

Run (Git Bash):
```bash
for s in content knowledge people gaps voice; do
  f="skills/$s/SKILL.md"
  head -1 "$f" | grep -q '^---$' && grep -q '^name: '"$s"'$' "$f" && grep -q '^description: ' "$f" \
    && echo "OK $f" || echo "FAIL $f"
done
```
Expected: `OK` for all five.

- [ ] **Step 7: Commit**

```bash
git -C "C:/Users/specy/Desktop/progetti/discerns/discerns-plugin" add skills/
git -C "C:/Users/specy/Desktop/progetti/discerns/discerns-plugin" commit -m "feat(skills): content, knowledge, people, gaps, voice"
```

---

## Task 3: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# Discerns plugin for Claude Code

Turn your [Discerns](https://discerns.ai) digital brain into auto-invoking Claude skills. Install once, authenticate in your browser, and Claude can write in your voice, manage your relationships, capture and recall your knowledge, and help grow your brain — using your Discerns account under the hood.

## Install

```
/plugin marketplace add discerns-ai/discerns-plugin
/plugin install discerns@discerns
```

The first time a skill needs your brain, Claude Code opens your browser to sign in to Discerns (OAuth). Nothing is stored in this repo — you authenticate with your own account.

## Skills

| Skill | What it does | Example prompts |
| --- | --- | --- |
| `/discerns:content` | Draft posts, emails, memos, briefs, and outlines grounded in your facts and written in your voice. | "Draft a LinkedIn post about our onboarding approach." |
| `/discerns:knowledge` | Answer questions strictly from your knowledge base (with sources), and add new facts. | "What do we know about enterprise SSO?" · "Add this to my brain." |
| `/discerns:people` | Recall who someone is before you act, and capture people, orgs, and interactions after. | "Who is elena@acme.com?" · "Log that I met Acme today." |
| `/discerns:gaps` | Review your learning backlog and fill it through a short interview. | "What should I teach my brain next?" |
| `/discerns:voice` | Define and manage how you sound per context. | "Set up my email voice." |

Skills also auto-invoke when your request matches — you don't have to call them by name.

## Permissions

Your Discerns API token decides what's possible:

- **Read-only token:** asking, recalling, and reviewing work everywhere.
- **Read-write token:** also enables capturing knowledge, managing people, filling gaps, and editing your voice.

If a skill needs write access you don't have, it will tell you. Upgrade your token in the Discerns dashboard.

## Develop & test locally

```
# Load the plugin straight from a local checkout
claude --plugin-dir .

# Validate manifest + marketplace
claude plugin validate .
```

Edit a `SKILL.md` and the change takes effect in the current session; changes to `.mcp.json` need `/reload-plugins` or a restart.

## Versioning

`version` is set in `.claude-plugin/plugin.json`. Bump it on every release so installed users receive the update. (Omit it to use the git commit SHA instead, which auto-updates on every commit.)

## License

MIT — see [LICENSE](LICENSE).
```

> Note: the fenced code blocks inside this README use triple backticks. When creating the file, reproduce them exactly as shown (they are part of the README content).

- [ ] **Step 2: Commit**

```bash
git -C "C:/Users/specy/Desktop/progetti/discerns/discerns-plugin" add README.md
git -C "C:/Users/specy/Desktop/progetti/discerns/discerns-plugin" commit -m "docs(readme): install, skills, permissions, dev/test"
```

---

## Task 4: Commit the plan, then verify the whole plugin

**Files:** none created; verification + integration.

- [ ] **Step 1: Commit this plan**

```bash
git -C "C:/Users/specy/Desktop/progetti/discerns/discerns-plugin" add docs/superpowers/plans/2026-06-27-discerns-plugin.md
git -C "C:/Users/specy/Desktop/progetti/discerns/discerns-plugin" commit -m "docs(plan): implementation plan for the Discerns plugin"
```

- [ ] **Step 2: Confirm the final tree**

Run (Git Bash):
```bash
cd "C:/Users/specy/Desktop/progetti/discerns/discerns-plugin" && git ls-files | sort
```
Expected to include: `.claude-plugin/marketplace.json`, `.claude-plugin/plugin.json`, `.mcp.json`, `LICENSE`, `README.md`, `skills/content/SKILL.md`, `skills/gaps/SKILL.md`, `skills/knowledge/SKILL.md`, `skills/people/SKILL.md`, `skills/voice/SKILL.md`, and the two docs files.

- [ ] **Step 3: Manual acceptance checklist (run in a real Claude Code client)**

These require an interactive Claude Code client and a Discerns account; record results.
- [ ] `claude plugin validate .` passes.
- [ ] `claude --plugin-dir .` then `/plugin` (or `claude plugin details discerns`) lists all 5 skills and the `discerns` MCP server.
- [ ] A natural prompt auto-triggers the right skill (e.g. "what does my brain know about X?" → `discerns:knowledge`).
- [ ] First brain call opens the browser OAuth flow and, after sign-in, returns real data.
- [ ] On a read-only account, a write request (e.g. "remember this fact") produces the upgrade-path message instead of an error.

- [ ] **Step 4: Push the branch**

```bash
git -C "C:/Users/specy/Desktop/progetti/discerns/discerns-plugin" push -u origin feat/discerns-plugin-v1
```

- [ ] **Step 5: Open a PR into `main`**

`gh` is not installed. Create the PR via the Git Credential Manager token + GitHub REST API (per repo workflow notes). Never print the token. Title: `feat: Discerns Claude Code plugin (v0.1.0)`. Body: summary of the plugin + the acceptance checklist results.

> Alternatively, if the user prefers, fast-forward `main` to this branch directly. Confirm with the user before merging.

---

## Task 5: Remove satellite skills from the `mcp-server` repo (separate repo)

**Files (in `C:/Users/specy/Desktop/progetti/discerns/mcp-server`):**
- Delete: `skills/discerns-avatar-style/`, `skills/discerns-content-brief/`, `skills/discerns-cowork-guidance/`, `skills/discerns-entity-memory/`, `skills/discerns-gap-triage/`, `skills/discerns-kb-diagnostics/`, `skills/discerns-memory-capture/`
- Replace: `skills/README.md`
- Untouched: `src/features/prompts/facade.ts` (loader), `src/skill.md` (base instructions)

**Interfaces:**
- Consumes: `loadSkillsAsync()` reads the `skills/` dir; with no skill subdirectories it returns `[]`, so `registerSatelliteSkillsPrompts` registers nothing. The `skills/` directory must continue to exist so `readdir` does not throw.

- [ ] **Step 1: Branch from `master`**

```bash
git -C "C:/Users/specy/Desktop/progetti/discerns/mcp-server" checkout master
git -C "C:/Users/specy/Desktop/progetti/discerns/mcp-server" pull --ff-only
git -C "C:/Users/specy/Desktop/progetti/discerns/mcp-server" checkout -b chore/remove-satellite-skills
```

- [ ] **Step 2: Delete the seven skill directories**

```bash
cd "C:/Users/specy/Desktop/progetti/discerns/mcp-server"
git rm -r skills/discerns-avatar-style skills/discerns-content-brief skills/discerns-cowork-guidance \
            skills/discerns-entity-memory skills/discerns-gap-triage skills/discerns-kb-diagnostics \
            skills/discerns-memory-capture
```

- [ ] **Step 3: Replace `skills/README.md` with a pointer**

```markdown
# Satellite skills (removed)

The MCP "satellite skill" prompts that used to live here have been removed. Client-facing
skills now ship in the Discerns Claude Code plugin: https://github.com/discerns-ai/discerns-plugin

The loader in `src/features/prompts/facade.ts` is intentionally kept: it scans this directory and
registers any `*/SKILL.md` it finds as MCP prompts. With no skill subdirectories present it simply
registers nothing. Drop a `<name>/SKILL.md` here to expose a server-side prompt again.

Base server instructions are unrelated to this directory — they live in `src/skill.md`.
```

- [ ] **Step 4: Verify the loader still type-checks and the dir still resolves**

Run:
```bash
cd "C:/Users/specy/Desktop/progetti/discerns/mcp-server" && bunx tsc --noEmit && echo "TYPECHECK OK"
ls skills/   # must still exist (contains only README.md)
```
Expected: `TYPECHECK OK`; `skills/` lists `README.md`.

- [ ] **Step 5: Commit**

```bash
git -C "C:/Users/specy/Desktop/progetti/discerns/mcp-server" add skills/
git -C "C:/Users/specy/Desktop/progetti/discerns/mcp-server" commit -m "chore(skills): remove satellite-skill prompts; skills move to discerns-plugin

The model cannot auto-load MCP prompts, so the satellite skills provided little
value. Client-facing skills now ship in the discerns-plugin repo. The prompt
loader is retained and simply registers nothing when no SKILL.md is present."
```

- [ ] **Step 6: Push and open a PR into `master`** (REST API + credential token; never print it). Confirm with the user before merging, and remember AI-BE/mcp-server deploy ordering is irrelevant here (no API surface changed).

---

## Self-Review

**Spec coverage:**
- §3.1 distribution (repo = plugin + marketplace) → Task 1 (plugin.json, marketplace.json `source: "./"`).
- §3.2 remote MCP/OAuth → Task 1 (.mcp.json http, no secrets).
- §3.3 connection-agnostic base-name tools → Global Constraints + every skill in Task 2.
- §3.4 graceful read-only degradation → "Read-only accounts" section in knowledge/people/gaps/voice (Task 2).
- §3.5 file structure → Tasks 1–3 file set.
- §4.1–4.5 the five skills → Task 2 Steps 1–5.
- §5 quality conventions → trigger-first descriptions + invariants in each skill; provenance/known-inferred-missing in content/knowledge.
- §6 mcp-server cleanup → Task 5 (loader + `src/skill.md` confirmed untouched).
- §7 install/verify → README (Task 3) + Task 4 acceptance checklist.
- §8 open items: marketplace same-repo source resolved (`source: "./"`); `get_avatar_summary` used as optional context in content; `skill.md` confirmed separate from `skills/`.

**Placeholder scan:** No TBD/TODO. All file contents are complete and copy-pasteable. The PR-creation steps reference the established REST-API pattern rather than inlining a token (correct, not a placeholder).

**Type/name consistency:** Plugin name `discerns`, marketplace name `discerns`, MCP server key `discerns`, install `discerns@discerns`, skill dir names == frontmatter `name` (`content`/`knowledge`/`people`/`gaps`/`voice`), tool base names match the Discerns MCP surface. Consistent throughout.
