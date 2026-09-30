# GitHub Copilot — Project Instructions

All project instructions for AI agents live in [AGENTS.md](../AGENTS.md) at the repository root (rules, workflow, commands, architecture, controls). Copilot also reads AGENTS.md directly. Edit AGENTS.md, not this file.

Key rule repeated here: **never run `git push`** — commits are fine, pushing is done manually by the repository owner.

## Copilot CLI notes

- Whitelist the repo for file access in interactive sessions: `/add-dir .`
- Useful commands: `/help`, `/add-dir <dir>`, `/delegate <prompt>` (drafts a change/PR; pushing is still manual), `/exit`.
- Create issues from specs with the GitHub CLI, e.g. `gh issue create -F specs/<topic>-spec.md --title "..."`, following the issue format in AGENTS.md.
