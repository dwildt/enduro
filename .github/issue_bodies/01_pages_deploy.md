Title: GitHub Pages: initial deploy workflow

Specs: specs/game-spec.md

Summary:
Add a GitHub Actions workflow to publish the site to GitHub Pages (docs/ or gh-pages) and validate an end-to-end hello-world deployment that serves index.html.

Acceptance criteria:
- .github/workflows/deploy.yml exists and publishes the docs/ folder (or uses actions-gh-pages to push gh-pages).
- README updated with Pages instructions.
- CI runs npm run lint && npm test successfully (tests may be placeholders).

Notes:
This is the first task; it should be green on Actions and serve a simple index.html as proof.
