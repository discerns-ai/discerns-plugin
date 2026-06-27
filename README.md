<p align="center">
  <img src="plugins/discerns/assets/logo.svg" alt="Discerns" width="220">
</p>

# Discerns plugins

The official marketplace for [Discerns](https://discerns.ai) Claude Code plugins — connect your digital brain and work through auto-invoking skills.

## Install

```
/plugin marketplace add discerns-ai/discerns-plugin
/plugin install discerns@discerns
```

The first time a skill needs your brain, Claude Code opens your browser to sign in to Discerns (OAuth). No secrets are stored in this repo — you authenticate with your own account.

## Plugins

| Plugin | Install | What it does |
| --- | --- | --- |
| [**discerns**](plugins/discerns/) | `discerns@discerns` | Write in your voice, manage relationships, capture & recall knowledge, and grow your brain. |

## Repository layout

```
.claude-plugin/marketplace.json   # the catalog (lists every plugin)
plugins/<name>/                    # one self-contained plugin per directory
  .claude-plugin/plugin.json       #   manifest
  .mcp.json, skills/, assets/, README.md, LICENSE
.github/workflows/validate.yml     # CI: validates the catalog + every plugin
```

## Add another plugin

1. Create `plugins/<name>/` with a `.claude-plugin/plugin.json` (set `name`) and its components (`skills/`, `.mcp.json`, etc.).
2. Add an entry to `.claude-plugin/marketplace.json`:
   ```json
   { "name": "<name>", "source": "./plugins/<name>", "description": "…" }
   ```
3. That's it — CI validates the new plugin automatically, and users install it with `/plugin install <name>@discerns`.

## License

MIT — see [LICENSE](LICENSE).
