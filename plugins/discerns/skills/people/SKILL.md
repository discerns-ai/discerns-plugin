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
