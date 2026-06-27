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
