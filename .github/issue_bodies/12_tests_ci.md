Title: Tests & CI integration

Specs: specs/game-spec.md

Summary:
Add Jest tests for pure logic modules, ESLint config and a GitHub Actions workflow to run lint + test on push/PR.

Acceptance criteria:
- .github/workflows/ci.yml present and runs npm run lint && npm test.
- Local npm run lint && npm test pass.
- Tests cover collision and spawn logic.
