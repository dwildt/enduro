GitHub Copilot CLI — Project Instructions

This file documents recommended usage of GitHub Copilot CLI in the Enduro project.

Key principles
- Pushes are manual: any git push or final publishing step must be performed by the repository owner/maintainer. Do not rely on Copilot CLI to push changes automatically.
- Tests and lint first: always run linting and tests locally before proposing changes or creating commits. Example:
  - npm run lint && npm test

Allowing file access
- Copilot CLI reads instruction files from these locations (priority order):
  - .github/instructions/**/*.instructions.md
  - .github/copilot-instructions.md
  - AGENTS.md
  - Other supported locations
- To allow Copilot CLI to access the repository files during an interactive session, use the `/add-dir` command to whitelist the repo root or specific subdirectories, for example:
  - /add-dir .

Typical commands (interactive)
- /help — show available interactive commands
- /add-dir <directory> — add directory for file access
- /delegate <prompt> — ask Copilot CLI to create a PR or change proposal (note: pushing is still manual unless explicitly approved)
- /exit or /quit — exit the CLI

Recommended Copilot-assisted workflow for this repo
1. Prepare: ensure lint and tests pass locally.
   - npm run lint && npm test
2. Start Copilot CLI (if using interactive features) and whitelist files:
   - /add-dir .
3. Ask Copilot CLI to draft changes or a PR for a given task (example):
   - /delegate "Implement obstacle spawner based on specs/game-spec.md"
4. Review generated changes locally. Run lint and tests against generated code.
5. When satisfied, commit locally and push manually:
   - git add -A
   - git commit -m "feat: implement obstacle spawner"
   - git push origin your-branch
6. Open a PR on GitHub for review.

Creating issues from specs
- Use the GitHub CLI to convert a spec into an issue, for example:
  - gh issue create -F specs/game-spec.md --title "Game: Enduro — Design spec"
- The developer should triage/label the issue and assign tasks before implementing.

CI & pre-push checks
- CI (GitHub Actions) is configured to run lint and tests on push/PR. Locally, ensure lint/test pass before pushing to avoid broken CI.

Notes on npx usage
- npx is useful for running one-off tools without global installs, e.g. `npx serve .` for a quick static preview.
- When Copilot CLI suggests running npx commands or creating scripts, validate them locally and re-run tests/lint after changes.

Support / further reading
- Copilot CLI help: use `/help` within the interactive CLI or consult the Copilot CLI docs.
