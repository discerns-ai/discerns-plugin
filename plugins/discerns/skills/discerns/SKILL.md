---
name: discerns
description: Entry point and router for the user's Discerns digital brain. Use to get an overview of what the brain contains and can do, to orient at the start of brain-related work, or to route a request to the right Discerns skill (content, knowledge, people, gaps, voice) when it's unclear which one applies. Triggers on "/discerns", "what can my brain do?", "what's in my Discerns?", or "help me use my brain".
---

# Discerns — your digital brain (hub)

Discerns is the user's digital brain, reached over MCP. This skill is the front door: it orients using the brain's own summary, explains what's available, and routes to the focused skill that does the work.

## What the brain holds (four stores)
- **Knowledge** — the user's facts and expertise, with provenance.
- **Entities** — relationship memory: people, orgs, projects, products, events, and their interaction timelines.
- **Styles** — how the user writes and speaks per context (the `default` slug is their base voice).
- **Gaps** — the learning backlog: open questions only the user can answer.

## 1. Orient first — always
Call `get_avatar_summary`. It returns the avatar's identity, role, voice, knowledge categories, and the index of stored entities and styles (slugs you can recall directly). Read it before guiding or routing, and use it to ground your answers in what this brain actually contains. Give the user a short, plain-language overview of what their brain knows and how it's set up.

If `get_avatar_summary` returns nothing or fails, the brain may be empty or not connected — say so and help the user connect it or start filling it.

## 2. Route to the right skill
Match the user's intent, then follow that skill:

| The user wants to… | Skill |
| --- | --- |
| Write or draft something in their voice (post, email, memo, brief, outline) | `discerns:content` |
| Ask what they know, or add a fact to the brain | `discerns:knowledge` |
| Recall who someone is, prep for a meeting, or log/update a person, org, or interaction | `discerns:people` |
| See what to teach the brain next, or be interviewed to fill gaps | `discerns:gaps` |
| Define or change how they sound per context | `discerns:voice` |

If the request is clear, route straight to the matching skill and carry on. If it spans several (e.g. "prep for my meeting with Acme and draft the follow-up"), do them in order (people → content). If the user only wants an overview, give the summary from step 1 plus this menu and ask what they'd like to do.

## Good to know (metadata)
- Connection: the `discerns` MCP server (`discerns-mcp`) over per-user OAuth — each user works against their own account.
- Permissions: reading, recalling, and reviewing always work; capturing and editing need a read-write token (the focused skills explain the upgrade path when a write tool is missing).
- This hub doesn't duplicate the focused skills' work — it orients and hands off.
