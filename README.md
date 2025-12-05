Enduro-style 2D Obstacle Racing (vanilla JS)

Spec generated: 2025-12-05T14:34:27.990Z

Deployment notes
- This repo uses GitHub Actions Pages deployment (upload artifact + deploy-pages) via .github/workflows/deploy.yml.
- The workflow publishes the contents of the `docs/` folder on push to `main` and the Pages site will be available at: https://<your-username>.github.io/enduro/ after the Action completes.
- Ensure Pages is configured to use "GitHub Actions" as the source in the repository Settings → Pages (this is the recommended long-term setup so the workflow won't need changes).

Overview
A lightweight, dependency-free browser prototype inspired by Atari Enduro. The game uses HTML5 <canvas> and plain ES modules to implement a 2D top-down/pseudo-3D obstacle racing game with 4 progressive phases and an 8-bit pixel-art visual style.

What exists (specs)
- specs/game-spec.md — full game design, controls (desktop + mobile), phases, CI and deployment notes
- specs/issue-templates-spec.md — description of issue templates
- .github/ISSUE_TEMPLATE/* — actual templates (bug_report.md, feature_request.md, idea.md)

Development notes
- No build step by default; the game runs as static files served by any static server.
- Recommended local quick server (choose one):
  - npx serve .  # serve current directory (recommended for simple preview)
  - npx http-server . -p 8080  # alternative

Node & npm (optional)
- If npm is used, add package.json and scripts:
  - "lint": "eslint \"src/**/*.js\""
  - "test": "jest"
  - "start": "npx serve ."
- CI is configured via GitHub Actions in specs; see specs/game-spec.md for suggested workflows.

GitHub Pages
- The spec describes two deploy approaches: using docs/ or gh-pages branch via actions. Place built or static files in docs/ for the simplest setup.

Issue workflow
- Specs are the source of truth. Before coding, convert specs into issues (one per major task/feature) so work is tracked.
- Example: use `gh issue create -F specs/game-spec.md --title "Game: Enduro spec"` to open an issue from a spec file.

Copilot CLI & workflow notes
- When using GitHub Copilot CLI with this repo, pushing commits is considered a manual task for the repository owner.
- Always run lint and tests locally before creating commits or asking Copilot to propose changes. Example:
  - npm run lint && npm test
- For quick previews, using npx to run a static server is supported (see "Development notes" above).

Recommended local workflow (developer-controlled)
1. Create a branch for the task.
2. Implement changes locally and run: npm run lint && npm test
3. Stage commits and prepare a descriptive commit message.
4. Push the branch (manual) and open a PR for review.

Contact / further instructions
- See .github/copilot-instructions.md for guidance on using Copilot CLI in this repo.
- See specs/ for detailed game planning.
