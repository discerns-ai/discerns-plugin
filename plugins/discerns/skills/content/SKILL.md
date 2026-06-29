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

## 6. Optional — check it sounds like them
When voice-fit really matters, consult the avatar's own digital self before finalizing: call `ask_avatar` with the draft inline (e.g. "Here's the draft: … does this sound like me? what would you change?"). Fold its feedback into the draft, and pass its `uncertain` items back to the user to confirm — that judgment is theirs, not the avatar's. It runs a considered, multi-step consult, so reach for it as a genuine alignment check, not a per-line tic.

## Invariants
- Voice ≠ facts. Never let style invent content.
- Separate known (retrieved), inferred (your synthesis), and missing (not in the brain).
- Don't start drafting before you have enough grounding or a clear caveat.
