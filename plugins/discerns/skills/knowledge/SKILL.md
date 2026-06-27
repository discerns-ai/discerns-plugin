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
