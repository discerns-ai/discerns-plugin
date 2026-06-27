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
