# Discerns Claude Code Plugin — Design

**Date:** 2026-06-27
**Status:** Approved for spec review
**Repo:** `discerns-plugin` (https://github.com/discerns-ai/discerns-plugin), local at `progetti/discerns/discerns-plugin`

## 1. Context & Problem

Discerns runs a hosted MCP server (the "digital brain") exposing four stores — **Knowledge**
(facts/expertise with provenance), **Entities** (people/orgs/projects = relationship memory),
**Styles** (the user's voice per context), and **Gaps** (a learning backlog) — plus
`get_avatar_summary` for orientation. It is a remote **HTTP MCP server with OAuth/PKCE auth**
(`https://mcp.discerns.ai/mcp`); per-user tokens decide read-only (`READ_OWN`) vs read-write
(`READ_WRITE_OWN`), and the server registers write tools only when the token allows.

Today the server also ships seven "satellite skills" as **MCP prompts**. MCP prompts are
*user-invoked* — the model cannot auto-load them — so they rarely fire and provide little value.
There is no packaged way for a Discerns user to get a working setup in Claude Code.

A **Claude Code plugin** solves both problems at once:

- It bundles a **remote MCP connection**, so install = zero-config connection (OAuth runs in the
  browser per user; no secrets are shipped).
- It ships **real skills** (`SKILL.md`), which the model **auto-invokes** based on their
  descriptions — the capability MCP prompts lack.

## 2. Goals & Non-Goals

**Goals**
- One-install setup for Discerns users in Claude Code: connection + skills.
- Five focused, auto-invoking skills covering the brain's capabilities.
- No secrets in the repo; per-user OAuth; graceful behavior on read-only tokens.
- The plugin is the **single authority** for client-facing skills (decided: start fresh; the old
  MCP-prompt skills are removed).

**Non-Goals (v1)**
- No bundled subagents, slash-command-only entries, or hooks (skills only; revisit later).
- No single-source sync tooling between `mcp-server/skills` and the plugin (skills live only in
  the plugin now).
- No AI-BE changes.
- Target is Claude Code; claude.ai-connector packaging is out of scope.

## 3. Architecture

### 3.1 Distribution model
One repo, `discerns-plugin`, is **both the plugin and its own single-plugin marketplace**.

User install flow:
```
/plugin marketplace add discerns-ai/discerns-plugin
/plugin install discerns@discerns
# first skill use → browser OAuth → done
```

### 3.2 Connection — bundled remote MCP server
`.mcp.json` declares the hosted server as an HTTP transport. Claude Code performs the OAuth/PKCE
flow per user on first use (the server already exposes `/.well-known/oauth-*` metadata). No tokens
or headers are stored in the repo.

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

### 3.3 Connection-agnostic skills
Skills refer to tools by **base name** (`search_knowledge`, `recall_entity`, `add_knowledge`, …),
never a hardcoded `mcp__discerns__…` prefix. The model routes a base-named tool to whichever
connected server provides it, so the skills work whether the brain is connected via this plugin or
via a separately-added Discerns connector. (The `mcp__<server>__<tool>` form is mentioned in the
README only as a note.)

### 3.4 Permissions / graceful degradation
On a read-only token the server omits write tools. Write-dependent skills must detect the missing
tool and tell the user how to upgrade their token in the Discerns dashboard — never hard-fail.

### 3.5 File structure
```
discerns-plugin/
├── .claude-plugin/
│   ├── plugin.json          # name: "discerns"
│   └── marketplace.json     # self-hosted single-plugin catalog
├── .mcp.json                # remote http server "discerns"
├── skills/
│   ├── content/SKILL.md
│   ├── knowledge/SKILL.md
│   ├── people/SKILL.md
│   ├── gaps/SKILL.md
│   └── voice/SKILL.md
├── README.md                # install + per-skill usage + token/permission notes
├── LICENSE
└── docs/superpowers/specs/2026-06-27-discerns-plugin-design.md
```

### 3.6 Manifest (illustrative)
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

> **Verify at implementation time:** the exact `marketplace.json` schema for a plugin that lives in
> the *same repo* as the marketplace (likely `"source": "./"` or `{"source":"github","repo":"discerns-ai/discerns-plugin"}`).
> Confirm against the official Claude Code plugin docs before publishing.

## 4. Skill Set (5 skills)

Decomposition rationale: one skill per store, plus a cross-cutting content skill. This mirrors the
"four stores" model the MCP `instructions` already teach, which keeps triggers unambiguous and each
skill self-contained. A single "remember-anything" router skill was rejected — capture is routed
inside each store skill instead.

Skills are namespaced by the plugin, invoked as `/discerns:<name>`; auto-invocation is driven by the
`description`. Names are short by design (`content`, not `discerns-content`) to avoid `discerns:discerns-*`.

### 4.1 `content` — Create in your voice (flagship)
- **Description (trigger):** "Draft content in the user's own voice, grounded in their Discerns
  brain. Use when asked to write or draft a post, email, memo, brief, one-pager, or outline that
  should sound like them and reflect what they actually know."
- **Tools:** `search_knowledge`, `recall_style` (fallback `default`), `recall_entity`,
  `get_avatar_summary` (optional, for avatar framing). Read-mostly.
- **Workflow:** clarify artifact (type, audience, outcome, angle, length) → decompose into 3–7
  source questions → `search_knowledge` (hybrid by default) keeping source titles on every claim →
  pull voice via `recall_style` for the context → if audience is a known person/org, `recall_entity`
  → draft using supported claims only; mark inferences; flag missing facts.
- **Invariants:** voice shapes wording, never invents facts; keep provenance; separate
  known/inferred/missing.
- **Boundary vs `knowledge`:** `content` produces an artifact; `knowledge` answers a question.

### 4.2 `knowledge` — Ask & add knowledge
- **Description (trigger):** "Answer questions strictly from the user's Discerns knowledge base with
  provenance, and add new facts to it. Use for 'what do we know about X?', 'answer this from my
  knowledge', or 'add this to my brain.'"
- **Tools:** `search_knowledge` (read), `add_knowledge` (write).
- **Workflow (ask):** `search_knowledge` with a concrete goal + paraphrases + fitting strategy →
  answer only from retrieved claims with source titles → if empty, say "not in your brain" and offer
  to file a gap (defer to `gaps`/`add_knowledge_gap`). **Workflow (add):** confirm it is reusable
  knowledge (not a person fact or one-off) → `add_knowledge`.
- **Invariants:** never fabricate; "not found" is a valid answer; person/org facts go to `people`,
  not here.
- **Read-only:** ask works; add explains the upgrade path.

### 4.3 `people` — Relationship memory (CRM)
- **Description (trigger):** "Recall and maintain relationship memory about people, organizations,
  projects, products, and events. Use for 'who is X?', 'prep me for my meeting with X', 'log that I
  met X', or capturing someone's role, contact info, or an interaction."
- **Tools:** `recall_entity`, `search_entities` (read); `create_entity`, `update_entity`,
  `log_interaction`, `delete_interaction`, `forget_entity` (write).
- **Workflow:** recall/search first (always, before any write) → answer from identifiers, relations,
  inverse relations, interactions → for capture: create only after no real match (review
  `similarEntities`); updates use **full-replace** semantics for identifiers/relations; log dated
  events via `log_interaction`.
- **Invariants:** recall before write; full-replace lists; never guess interaction ids; confirm
  before `forget_entity`; one meeting note is an interaction, not KB knowledge.
- **Read-only:** recall works; capture explains the upgrade path.

### 4.4 `gaps` — Grow your brain (learning backlog)
- **Description (trigger):** "Review and fill the user's Discerns learning backlog. Use for 'what
  should I teach my brain?', 'interview me', or 'review/clean up my gaps.'"
- **Tools:** `search_knowledge_gaps`, `get_random_knowledge_gap` (read); `add_knowledge` (fill),
  `ignore_knowledge_gap` (write).
- **Workflow:** surface gaps (random or searched) → interview the user one question at a time →
  `add_knowledge` from answers → never mark a gap "answered" (the platform closes it after
  processing) → `ignore_knowledge_gap` only with explicit confirmation.
- **Invariants:** gaps are not "answered" by ingestion; `ignore` requires confirmation and is not a
  substitute for answering.
- **Read-only:** review works; fill/ignore explain the upgrade path.

### 4.5 `voice` — Define your voice
- **Description (trigger):** "Define and manage how the user's avatar writes and speaks per context.
  Use for 'set up how I sound', 'update my writing style', or 'manage my voice profiles.'"
- **Tools:** `recall_style`, `search_styles` (read); `create_style`, `update_style` (write).
  Reserved slug `default` = the avatar's base speaking style (`update_style "default"` replaces it;
  create/forget refuse the slug).
- **Workflow:** recall existing style(s) → for the base voice use the `default` slug → create named
  styles for specific contexts (email, post, chat) → on update, compare old vs new and confirm
  material changes.
- **Invariants:** style is wording, not facts; respect the reserved `default` slug rules.
- **Read-only:** recall works; create/update explain the upgrade path.

## 5. Quality Conventions (so these don't repeat past mistakes)

- **Shared invariants live in the MCP `instructions`** (auto-loaded on connect). Each skill restates
  only the 1–2 invariants critical to it, rather than re-teaching the whole brain model.
- **Trigger-first descriptions.** The `description` carries the real "use when…" phrasing — that is
  what makes auto-invocation fire. Bodies are short, imperative, numbered steps. No walls of text.
- **Graceful read-only degradation** everywhere a write tool may be absent.
- **Provenance & honesty:** keep source titles on claims; separate known / inferred / missing;
  "not in your brain" is acceptable.
- **Voice ≠ facts.**
- **Clear boundaries** between skills (ask vs create; person-fact vs general-knowledge) to avoid
  trigger overlap.

## 6. Related change — mcp-server cleanup (separate repo/PR)

Remove the seven prompt skills under `mcp-server/skills/` and keep the loader infrastructure
(`features/prompts/facade.ts`, `registerSatelliteSkillsPrompts`) intact so the server simply
registers no prompts. This is a small change to the **mcp-server** repo (branch `master`, its own
commit/PR), tracked here but not part of the plugin repo. Verify with `bunx tsc --noEmit`.

> Note: `mcp-server/src/build-instructions.ts` reads `skills/skill.md` for base instructions. Confirm
> whether `skill.md` is one of the files to remove or must be preserved; do not break
> `loadBaseInstructions()`.

## 7. Distribution, Install & Verification

- **Local dev test:** `claude --plugin-dir ./discerns-plugin` → confirm the 5 skills list, the
  `discerns` MCP server connects, OAuth completes, and at least one skill auto-triggers on a natural
  prompt.
- **Manifest validation:** `claude plugin validate` (if available in the installed CLI).
- **No typecheck/tests** apply to the plugin (markdown + JSON). For the mcp-server cleanup, verify
  with `bunx tsc --noEmit`.
- **Publish:** push to `main`; users add the marketplace from the GitHub repo.

## 8. Open Items / Risks

1. **marketplace.json same-repo source syntax** — verify exact form against official docs before
   publishing (see §3.6).
2. **`get_avatar_summary` usage** — confirm it is the right orientation call for `content`/`voice`
   framing, or rely solely on MCP instructions.
3. **mcp-server `skill.md`** — confirm it is preserved during cleanup (base instructions depend on it).
4. **Remote push auth** — new repo already exists on GitHub with a `main` branch; gh CLI is absent,
   so push uses the credential-manager token (no token printed).
5. **Skill over/under-triggering** — short names rely on descriptions; validate triggering with a few
   real prompts during the local dev test.

## 9. Verification of "done"

- All 5 skills load and are individually invokable (`/discerns:<name>`) and auto-trigger on natural
  prompts.
- The `discerns` MCP server connects via the plugin and OAuth succeeds.
- A read-only account sees recall/ask/review work and gets a clear upgrade message on write attempts.
- mcp-server cleanup merged, `bunx tsc --noEmit` clean, base instructions still load.
